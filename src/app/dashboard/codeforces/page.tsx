"use client";

import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, AlertCircle, User, RefreshCw } from "lucide-react";
import Chart from "chart.js/auto";
import ActivityHeatMapCF from "@/app/components/Dashboard/ActivityHeatMapCF";
import { getCodeForcesDetails } from "@/services/platform";
import { useProfileStore } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";
import CodeforcesAnalytics from "@/app/components/Dashboard/CodeForceContest";

const CodeForces = () => {
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const [codeForcesData, setCodeForcesData] = useState<any>(null);

  const [questions, setQuestions] = useState([]);
    const user = useProfileStore((state) => state.user);
    const token:string|null = useAuthStore((state) => state.token);
    if (!token) {
  throw new Error("No token available");
}
const chartRef = useRef<HTMLCanvasElement | null>(null);
const chartInstanceRef = useRef<Chart | null>(null);

  // Check if username exists
  const hasUsername = user?.codeforcesURL && user.codeforcesURL.trim() !== "";

  // Fetch codefroces details
  useEffect(() => {
    if (!hasUsername) return;

    const fetchCodeForcesDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const username = user.codeforcesURL;
        const details = await getCodeForcesDetails(username, token);
        setCodeForcesData(details);
        setQuestions(details?.data?.recentlySolved?.problems|| []);
      
        
      } catch (error) {
        console.error("Error fetching CodeForces details:", error);
        setError("Failed to fetch CodeForces data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

      fetchCodeForcesDetails();
  }, [hasUsername, user?.codeforcesURL, token]);
 
  const NoUsernameScreen = () => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
              CodeForces Analytics
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Connect your CodeForces profile to view your coding progress and
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
              Please provide your CodeForces username in your profile settings to
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

 
  const LoadingScreen = () => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
  CodeForces Analytics
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
              Please wait while we fetch your CodeForces statistics...
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
                  {user?.codeforcesURL}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const ErrorScreen = () => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Unable to Load Data
            </h1>
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

  if (!hasUsername) {
    return <NoUsernameScreen />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

   if (!codeForcesData) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen />;
  }

 
  const baseStats = [
    {
      level: "Easy",
      solved: codeForcesData?.difficultyStats?.Easy,
      total: codeForcesData?.totalQuestions?.Easy,
      color: "text-green-400",
      bgColor: "bg-green-400",
      strokeColor: "stroke-green-400",
      chartColor: "#4ade80",
      details: {
  accuracy:
   codeForcesData?.difficultyStats?.Easy!== undefined &&
    codeForcesData?.totalQuestions?.Easy
      ? Math.round(
          (codeForcesData?.difficultyStats?.Easy/
            codeForcesData?.totalQuestions?.Easy) *
            100
        ) + "%"
      : "N/A",
  topics: ["Arrays", "Strings", "Hash Tables"],
},

    },
    {
      level: "Medium",
      solved: codeForcesData?.difficultyStats?.Medium,
      total: codeForcesData?.totalQuestions?.Medium,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400",
      strokeColor: "stroke-yellow-400",
      chartColor: "#facc15",
      details: {
         accuracy:
    codeForcesData?.difficultyStats?.Medium!== undefined &&
    codeForcesData?.totalQuestions?.Medium
      ? Math.round(
          ( codeForcesData?.difficultyStats?.Medium/
            codeForcesData?.totalQuestions?.Medium) *
            100
        ) + "%"
      : "N/A",
        topics: ["Trees", "DP", "Graphs"],
      },
    },
    {
      level: "Hard",
      solved:  codeForcesData?.difficultyStats?.Hard,
      total: codeForcesData?.totalQuestions?.Hard,
      color: "text-red-400",
      bgColor: "bg-red-400",
      strokeColor: "stroke-red-400",
      chartColor: "#f87171",
      details: {
         accuracy:
   codeForcesData?.difficultyStats?.Hard!== undefined &&
   codeForcesData?.totalQuestions?.Hard
      ? Math.round(
          ( codeForcesData?.difficultyStats?.Hard /
            codeForcesData?.totalQuestions?.Hard) *
            100
        ) + "%"
      : "N/A",
        topics: ["Advanced Algorithms", "System Design"],
      },
    },
    {
      level: "Unrated",
      solved:  codeForcesData?.difficultyStats?.Unrated,
      total: codeForcesData?.totalQuestions?.Unrated,
      color: "text-orange-100",
      bgColor: "bg-yellow-100",
      strokeColor: "stroke-yellow-100",
      chartColor: "#f07179",
      details: {
         accuracy:
   codeForcesData?.difficultyStats?.Unrated!== undefined &&
   codeForcesData?.totalQuestions?.Unrated
      ? Math.round(
          ( codeForcesData?.difficultyStats?.Unrated /
            codeForcesData?.totalQuestions?.Unrated) *
            100
        ) + "%"
      : "N/A",
        topics: ["Advanced Algorithms", "System Design"],
      },
    },
  ];

  // Calculate totals dynamically
  const totalSolved = baseStats.reduce((acc, stat) => acc + stat.solved, 0);
  const totalQuestions = baseStats.reduce((acc, stat) => acc + stat.total, 0);
  const totalRecentSolved = baseStats.reduce(
    (acc, stat:any) => acc + stat.details.recentSolved,
    0
  );

  const questionStats = [
    ...baseStats,
    {
      level: "Total",
      solved: totalSolved,
      total: totalQuestions,
      color: "text-purple-400",
      bgColor: "bg-purple-400",
      strokeColor: "stroke-purple-400",
      chartColor: "#c084fc",
      details: {
        accuracy: `${Math.round((totalSolved / totalQuestions) * 100)}%`,
        avgTime: "22 min",
        recentSolved: totalRecentSolved,
        topics: ["All Topics", "Mixed Practice"],
      },
    },
  ];

  const CodeForcesDonut = () => {
    // Filter out the "Total" entry for chart display
    const chartData = questionStats.filter((stat) => stat.level !== "Total");

    const chartTotalSolved = chartData.reduce(
      (acc, stat) => acc + stat.solved,
      0
    );
 useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    // Destroy existing chart
    chartInstanceRef.current?.destroy();

    // Create new chart
    chartInstanceRef.current = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: chartData.map((stat) => stat.level),
        datasets: [
          {
            data: chartData.map((stat) => stat.solved),
            backgroundColor: chartData.map((stat) => stat.chartColor),
            borderColor: "#1f2937",
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#374151",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "#6b7280",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const stat = chartData[context.dataIndex];
                return `${stat.level}: ${stat.solved}/${stat.total}`;
              },
            },
          },
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const index = activeElements[0].index;
            const clickedStat = chartData[index];
            setSelectedSegment(
              selectedSegment?.level === clickedStat.level ? null : clickedStat
            );
          }
        },
        onHover: (event: any, activeElements) => {
          event.native.target.style.cursor =
            activeElements.length > 0 ? "pointer" : "default";
        },
      },
    });

    // Cleanup on unmount
    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [chartData, selectedSegment]);

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-40 lg:h-40 xl:w-48 xl:h-48 mb-4">
          <canvas ref={chartRef} />
          {/* Center text overlay */}
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold text-white">
              {chartTotalSolved}
            </span>
            <span className="text-xs sm:text-sm text-gray-400">Solved</span>
          </div>
        </div>

        {/* Legend or Details */}
        {!selectedSegment ? (
          <div className="space-y-2 w-full">
            {questionStats.map((stat:any, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                onClick={() => setSelectedSegment(stat)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: stat.chartColor }}
                  />
                  <span className="font-medium">{stat.level}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white font-semibold">
                    {stat.solved}/{stat.total}
                  </span>
                  <span className="text-xs text-gray-400">
                    {Math.round((stat.solved / stat.total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-4 mt-2 shadow-lg border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-bold text-lg ${selectedSegment.color}`}>
                {selectedSegment.level} Problems
              </h4>
              <button
                onClick={() => setSelectedSegment(null)}
                className="text-gray-400 hover:text-white text-xl hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <span className="text-gray-400 block text-xs">Solved</span>
                <span className="text-white font-semibold text-lg">
                  {selectedSegment.solved}/{selectedSegment.total}
                </span>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <span className="text-gray-400 block text-xs">Accuracy</span>
                <span className="text-white font-semibold text-lg">
                  {selectedSegment.details.accuracy}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-sm font-medium">
                Top Topics:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSegment.details.topics.map((topic:any, idx:number) => (
                  <span
                    key={idx}
                    className="text-xs bg-gradient-to-r from-gray-600 to-gray-500 px-3 py-1 rounded-full text-white shadow-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

const toggleViewAll = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
  e.preventDefault();
  setShowAllQuestions(!showAllQuestions);
};
  // Get questions to display based on current state
  const displayedQuestions = showAllQuestions
    ? questions
    : questions.slice(0, 5);

  // Function to handle topic tag click
  const handleTopicClick = (e:any, slug:any) => {
    e.stopPropagation(); 

    window.open(`/topics/${slug}`, "_blank");
  };

  // Function to handle question click
  const handleQuestionClick = (url:any) => {
    window.open(url, "_blank");
  };

  const getDifficultyColor = (difficulty:any) => {
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

  // Main dashboard render (your existing JSX)
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                CodeForces Analytics
              </h1>
              <p className="text-gray-400 text-sm md:text-base mt-1">
                Track your coding progress and performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <img src={codeForcesData?.data?.userAvatar} />
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
                  {codeForcesData?.difficultyStats?.Easy}
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
                  {codeForcesData?.difficultyStats?.Medium}
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
                  {codeForcesData?.difficultyStats?.Hard}
                </h1>
              </div>
            </div>

            

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">#</span>
                </div>
                <p className="text-blue-400 text-sm font-medium mb-1">
                 Current Rating
                </p>
                <h1 className="text-2xl font-bold text-white">
                   {codeForcesData?.data?.profile?.rating}
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
                      {user?.codeforcesURL || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                     Rank
                    </span>
                    <span className="text-white font-medium">
                      {codeForcesData?.data?.profile?.rank}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Contribution</span>
                    <span className="text-white font-medium">
                    {codeForcesData?.data?.profile?.contribution}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                    Freinds
                    </span>
                    <span className="text-white font-medium">
                     {codeForcesData?.data?.profile?.friendOfCount}
                          </span>
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
            <ActivityHeatMapCF heatmapData={codeForcesData?.data?.heatmap} /> 
            
          </div>

          {/* Question Statistics */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-white">
                Question Stats
              </h3>
            </div>
            <CodeForcesDonut />
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
                      Rating
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 w-1/3 min-w-[160px]">
                      Topic Tags
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {displayedQuestions.map((question:any, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => handleQuestionClick(question.url)}
                    >
                      <td className="py-3 px-2 text-sm text-gray-300 font-mono">
                        {question.problemId}
                      </td>
                      <td className="py-3 px-2 text-sm text-white font-medium hover:text-blue-400 transition-colors">
                        <div
                          className="truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px]"
                          title={question.name}
                        >
                          {question.name}
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
                        {question.rating}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-300">
                        <div className="flex flex-wrap gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                         {question.tags.slice(0, 3).map((tag: any, tagIndex: number) => (
                         <span
                            key={tag.slug || tag}
                             onClick={(e) => handleTopicClick(e, tag.slug || tag)}
                            className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 cursor-pointer transition-colors whitespace-nowrap"
                               title={tag}
                                            >
                                  {tag}
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
    
          <CodeforcesAnalytics ratingHistory={codeForcesData?.data?.ratingHistory} /> 
        </div>
      </div>
    </div>
  );
};

export default CodeForces;
