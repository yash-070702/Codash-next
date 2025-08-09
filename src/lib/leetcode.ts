import axios from 'axios';

type Submission = {
  date: string;
  count: number;
};

type SubmissionByDate = {
  date: string; 
  count: number;
};

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  streakRanges: { start: string; end: string; length: number }[];
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

type HeatmapStatistics = {
  totalSubmissions: number;
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
  maxSubmissionsInDay: number;
  averageSubmissionsPerDay: number;
  streakRanges: { start: string; end: string; length: number }[];
  monthlyStats: MonthlyStats;
  yearlyStats: YearlyStats;
};

type DifficultyCount = {
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
};

type LeetCodeCounts = {
  easy: number;
  medium: number;
  hard: number;
};

type StreakRange = {
  start: string;
  end: string;
  length: number;
};

type YearlyStat = {
  totalSubmissions: number;
  activeDays: number;
  maxSubmissionsInDay: number;
  averageSubmissionsPerDay: string;
  activeMonths: number;
};

type InternalYearlyStat = YearlyStat & {
  months: Set<number>; // Used internally before converting to activeMonths
};

type YearlyStatsMap = Record<string, YearlyStat>;

type StreakStats = {
  currentStreak: number;
  longestStreak: number;
  streakRanges: StreakRange[];
};


type MonthlyStat = {
  totalSubmissions: number;
  activeDays: number;
  maxSubmissionsInDay: number;
  averageSubmissionsPerDay: string; // Kept as string since .toFixed returns string
};

type MonthlyStatsMap = Record<string, MonthlyStat>;

interface ContestRanking {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  totalParticipants: number;
  topPercentage: number;
}

interface ContestHistory {
  contest: {
    title: string;
    startTime: number;
  };
  rating: number;
  ranking: number;
  attended: boolean;
  trendDirection: string;
}

interface ContestData {
  ranking: ContestRanking | null;
  history: ContestHistory[];
}

