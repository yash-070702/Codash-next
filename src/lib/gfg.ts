import axios from "axios";
import * as cheerio from "cheerio";

interface SocialLinks {
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
}
interface SolvedStat {
  count?: number;
}

type SolvedStats =
   {
      easy?: SolvedStat;
      medium?: SolvedStat;
      hard?: SolvedStat;
      basic?: SolvedStat;
      total?: number;
      [key: string]: any;
    }
  | SolvedStat[]
  | null;


export interface EnhancedProfileData {
  profileImageUrl: string | null;
  bio: string | null;
  location: string | null;
  joinDate: string | null;
  following: number;
  followers: number;
  badges: string[];
  socialLinks: SocialLinks;
}

interface CalendarDayData {
  count?: number;
  problemsSolved?: number;
  submissions?: number;
  solved?: number;
  [key: string]: any;
}

interface HeatmapEntry {
  date: string;
  count: number;
  intensity: number;
  dayOfWeek: number;
  week: number;
  month: number;
  day: number;
}

interface HeatmapResult {
  heatmap: HeatmapEntry[];
  activeYears: number[];
}

interface CalendarDataEntry {
  count?: number;
  [key: string]: any;
}

interface Info {
  rank?: number;
  streak?: number;
  [key: string]: any;
}

interface EmptyHeatmapEntry {
  date: string;
  count: number;
  intensity: number;
  dayOfWeek: number;
  week: number;
  month: number;
  day: number;
}

interface DifficultyBreakdownItem {
  count: number;
  percentage: string | number;
}

interface DifficultyAnalysisResult {
  breakdown: {
    easy: DifficultyBreakdownItem;
    medium: DifficultyBreakdownItem;
    hard: DifficultyBreakdownItem;
    basic: DifficultyBreakdownItem;
  };
  difficultyScore: number;
  recommendation: string;
  level: string;
}

export interface CalendarDay {
  count: number;
}

export interface CalendarData {
  [date: string]: CalendarDay | undefined;
}

export interface ActivityMetrics {
  totalActiveDays: number;
  totalProblems: number;
  averageProblemsPerDay: string | number;
  activeDaysPercentage: string;
  maxProblemsInDay: number;
  currentStreak: number;
  maxStreak: number;
  weeklyPattern: Record<string, number>; // or more specific type
  consistencyScore: number;
}

interface WeeklyPatternResult {
  weeklyData: Record<number, number>;
  mostActiveDay: string;
  weekendActivity: number;
  weekdayActivity: number;
}

interface StreakResult {
  current: number;
  max: number;
}

interface UserInfo {
  userName: string;
  fullName: string;
  institution: string;
}

interface EnhancedProfile {
  bio: string;
  location: string;
  profileImageUrl: string;
}



export async function getEnhancedProfileData(
  username: string
): Promise<EnhancedProfileData> {
  try {
    const profileUrl = `https://auth.geeksforgeeks.org/user/${username}`;
    const response = await axios.get(profileUrl);
    const $ = cheerio.load(response.data);

    const profileImageUrl = $(".profile_pic img").attr("src") || null;
    const bio = $(".profile_bio").text().trim() || null;
    const location = $(".location_details").text().trim() || null;
    const joinDate = $(".join_date").text().trim() || null;

    const followingText = $(".following_count").text().trim();
    const followersText = $(".followers_count").text().trim();

    const following = parseInt(followingText) || 0;
    const followers = parseInt(followersText) || 0;

    const badges = $(".badge_item")
      .map((_, el) => $(el).text().trim())
      .get();

    const socialLinks: SocialLinks = {
      linkedin: $(".social_links .linkedin").attr("href") || null,
      github: $(".social_links .github").attr("href") || null,
      twitter: $(".social_links .twitter").attr("href") || null,
    };

    return {
      profileImageUrl,
      bio,
      location,
      joinDate,
      following,
      followers,
      badges,
      socialLinks,
    };
  } catch (error: any) {
    console.warn("Error fetching enhanced profile data:", error.message);
    return {
      profileImageUrl: null,
      bio: null,
      location: null,
      joinDate: null,
      following: 0,
      followers: 0,
      badges: [],
      socialLinks: {
        linkedin: null,
        github: null,
        twitter: null,
      },
    };
  }
}

export function calculateTotalQuestions(solvedStats: SolvedStats): number {
  if (!solvedStats || typeof solvedStats !== "object") {
    return 0;
  }

  let total = 0;

  if (
    !Array.isArray(solvedStats) &&
    solvedStats.easy &&
    solvedStats.medium &&
    solvedStats.hard
  ) {
    total =
      (solvedStats.easy.count || 0) +
      (solvedStats.medium.count || 0) +
      (solvedStats.hard.count || 0) +
      (solvedStats.basic?.count || 0); // basic is optional
  } else if (Array.isArray(solvedStats)) {
    total = solvedStats.reduce((sum, stat) => sum + (stat.count || 0), 0);
  } else if ("total" in solvedStats && typeof solvedStats.total === "number") {
    total = solvedStats.total;
  } else {
    total = Object.values(solvedStats).reduce((sum, value) => {
      if (value && typeof value === "object" && "count" in value) {
        return sum + (value.count || 0);
      } else if (typeof value === "number") {
        return sum + value;
      }
      return sum;
    }, 0);
  }

  return total;
}

