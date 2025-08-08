
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fetchHistoricalSubmissions } from '@/lib/leetcode';
import { fillMissingDates } from '@/lib/leetcode';
import { fetchLeetCodeQuestionCounts } from '@/lib/leetcode';
import { calculateHeatmapStatistics } from '@/lib/leetcode';

type Submission = {
  date: string;
  count: number;
};
type HeatmapData = {
  activeYears: string[];
  submissionsByDate: Submission[];
  statistics: Statistics;
};
type StreakRange = {
  start: string;
  end: string;
  length: number;
};

// type YearlyStat = {
//   totalSubmissions: number;
//   activeDays: number;
//   maxSubmissionsInDay: number;
//   averageSubmissionsPerDay: string;
//   activeMonths: number;
// };
type Statistics = {
  totalSubmissions: number;
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
  maxSubmissionsInDay: number;
  averageSubmissionsPerDay: number;
  streakRanges: StreakRange[];
  monthlyStats: MonthlyStats;
  yearlyStats: YearlyStats;
};
type MonthlyStats = {
  [month: string]: {
    total: number;
    days: number;
    average: number;
  };
};

type YearlyStats = {
  [year: string]: {
    total: number;
    days: number;
    average: number;
  };
};
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
    const graphqlUrl = 'https://leetcode.com/graphql';
    const leetCodeStats = await fetchLeetCodeQuestionCounts();

    // Step 1: Profile Query
    const profileQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              school
              countryName
              ranking
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username },
    };

    const profileResponse = await axios.post(graphqlUrl, profileQuery, {
      headers: { 'Content-Type': 'application/json' },
    });

    const user = profileResponse.data?.data?.matchedUser;

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'LeetCode user not found',
        },
        { status: 404 }
      );
    }

    const submissions: Record<string, number> = {};
    user.submitStatsGlobal.acSubmissionNum.forEach(({ difficulty, count }: any) => {
      submissions[difficulty] = count;
    });

    const profileUrl = `https://leetcode.com/${username}/`;
    let recentSolved: any[] = [];

    try {
      const { data: html } = await axios.get(profileUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
        },
      });

      const $ = cheerio.load(html);
      const nextDataScript = $('#__NEXT_DATA__').html();

      if (nextDataScript) {
        const nextData = JSON.parse(nextDataScript);
        const recentRaw =
          nextData?.props?.pageProps?.profileData?.recentSubmissionList;

        if (Array.isArray(recentRaw)) {
          recentSolved = recentRaw
            .filter((item: any) => item.statusDisplay === 'Accepted')
            .map((item: any) => ({
              title: item.title,
              url: `https://leetcode.com/problems/${item.titleSlug}/`,
              lang: item.lang,
              timestamp: new Date(item.timestamp * 1000).toISOString(),
            }))
            .slice(0, 10);
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch recent submissions:', err.message);
    }

    // Step 4: Heatmap Calendar
   let heatmap: HeatmapData = {
  activeYears: [],
  submissionsByDate: [],
  statistics: {
    totalSubmissions: 0,
    totalActiveDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    maxSubmissionsInDay: 0,
    averageSubmissionsPerDay: 0,
    streakRanges: [],
    monthlyStats: {},
    yearlyStats: {},
  },
};

    try {
      const activeYearsQuery = {
        query: `
          query userCalendar($username: String!) {
            matchedUser(username: $username) {
              userCalendar {
                activeYears
                submissionCalendar
              }
            }
          }
        `,
        variables: { username },
      };

      const activeYearsResponse = await axios.post(graphqlUrl, activeYearsQuery, {
        headers: { 'Content-Type': 'application/json' },
      });

      const calendarData =
        activeYearsResponse.data?.data?.matchedUser?.userCalendar;

      if (calendarData) {
        let allSubmissions: any[] = [];
        let activeYears = calendarData.activeYears || [];

        if (activeYears.length === 0 && calendarData.submissionCalendar) {
          const rawCalendar = JSON.parse(calendarData.submissionCalendar);
          const timestamps = Object.keys(rawCalendar).map((ts) => parseInt(ts));
          if (timestamps.length > 0) {
            const years = timestamps.map((ts) =>
              new Date(ts * 1000).getFullYear()
            );
            activeYears = [...new Set(years)].sort();
          }
        }

        if (calendarData.submissionCalendar) {
          const rawCalendar = JSON.parse(calendarData.submissionCalendar);
          const submissionsByDate = Object.entries(rawCalendar).map(
            ([timestamp, count]: any) => ({
              date: new Date(Number(timestamp) * 1000)
                .toISOString()
                .split('T')[0],
              count: Number(count),
            })
          );
          allSubmissions = submissionsByDate;
        }

        if (activeYears.length > 0) {
          const historicalData = await fetchHistoricalSubmissions(
            graphqlUrl,
            username,
            activeYears
          );
          if (historicalData.length > 0) {
            const existingDates = new Set(allSubmissions.map((s) => s.date));
            const newData = historicalData.filter((h) => !existingDates.has(h.date));
            allSubmissions = [...allSubmissions, ...newData];
          }
        }

        if (allSubmissions.length > 0) {
       const earliestDate = new Date(
  Math.min(...allSubmissions.map((s) => new Date(s.date).getTime()))
);

const latestDate = new Date(
  Math.max(...allSubmissions.map((s) => new Date(s.date).getTime()))
);
          const filledSubmissions = fillMissingDates(
            allSubmissions,
            earliestDate,
            latestDate
          );
          const dataYears = [
            ...new Set(
              filledSubmissions.map((s) => new Date(s.date).getFullYear())
            ),
          ].sort();
          if (dataYears.length > activeYears.length) {
            activeYears = dataYears;
          }

          const stats = calculateHeatmapStatistics(filledSubmissions);
          heatmap = {
            activeYears,
            submissionsByDate: filledSubmissions,
            statistics: stats,
          };
        }
      }
    } catch (calendarErr: any) {
      console.warn('Could not fetch calendar data:', calendarErr.message);
    }

    let latestQuestions = [];
    try {
      const questionsQuery = {
        query: `
          query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
            problemsetQuestionList: questionList(
              categorySlug: $categorySlug
              limit: $limit
              skip: $skip
              filters: $filters
            ) {
              total: totalNum
              questions: data {
                acRate
                difficulty
                freqBar
                frontendQuestionId: questionFrontendId
                isFavor
                paidOnly: isPaidOnly
                status
                title
                titleSlug
                topicTags {
                  name
                  id
                  slug
                }
                hasSolution
                hasVideoSolution
              }
            }
          }
        `,
        variables: {
          categorySlug: "",
          skip: 0,
          limit: 50,
          filters: {},
        },
      };

      const questionsResponse = await axios.post(graphqlUrl, questionsQuery, {
        headers: { "Content-Type": "application/json" },
      });

      const questionsData = questionsResponse.data?.data?.problemsetQuestionList;

      if (questionsData && questionsData.questions) {
        latestQuestions = questionsData.questions
          .filter((q:any) => !q.paidOnly)
          .slice(0, 20)
          .map((question:any) => ({
            id: question.frontendQuestionId,
            title: question.title,
            titleSlug: question.titleSlug,
            difficulty: question.difficulty,
            url: `https://leetcode.com/problems/${question.titleSlug}/`,
            acceptanceRate: parseFloat(question.acRate).toFixed(1),
            status: question.status,
            isSolved: question.status === "ac",
            topicTags: question.topicTags.map((tag:any) => ({
              name: tag.name,
              slug: tag.slug,
            })),
            hasSolution: question.hasSolution,
            hasVideoSolution: question.hasVideoSolution,
            isPremium: question.paidOnly,
          }));
      }
    } catch (questionsErr: any) {
      console.warn("Could not fetch latest questions:", questionsErr.message);
    }

    // Step 6: Fetch trending questions
    let trendingQuestions = [];
    try {
      const trendingQuery = {
        query: `
          query dailyCodingQuestionRecords($year: Int!, $month: Int!) {
            dailyCodingChallengeV2(year: $year, month: $month) {
              challenges {
                date
                userStatus
                link
                question {
                  questionFrontendId
                  title
                  titleSlug
                  difficulty
                  acRate
                  topicTags {
                    name
                    slug
                  }
                  isPaidOnly
                }
              }
            }
          }
        `,
        variables: {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        },
      };

      const trendingResponse = await axios.post(graphqlUrl, trendingQuery, {
        headers: { "Content-Type": "application/json" },
      });

      const trendingData = trendingResponse.data?.data?.dailyCodingChallengeV2;

      if (trendingData && trendingData.challenges) {
        trendingQuestions = trendingData.challenges
          .filter(
            (challenge:any) => challenge.question && !challenge.question.isPaidOnly
          )
          .slice(0, 10)
          .map((challenge:any) => ({
            id: challenge.question.questionFrontendId,
            title: challenge.question.title,
            titleSlug: challenge.question.titleSlug,
            difficulty: challenge.question.difficulty,
            url: `https://leetcode.com/problems/${challenge.question.titleSlug}/`,
            acceptanceRate: parseFloat(challenge.question.acRate).toFixed(1),
            date: challenge.date,
            userStatus: challenge.userStatus,
            topicTags: challenge.question.topicTags.map((tag:any) => ({
              name: tag.name,
              slug: tag.slug,
            })),
            isDailyChallenge: true,
          }));
      }
    } catch (trendingErr:any) {
      console.warn("Could not fetch trending questions:", trendingErr.message);
    }

    return NextResponse.json({
      success: true,
      username,
      profileUrl,
       leetCodeStats,
      data: {
        ...user.profile,
      },
     
      submissions,
      recentSolved,
      heatmap,
      latestQuestions,
      trendingQuestions,
    });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}