export async function getLeetCodeContestDetails(username: string): Promise<ContestData> {
  const endpoint = "https://leetcode.com/graphql";

  const query = `
    query getContestData($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
      userContestRankingHistory(username: $username) {
        contest {
          title
          startTime
        }
        rating
        ranking
        attended
        trendDirection
      }
    }
  `;

  const body = JSON.stringify({
    query,
    variables: { username },
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`LeetCode API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`LeetCode API error: ${JSON.stringify(data.errors)}`);
  }

  return {
    ranking: data.data.userContestRanking,
    history: data.data.userContestRankingHistory,
  };
}

export async function fetchHistoricalSubmissions(graphqlUrl: string, username: string, activeYears: number[]): Promise<Submission[]>  {
  const allHistoricalData: Submission[] = [];

  for (const year of activeYears) {
    try {
      const yearQuery = {
        query: `
          query userCalendarYear($username: String!, $year: Int!) {
            matchedUser(username: $username) {
              userCalendar {
                submissionCalendar
              }
            }
          }
        `,
        variables: { username, year },
      };

      const yearResponse = await axios.post(graphqlUrl, yearQuery, {
        headers: { 'Content-Type': 'application/json' },
      });

      const yearCalendarData =
        yearResponse.data?.data?.matchedUser?.userCalendar;

      if (yearCalendarData?.submissionCalendar) {
        const rawCalendar = JSON.parse(yearCalendarData.submissionCalendar);
        const yearSubmissions = Object.entries(rawCalendar)
          .filter(([timestamp]) => {
            const date = new Date(Number(timestamp) * 1000);
            return date.getFullYear() === year;
          })
          .map(([timestamp, count]) => ({
            date: new Date(Number(timestamp) * 1000)
              .toISOString()
              .split('T')[0],
            count: Number(count),
          }));

        allHistoricalData.push(...yearSubmissions);
      }
    } catch (err: any) {
      console.warn(`Could not fetch data for year ${year}:`, err.message);
    }
  }

  return allHistoricalData;
}

export function fillMissingDates(
  submissions: Submission[],
  startDate: Date,
  endDate: Date
): Submission[] {
  const filledData: Submission[] = [];
  const submissionMap = new Map<string, number>();

  // Map existing submissions
  submissions.forEach((sub) => {
    submissionMap.set(sub.date, sub.count);
  });

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    filledData.push({
      date: dateStr,
      count: submissionMap.get(dateStr) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filledData;
}

export const fetchLeetCodeQuestionCounts = async (): Promise<LeetCodeCounts | null> => {
  const graphqlQuery = {
    query: `
      query {
        allQuestionsCount {
          difficulty
          count
        }
      }
    `,
  };

  try {
    const response = await axios.post<{
      data: {
        allQuestionsCount: DifficultyCount[];
      };
    }>(
      "https://leetcode.com/graphql",
      graphqlQuery,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data.data.allQuestionsCount;

    return {
      easy: data.find((item) => item.difficulty === "Easy")?.count || 0,
      medium: data.find((item) => item.difficulty === "Medium")?.count || 0,
      hard: data.find((item) => item.difficulty === "Hard")?.count || 0,
    };
  } catch (err: any) {
    console.error("LeetCode API Error:", err.message);
    return null;
  }
};


export function calculateHeatmapStatistics(
  submissionsByDate: SubmissionByDate[]
): HeatmapStatistics {
  if (!submissionsByDate || submissionsByDate.length === 0) {
    return {
      totalSubmissions: 0,
      totalActiveDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      maxSubmissionsInDay: 0,
      averageSubmissionsPerDay: 0,
      streakRanges: [],
      monthlyStats: {},
      yearlyStats: {},
    };
  }

  const sortedSubmissions = submissionsByDate
    .filter((item) => item.count > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalSubmissions = submissionsByDate.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const totalActiveDays = sortedSubmissions.length;

  const maxSubmissionsInDay = Math.max(
    ...submissionsByDate.map((item) => item.count)
  );

  const averageSubmissionsPerDay =
    totalActiveDays > 0
      ? parseFloat((totalSubmissions / totalActiveDays).toFixed(2))
      : 0;

  const streakData: StreakData = calculateStreaks(sortedSubmissions);
  const monthlyStats: any = calculateMonthlyStats(submissionsByDate);
  const yearlyStats: any = calculateYearlyStats(submissionsByDate);

  return {
    totalSubmissions,
    totalActiveDays,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    maxSubmissionsInDay,
    averageSubmissionsPerDay,
    streakRanges: streakData.streakRanges,
    monthlyStats,
    yearlyStats,
  };
}

export function calculateStreaks(submissions: Submission[]): StreakStats {
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakRanges: [],
    };
  }

  // Sort by date ascending
  submissions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dates = submissions.map((item) => ({
    date: new Date(item.date),
    count: item.count,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakRanges: StreakRange[] = [];
  let streakStart: Date | null = null;

  // Calculate Current Streak
  const lastDate = new Date(dates[dates.length - 1].date);
  lastDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 1) {
    currentStreak = 1;
    let checkDate = new Date(lastDate);

    for (let i = dates.length - 2; i >= 0; i--) {
      const prevDate = new Date(dates[i].date);
      prevDate.setHours(0, 0, 0, 0);

      checkDate.setDate(checkDate.getDate() - 1);

      if (prevDate.getTime() === checkDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate Longest Streak and Ranges
  for (let i = 0; i < dates.length; i++) {
    const currDate = new Date(dates[i].date);
    currDate.setHours(0, 0, 0, 0);

    if (i === 0) {
      tempStreak = 1;
      streakStart = currDate;
    } else {
      const prevDate = new Date(dates[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);

      const expected = new Date(prevDate);
      expected.setDate(expected.getDate() + 1);

      if (currDate.getTime() === expected.getTime()) {
        tempStreak++;
      } else {
        if (tempStreak >= 2 && streakStart) {
          const streakEnd = new Date(dates[i - 1].date);
          streakRanges.push({
  start: streakStart.toISOString().split("T")[0],
  end: streakEnd.toISOString().split("T")[0],
  length: tempStreak,
});
        }

        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        streakStart = currDate;
      }
    }
  }

  // Final check
  if (tempStreak >= 2 && streakStart) {
    const streakEnd = new Date(dates[dates.length - 1].date);
    streakRanges.push({
  start: streakStart.toISOString().split("T")[0],
  end: streakEnd.toISOString().split("T")[0],
  length: tempStreak,
});
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Sort streaks by length descending
  streakRanges.sort((a, b) => b.length - a.length);

  return {
    currentStreak,
    longestStreak,
    streakRanges: streakRanges.slice(0, 10),
  };
}
export function calculateMonthlyStats(submissionsByDate: Submission[]): MonthlyStatsMap {
  const monthlyStats: MonthlyStatsMap = {};

  submissionsByDate.forEach((item) => {
    if (item.count > 0) {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          totalSubmissions: 0,
          activeDays: 0,
          maxSubmissionsInDay: 0,
          averageSubmissionsPerDay: "0.00",
        };
      }

      const stats = monthlyStats[monthKey];
      stats.totalSubmissions += item.count;
      stats.activeDays += 1;
      stats.maxSubmissionsInDay = Math.max(stats.maxSubmissionsInDay, item.count);
    }
  });

  // Calculate average submissions per active day
  for (const month in monthlyStats) {
    const stats = monthlyStats[month];
    stats.averageSubmissionsPerDay = (stats.totalSubmissions / stats.activeDays).toFixed(2);
  }

  return monthlyStats;
}

export function calculateYearlyStats(submissionsByDate: Submission[]): YearlyStatsMap {
  const yearlyStats: Record<string, InternalYearlyStat> = {};

  submissionsByDate.forEach((item) => {
    if (item.count > 0) {
      const date = new Date(item.date);
      const year = date.getFullYear().toString();

      if (!yearlyStats[year]) {
        yearlyStats[year] = {
          totalSubmissions: 0,
          activeDays: 0,
          maxSubmissionsInDay: 0,
          averageSubmissionsPerDay: "0.00",
          activeMonths: 0,
          months: new Set<number>(),
        };
      }

      const stats = yearlyStats[year];
      stats.totalSubmissions += item.count;
      stats.activeDays += 1;
      stats.maxSubmissionsInDay = Math.max(stats.maxSubmissionsInDay, item.count);
      stats.months.add(date.getMonth());
    }
  });

  const finalStats: YearlyStatsMap = {};

  for (const year in yearlyStats) {
    const { months, ...stats } = yearlyStats[year];
    finalStats[year] = {
      ...stats,
      averageSubmissionsPerDay: (stats.totalSubmissions / stats.activeDays).toFixed(2),
      activeMonths: months.size,
    };
  }

  return finalStats;
}