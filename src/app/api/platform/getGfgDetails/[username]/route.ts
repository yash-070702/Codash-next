import axios from "axios";
import { NextRequest, NextResponse } from 'next/server';
import {
  generateHeatmapData,
  generateEmptyHeatmapData,
  getEnhancedProfileData,
  calculateTotalQuestions,
  generateInsights,
  getDifficultyAnalysis,
  calculateActivityMetrics,
  calculateProfileCompleteness,
} from "@/lib/gfg"; // Adjust path as needed

const BASE_URL = "https://practiceapi.geeksforgeeks.org/api/v1/user";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  // Await the params since they're now asynchronous in Next.js 15+
  const { username } = await context.params;

  if (!username) {
    return Response.json(
      { success: false, message: "GFG username is required" },
      { status: 400 }
    );
  }

  try {
    const profileResponse = await axios.get(`${BASE_URL}/${username}`);
    const { info, solvedStats } = profileResponse.data;

    if (!info || !info.userName) {
      return Response.json(
        {
          success: false,
          message: "GFG user not found or invalid username",
        },
        { status: 404 }
      );
    }

    const year = new Date().getFullYear();
    let calendar = {};
    let heatmapData:any = [];

    try {
      const calendarResponse = await axios.get(
        `${BASE_URL}/${username}/calendar?year=${year}`
      );
      calendar = calendarResponse.data;
      heatmapData = generateHeatmapData(calendar, year);
    } catch (calendarError:any) {
      console.warn("Calendar data not available:", calendarError.message);
      heatmapData = generateEmptyHeatmapData(year);
    }

    let enhancedProfile:any = {};
    try {
      enhancedProfile = await getEnhancedProfileData(username);
    } catch (error:any) {
      console.warn("Enhanced profile data not available:", error.message);
    }

    const totalQuestionsCount = calculateTotalQuestions(solvedStats);
    const insights = generateInsights(solvedStats, calendar, info);
    const difficultyAnalysis = getDifficultyAnalysis(solvedStats);
    const activityMetrics = calculateActivityMetrics(calendar);

    return Response.json(
      {
        success: true,
        message: "GFG data fetched successfully",
        data: {
          profile: {
            username: info.userName,
            fullName: info.fullName,
            institution: info.institution,
            rank: info.rank,
            score: info.score,
            streak: info.streak,
            totalProblemsSolved: info.totalSolved,
            totalQuestionsCount,
            profileImageUrl: enhancedProfile.profileImageUrl || null,
            bio: enhancedProfile.bio || null,
            location: enhancedProfile.location || null,
            joinDate: enhancedProfile.joinDate || null,
            badges: enhancedProfile.badges || [],
            following: enhancedProfile.following || 0,
            followers: enhancedProfile.followers || 0,
            profileCompleteness: calculateProfileCompleteness(
              info,
              enhancedProfile
            ),
          },
          solvedStats,
          calendar,
          heatmap: heatmapData,
          insights,
          difficultyAnalysis,
          activityMetrics,
        },
      },
      { status: 200 }
    );
  } catch (error:any) {
    const status = error.response?.status || 500;
    const message =
      status === 404
        ? "GFG user not found or API doesn't support this username yet"
        : "Failed to fetch GFG details";

    return Response.json(
      {
        success: false,
        message,
        error: error.response?.data || error.message,
      },
      { status }
    );
  }
}
