"use client";

import React, { useState, useEffect, useRef, MouseEvent } from "react";
import { MoreHorizontal, AlertCircle, User, RefreshCw } from "lucide-react";
import * as Chart from "chart.js";
import ActivityHeatmap from "@/app/components/Dashboard/ActivityHeatmap";
import { getCodeChefDetails } from "../../../services/platform";
import { useProfileStore } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";

// Register Chart.js components (ChartJS 4+)
Chart.Chart.register(
  Chart.ArcElement,
  Chart.Tooltip,
  Chart.Legend,
  Chart.DoughnutController
);

interface TopicTag {
  name: string;
  slug: string;
}

interface Question {
  id: string | number;
  title: string;
  difficulty: string; // "Easy" | "Medium" | "Hard" | etc.
  acceptanceRate?: string;
  topicTags: TopicTag[];
  url: string;
}

interface CodeChefData {
  data?: {
    latestQuestions?: Question[];
    avatar?: string;
    globalRank?: string | number;
    institute?: string;
    contestCount?: string | number;
    countryRank?: string | number;
    heatmap?: any;
    totalSolved?: number;
  };
}

const CodeChef: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [showAllQuestions, setShowAllQuestions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [codeChefData, setCodeChefData] = useState<CodeChefData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Redux selectors (assumed typed accordingly)
     const user = useProfileStore((state) => state.user);
     const token:string|null = useAuthStore((state) => state.token);
        if (!token) {
  throw new Error("No token available");
        }

  // Check if username exists
  const hasUsername = user?.codeChefURL && user.codeChefURL.trim() !== "";

  // Fetch CodeChef details
  useEffect(() => {
    if (!hasUsername) return;

    const fetchCodeChefDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const username = user.codeChefURL;
        const details = await getCodeChefDetails(username, token);
        setCodeChefData(details);
        setQuestions(details?.data?.latestQuestions || []);
      } catch (err) {
        console.error("Error fetching CodeChef details:", err);
        setError("Failed to fetch CodeChef data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodeChefDetails();
  }, [hasUsername, user?.codeChefURL, token]);

   const NoUsernameScreen = () => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              CodeChef Analytics
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Connect your CodeChef profile to view your coding progress and
              performance analytics
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 shadow-lg border border-gray-700 max-w-md w-full">
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">
                Username Required
              </h2>
            </div>

            <p className="text-gray-300 mb-6 text-center">
              Please provide your CodeChef username in your profile settings to
              view your analytics dashboard.
            </p>

            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">
                  What you'll get:
                </h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Problem solving statistics</li>
                  <li>• Activity heatmap</li>
                  <li>• Performance analytics</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>

              <button
                onClick={() => (window.location.href = "/edit-profile")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Go to Profile Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading Screen
  
  const LoadingScreen = () => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                CodeChef Analytics
              </h1>
              <p className="text-gray-400 text-sm md:text-base mt-1">
                Fetching your coding progress and performance...
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white animate-spin" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Loading Your Data
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Please wait while we fetch your CodeChef statistics...
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700 max-w-md w-full">
            <div className="space-y-4">
              {/* Loading skeleton */}
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>

              <p className="text-gray-400 text-sm text-center">
                Fetching data for:{" "}
                <span className="text-white font-medium">
                  {user?.codeChefURL}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Error Screen
  const ErrorScreen = () => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen p-4 md:p-6">
/*************  ✨ Windsurf Command 🌟  *************/
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Unable to Load Data
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              {/* Display the error message */}
              {error}
            </p>
            <p className="text-gray-400 text-lg mb-8 max-w-md">{error}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 shadow-lg border border-gray-700 max-w-md w-full">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  const toggleViewAll = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowAllQuestions((prev) => !prev);

    };


  const handleTopicClick = (e: MouseEvent<HTMLSpanElement>, slug: string) => {
    e.stopPropagation(); // Prevent row click
    window.open(`/topics/${slug}`, "_blank");
  };


  const handleQuestionClick = (url: string) => {
    window.open(url, "_blank");
  };

 
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "Hard":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  // Determine which questions to show
  const displayedQuestions = showAllQuestions ? questions : questions.slice(0, 3);

  // Render appropriate screen or main dashboard
  if (!hasUsername) return <NoUsernameScreen />;
  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

   return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                CodeChef Analytics
              </h1>
              <p className="text-gray-400 text-sm md:text-base mt-1">
                Track your coding progress and performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <img src={codeChefData?.data?.avatar} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <p className="text-green-400 text-sm font-medium mb-1">
                  Easy Solved
                </p>
                <h1 className="text-2xl font-bold text-white">
                  Not EnoughData
                </h1>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <p className="text-yellow-400 text-sm font-medium mb-1">
                  Medium Solved
                </p>
                <h1 className="text-2xl font-bold text-white">
                  Not EnoughData
                </h1>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <p className="text-red-400 text-sm font-medium mb-1">
                  Hard Solved
                </p>
                <h1 className="text-2xl font-bold text-white">
                 Not EnoughData
                </h1>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">#</span>
                </div>
                <p className="text-blue-400 text-sm font-medium mb-1">
                  Global Rank
                </p>
                <h1 className="text-2xl font-bold text-white">
                  {codeChefData?.data?.globalRank || "N/A"}
                </h1>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-700">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">P</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Profile Details
                  </h3>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Username</span>
                    <span className="text-white font-medium">
                      {user?.codeChefURL || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Country
                    </span>
                    <span className="text-white font-medium">
                      {
                        codeChefData?.data?.institute
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Contest Count</span>
                    <span className="text-white font-medium">
                      {codeChefData?.data?.contestCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Country Rank
                    </span>
                    <span className="text-white font-medium">{codeChefData?.data?.countryRank || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
          {/* Activity Heatmap */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
            <ActivityHeatmap heatmapData={codeChefData?.data?.heatmap} />

          </div>

          {/* Question Statistics */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-white">
                Question Stats
              </h3>
            </div>
            <div className="flex items-center  justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-white">
               Total Count of solved questions:
               <p className="text-5xl text-center mt-10"> {codeChefData?.data?.totalSolved}</p>
              </h3>            
            </div>
           
            {/* <CodeChefDonut /> */}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions Details */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-white">
                Recent Solved Questions
              </h3>
              <button onClick={toggleViewAll} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                {showAllQuestions ? "View Less" : "View All"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 whitespace-nowrap w-16">
                      ID
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 w-1/3 min-w-[180px]">
                      Title
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 whitespace-nowrap w-20">
                      Difficulty
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 whitespace-nowrap w-20">
                      Acceptance
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 w-1/3 min-w-[160px]">
                      Topic Tags
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {displayedQuestions.map((question, index) => (
                    <tr
                      key={question.id}
                      className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => handleQuestionClick(question.url)}
                    >
                      <td className="py-3 px-2 text-sm text-gray-300 font-mono">
                        {question.id}
                      </td>
                      <td className="py-3 px-2 text-sm text-white font-medium hover:text-blue-400 transition-colors">
                        <div
                          className="truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px]"
                          title={question.title}
                        >
                          {question.title}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getDifficultyColor(
                            question.difficulty
                          )}`}
                        >
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-300 whitespace-nowrap">
                        {question.acceptanceRate}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-300">
                        <div className="flex flex-wrap gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                          {question.topicTags.map((tag, tagIndex) => (
                            <span
                              key={tag.slug}
                              onClick={(e) => handleTopicClick(e, tag.slug)}
                              className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 cursor-pointer transition-colors whitespace-nowrap"
                              title={tag.name}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contest Details */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-white">
                Contest Details
              </h3>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏆</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  No contest data available
                </p>
                <p className="text-gray-500 text-xs">
                  Participate in contests to see your stats here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeChef;
