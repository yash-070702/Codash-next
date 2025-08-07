import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { getEnhancedProfileData} from "@/lib/gfg";
import { calculateTotalQuestions } from "@/lib/gfg";
import { generateHeatmapData } from "@/lib/gfg";
import { generateEmptyHeatmapData } from "@/lib/gfg";
import { generateInsights } from "@/lib/gfg";
import { calculateProfileCompleteness } from "@/lib/gfg";
import { calculateActivityMetrics } from "@/lib/gfg";
import { getDifficultyAnalysis } from "@/lib/gfg";


const BASE_URL = "https://geeks-for-geeks-api.vercel.app";


interface Params {
  username: string;
}

interface EnhancedProfile {
  profileImageUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  joinDate?: string | null;
  badges?: string[];
  following?: number;
  followers?: number;
}


export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  // Await the params since they're now asynchronous in Next.js 15+
  const { username } = await context.params;

  if (!username) {
    return NextResponse.json(
      {
        success: false,
        message: 'LeetCode username is required',
      },
      { status: 400 }
    );
  }

  try {
    const profileResponse = await axios.get(`${BASE_URL}/${username}`);
    const { info, solvedStats } = profileResponse.data;

    if (!info || !info.userName) {
      return NextResponse.json(
        { success: false, message: "GFG user not found or invalid username" },
        { status: 404 }
      );
    }

    const year = new Date().getFullYear();
    let calendar: any = {};
    let heatmapData: any = [];

    try {
      const calendarResponse = await axios.get(
        `${BASE_URL}/${username}/calendar?year=${year}`
      );
      calendar = calendarResponse.data;
      heatmapData = generateHeatmapData(calendar, year);
    } catch {
      heatmapData = generateEmptyHeatmapData(year);
    }

    let enhancedProfile: EnhancedProfile = {};
    try {
      enhancedProfile = await getEnhancedProfileData(username);
    } catch {}

    const totalQuestionsCount = calculateTotalQuestions(solvedStats);
    const insights = generateInsights(solvedStats, calendar, info);
    const difficultyAnalysis = getDifficultyAnalysis(solvedStats);
    const activityMetrics = calculateActivityMetrics(calendar);

    return NextResponse.json({
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
    });
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return NextResponse.json(
        {
          success: false,
          message: "GFG user not found or API doesn't support this username yet",
          error: error.response.data,
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch GFG details",
        error: error.message,
      },
      { status: 500 }
    );
  }
}








