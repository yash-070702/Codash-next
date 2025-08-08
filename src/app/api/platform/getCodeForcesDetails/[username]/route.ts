import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { generateCfHeatmap, generateDifficultyStats, getRecentlySolvedProblems } from '@/lib/codeforces';





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
    // Fetch user info
    const userInfoResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
    const user = userInfoResponse.data.result?.[0];

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Codeforces user not found",
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch rating history
    const ratingResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${username}`);
    const ratingHistory = ratingResponse.data.result;

    // Fetch submissions for heatmap and difficulty stats
    const submissionsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
    const submissions = submissionsResponse.data.result;

    const heatmap = generateCfHeatmap(submissions);
    const difficultyStats = generateDifficultyStats(submissions);
    const recentlySolved = getRecentlySolvedProblems(submissions);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Codeforces data fetched successfully",
        data: {
          profile: {
            username: user.handle,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            rank: user.rank,
            maxRank: user.maxRank,
            rating: user.rating,
            maxRating: user.maxRating,
            country: user.country || "",
            organization: user.organization || "",
            contribution: user.contribution,
            friendOfCount: user.friendOfCount,
          },
          ratingHistory,
          heatmap,
          difficultyStats,
          recentlySolved,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch Codeforces data",
        error: error.message || 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}