export function generateHeatmapData(
  calendar: Record<string, number | CalendarDayData>,
  year: number
): HeatmapResult {
  const heatmapData: HeatmapEntry[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateString = date.toISOString().split("T")[0];
    const dayData = calendar[dateString] ?? null;

    let count = 0;
    if (dayData !== null) {
      if (typeof dayData === "number") {
        count = dayData;
      } else if (typeof dayData === "object") {
        count =
          dayData.count ??
          dayData.problemsSolved ??
          dayData.submissions ??
          dayData.solved ??
          0;
      }
    }

    const intensity =
      count > 0 ? (count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4) : 0;

    heatmapData.push({
      date: dateString,
      count,
      intensity,
      dayOfWeek: date.getDay(),
      week: Math.ceil(
        (date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  }

  const activeYears = Array.from(
    new Set(heatmapData.map((item) => new Date(item.date).getFullYear()))
  );

  return {
    heatmap: heatmapData,
    activeYears,
  };
}

export function generateEmptyHeatmapData(year: number): EmptyHeatmapEntry[] {
  const heatmapData: EmptyHeatmapEntry[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateString = date.toISOString().split("T")[0];

    heatmapData.push({
      date: dateString,
      count: 0,
      intensity: 0,
      dayOfWeek: date.getDay(),
      week: Math.ceil(
        (date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  }

  return heatmapData;
}


export function generateInsights(
  solvedStats: SolvedStats,
  calendar: Record<string, CalendarDataEntry>,
  info: Info
): string[] {
  const insights: string[] = [];
  const total = calculateTotalQuestions(solvedStats);

  // Problem count insights
  if (total > 1000) {
    insights.push("🏆 Problem Solving Legend! You've solved over 1000 problems!");
  } else if (total > 500) {
    insights.push("🏆 Problem Solving Master! You've solved over 500 problems.");
  } else if (total > 100) {
    insights.push("💪 Great Progress! You're building strong problem-solving skills.");
  } else if (total > 50) {
    insights.push("🌟 Good Start! Keep practicing to improve further.");
  }

  // Rank insights
  if (info.rank && info.rank <= 1000) {
    insights.push("🌟 Top Performer! You're among the top-ranked users.");
  } else if (info.rank && info.rank <= 5000) {
    insights.push("👍 Strong Performance! You're in the top tier of users.");
  }

  // Streak insights
  if (info.streak && info.streak > 50) {
    insights.push("🔥 Incredible Streak! Your consistency is outstanding.");
  } else if (info.streak && info.streak > 20) {
    insights.push("🔥 Great Streak! Keep up the consistent practice.");
  }

  // Difficulty insights
let hardCount = 0;

if (solvedStats && !Array.isArray(solvedStats)) {
  hardCount = solvedStats.hard?.count || 0;
}

  const hardPercentage = total > 0 ? (hardCount / total) * 100 : 0;

  if (hardPercentage > 25) {
    insights.push("🧠 Challenge Master! You tackle difficult problems regularly.");
  } else if (hardPercentage > 15) {
    insights.push("🧠 Challenge Seeker! You're comfortable with hard problems.");
  }

  // Activity insights
  const activeDays = Object.values(calendar).filter(
    (day) => day && (day.count ?? 0) > 0
  ).length;

  if (activeDays > 300) {
    insights.push("📅 Daily Coder! You practice almost every day.");
  } else if (activeDays > 200) {
    insights.push("📅 Consistent Coder! You maintain regular practice.");
  }

  return insights;
}

export function getDifficultyAnalysis(
  solvedStats: SolvedStats
): DifficultyAnalysisResult {
  const total = calculateTotalQuestions(solvedStats);

 const easy = !solvedStats || Array.isArray(solvedStats) ? 0 : solvedStats.easy?.count || 0;
const medium = !solvedStats || Array.isArray(solvedStats) ? 0 : solvedStats.medium?.count || 0;
const hard = !solvedStats || Array.isArray(solvedStats) ? 0 : solvedStats.hard?.count || 0;
const basic = !solvedStats || Array.isArray(solvedStats) ? 0 : solvedStats.basic?.count || 0;


  return {
    breakdown: {
      easy: {
        count: easy,
        percentage: total > 0 ? ((easy / total) * 100).toFixed(1) : 0,
      },
      medium: {
        count: medium,
        percentage: total > 0 ? ((medium / total) * 100).toFixed(1) : 0,
      },
      hard: {
        count: hard,
        percentage: total > 0 ? ((hard / total) * 100).toFixed(1) : 0,
      },
      basic: {
        count: basic,
        percentage: total > 0 ? ((basic / total) * 100).toFixed(1) : 0,
      },
    },
    difficultyScore: basic * 1 + easy * 2 + medium * 5 + hard * 10,
    recommendation: getRecommendation(easy, medium, hard, total),
    level: getDifficultyLevel(easy, medium, hard, total),
  };
}

function getRecommendation(
  easy: number,
  medium: number,
  hard: number,
  total: number
): string {
  if (total === 0)
    return "Start with basic problems to build your foundation!";

  const easyPercentage = (easy / total) * 100;
  const mediumPercentage = (medium / total) * 100;
  const hardPercentage = (hard / total) * 100;

  if (hardPercentage < 5 && total > 50) {
    return "Try solving more hard problems to challenge yourself!";
  } else if (mediumPercentage < 20 && total > 20) {
    return "Focus on medium difficulty problems to build confidence.";
  } else if (easyPercentage > 80 && total > 30) {
    return "Great foundation! Challenge yourself with harder problems.";
  } else if (hardPercentage > 30) {
    return "Excellent! You're tackling challenging problems regularly.";
  }

  return "Keep up the consistent practice across all difficulty levels!";
}

export function getDifficultyLevel(
  easy: number,
  medium: number,
  hard: number,
  total: number
): string {
  const score = easy * 1 + medium * 3 + hard * 5;

  if (score > 2000) return "Expert";
  if (score > 1000) return "Advanced";
  if (score > 500) return "Intermediate";
  if (score > 100) return "Beginner";
  return "Novice";
}


export function calculateActivityMetrics(
  calendar: CalendarData
): ActivityMetrics {
  const days = Object.values(calendar);
  const activeDays = days.filter((day) => day && day.count > 0) as CalendarDay[];
  const totalProblems = activeDays.reduce(
    (sum, day) => sum + (day.count || 0),
    0
  );

  const streaks = calculateStreaks(calendar);
  const weeklyPatternResult = calculateWeeklyPattern(calendar);

  // Convert numeric keys (0-6) to weekday names ('Sun' to 'Sat')
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyPattern: Record<string, number> = Object.fromEntries(
    Object.entries(weeklyPatternResult.weeklyData).map(([key, value]) => [
      dayNames[Number(key)],
      value,
    ])
  );

 return {
  totalActiveDays: activeDays.length,
  totalProblems: totalProblems,
  averageProblemsPerDay:
    activeDays.length > 0
      ? Number((totalProblems / activeDays.length).toFixed(2))
      : 0,
  activeDaysPercentage: ((activeDays.length / days.length) * 100).toFixed(1), // ← fixed here
  maxProblemsInDay: Math.max(...activeDays.map((day) => day.count || 0), 0),
  currentStreak: streaks.current,
  maxStreak: streaks.max,
  weeklyPattern,
  consistencyScore: calculateConsistencyScore(
    activeDays.length,
    days.length,
    streaks.max
  ),
};
}


export function calculateStreaks(calendar: CalendarData): StreakResult {
  const dates = Object.keys(calendar).sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split("T")[0];

  for (const date of dates) {
    const dayData = calendar[date];
    if (dayData && dayData.count > 0) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const sortedDates = [...dates].sort().reverse();
  for (const date of sortedDates) {
    if (date > today) continue;
    const dayData = calendar[date];
    if (dayData && dayData.count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { current: currentStreak, max: maxStreak };
}



export function calculateWeeklyPattern(
  calendar: CalendarData
): WeeklyPatternResult {
  const weeklyData: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  Object.entries(calendar).forEach(([date, data]) => {
    if (data && data.count > 0) {
      const dayOfWeek = new Date(date).getDay(); // 0 = Sunday ... 6 = Saturday
      weeklyData[dayOfWeek] += data.count;
    }
  });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];



const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const mostActiveDayIndex = Object.keys(weeklyData).reduce((a, b) =>
  weeklyData[+a] > weeklyData[+b] ? a : b
);

// Get the day name
const mostActiveDay = dayNames[+mostActiveDayIndex];
  return {
    weeklyData,
    mostActiveDay,
    weekendActivity: weeklyData[0] + weeklyData[6],
    weekdayActivity:
      weeklyData[1] +
      weeklyData[2] +
      weeklyData[3] +
      weeklyData[4] +
      weeklyData[5],
  };
}
export function calculateConsistencyScore(
  activeDays: number,
  totalDays: number,
  maxStreak: number
): number {
  const activityRate = (activeDays / totalDays) * 100;
  const streakBonus = Math.min(maxStreak / 30, 1) * 20; // Max 20 points
  return parseFloat(Math.min(activityRate + streakBonus, 100).toFixed(1));
}


export function calculateProfileCompleteness(
  info: UserInfo,
  enhancedProfile: EnhancedProfile
): number {
  const fields = [
    info.userName,
    info.fullName,
    info.institution,
    enhancedProfile.bio,
    enhancedProfile.location,
    enhancedProfile.profileImageUrl,
  ];

  const completedFields = fields.filter(
    (field) => field && field.trim() !== ""
  ).length;

  return parseInt(((completedFields / fields.length) * 100).toFixed(0));
}