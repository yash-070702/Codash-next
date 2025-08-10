import axios from "axios";
import * as cheerio from "cheerio";

interface EnhancedProfile {
  profileImageUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  joinDate?: string | null;
  badges?: string[];
  following?: number;
  followers?: number;
}

interface Info {
  userName: string;
  fullName?: string;
  institution?: string;
  rank?: number;
  score?: number;
  streak?: number;
  totalSolved?: number;
}

export async function fetchGFGUserDetails(username: string): Promise<any> {
  const apiUrl = `https://geeks-for-geeks-api.vercel.app/${username}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching GFG user details:", error);
    return null;
  }
}


export async function getEnhancedProfileData(username: string): Promise<EnhancedProfile> {
  try {
    const profileUrl = `https://auth.geeksforgeeks.org/user/${username}`;
    const response = await axios.get(profileUrl);
    const $ = cheerio.load(response.data);

    return {
      profileImageUrl: $(".profile_pic img").attr("src") || null,
      bio: $(".profile_bio").text().trim() || null,
      location: $(".location_details").text().trim() || null,
      joinDate: $(".join_date").text().trim() || null,
      following: parseInt($(".following_count").text().trim()) || 0,
      followers: parseInt($(".followers_count").text().trim()) || 0,
      badges: $(".badge_item")
        .map((i, el) => $(el).text().trim())
        .get(),
    };
  } catch {
    return {};
  }
}

export function calculateTotalQuestions(solvedStats: any): number {
  if (!solvedStats || typeof solvedStats !== "object") return 0;
  let total = 0;
  if (solvedStats.easy && solvedStats.medium && solvedStats.hard) {
    total =
      (solvedStats.easy.count || 0) +
      (solvedStats.medium.count || 0) +
      (solvedStats.hard.count || 0) +
      (solvedStats.basic?.count || 0);
  } else if (Array.isArray(solvedStats)) {
    total = solvedStats.reduce((sum, stat) => sum + (stat.count || 0), 0);
  } else if (solvedStats.total) {
    total = solvedStats.total;
  } else {
    total = Object.values(solvedStats).reduce((sum: number, value: any) => {
      if (value && typeof value === "object" && value.count) {
        return sum + value.count;
      }
      return sum + (typeof value === "number" ? value : 0);
    }, 0);
  }
  return total;
}

export function generateHeatmapData(calendar: any, year: number) {
  const heatmapData = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
  const dateString = date.toISOString().split("T")[0];
    const dayData = calendar[dateString] || null;
    console.log(`Date: ${dateString}, Day Data:`, dayData);

    let count = 0;
    if (dayData !== null) {
      if (typeof dayData === "number") {
        count = dayData;
      } else if (dayData.count !== undefined) {
        count = dayData.count;
      } else if (dayData.problemsSolved !== undefined) {
        count = dayData.problemsSolved;
      } else if (dayData.submissions !== undefined) {
        count = dayData.submissions;
      } else if (dayData.solved !== undefined) {
        count = dayData.solved;
      } else {
        console.warn(`Unknown count property on dayData for ${dateString}`, dayData);
      }
    } else {
      console.log(`No data for date: ${dateString}`);
    }

    let intensity = 0;
    if (count > 0) {
      if (count <= 2) intensity = 1;
      else if (count <= 5) intensity = 2;
      else if (count <= 10) intensity = 3;
      else intensity = 4;
    }

    const week = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    heatmapData.push({
      date: dateString,
      count,
      intensity,
      dayOfWeek: date.getDay(),
      week,
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  }

  const activeYears = Array.from(new Set(heatmapData.map(item => new Date(item.date).getFullYear())));

  console.log("Generated heatmap data count:", heatmapData.length);
  return {
    heatmap: heatmapData,
    activeYears,
  };
}



export function generateEmptyHeatmapData(year: number): any[] {
  const heatmapData = [];
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
      week: Math.ceil((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  }
  return heatmapData;
}

export function generateInsights(solvedStats: any, calendar: any, info: Info): string[] {
  const insights = [];
  const total = calculateTotalQuestions(solvedStats);

  if (total > 1000) {
    insights.push("🏆 Problem Solving Legend! You've solved over 1000 problems!");
  } else if (total > 500) {
    insights.push("🏆 Problem Solving Master! You've solved over 500 problems.");
  } else if (total > 100) {
    insights.push("💪 Great Progress! You're building strong problem-solving skills.");
  } else if (total > 50) {
    insights.push("🌟 Good Start! Keep practicing to improve further.");
  }

  if (info.rank && info.rank <= 1000) {
    insights.push("🌟 Top Performer! You're among the top-ranked users.");
  } else if (info.rank && info.rank <= 5000) {
    insights.push("👍 Strong Performance! You're in the top tier of users.");
  }

  if (info.streak && info.streak > 50) {
    insights.push("🔥 Incredible Streak! Your consistency is outstanding.");
  } else if (info.streak && info.streak > 20) {
    insights.push("🔥 Great Streak! Keep up the consistent practice.");
  }

  const hardCount = solvedStats.hard?.count || 0;
  const hardPercentage = total > 0 ? (hardCount / total) * 100 : 0;
  if (hardPercentage > 25) {
    insights.push("🧠 Challenge Master! You tackle difficult problems regularly.");
  } else if (hardPercentage > 15) {
    insights.push("🧠 Challenge Seeker! You're comfortable with hard problems.");
  }

  const activeDays = Object.values(calendar).filter(
    (day: any) => day && day.count > 0
  ).length;
  if (activeDays > 300) {
    insights.push("📅 Daily Coder! You practice almost every day.");
  } else if (activeDays > 200) {
    insights.push("📅 Consistent Coder! You maintain regular practice.");
  }

  return insights;
}
export function getDifficultyAnalysis(solvedStats: any) {
  const total = calculateTotalQuestions(solvedStats);
  const easy = solvedStats.easy?.count || 0;
  const medium = solvedStats.medium?.count || 0;
  const hard = solvedStats.hard?.count || 0;
  const basic = solvedStats.basic?.count || 0;

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

export function getRecommendation(easy: number, medium: number, hard: number, total: number) {
  if (total === 0) return "Start with basic problems to build your foundation!";

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

export function calculateActivityMetrics(calendar: any) {
  const days = Object.values(calendar);
  const activeDays = days.filter((day: any) => day && day.count > 0);
  const totalProblems = activeDays.reduce((sum: number, day: any) => sum + (day.count || 0), 0);

  const streaks = calculateStreaks(calendar);
  const weeklyPattern = calculateWeeklyPattern(calendar);

  return {
    totalActiveDays: activeDays.length,
    totalProblems: totalProblems,
    averageProblemsPerDay:
      activeDays.length > 0
        ? (totalProblems / activeDays.length).toFixed(2)
        : 0,
    activeDaysPercentage: ((activeDays.length / days.length) * 100).toFixed(1),
    maxProblemsInDay: Math.max(...activeDays.map((day: any) => day.count || 0), 0),
    currentStreak: streaks.current,
    maxStreak: streaks.max,
    weeklyPattern: weeklyPattern,
    consistencyScore: calculateConsistencyScore(
      activeDays.length,
      days.length,
      streaks.max
    ),
  };
}

export function calculateStreaks(calendar: any) {
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
  const sortedDates = dates.sort().reverse();
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

export function calculateWeeklyPattern(calendar: any) {
  const weeklyData: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  Object.entries(calendar).forEach(([date, data]: any) => {
    if (data && data.count > 0) {
      const dayOfWeek = new Date(date).getDay();
      weeklyData[dayOfWeek] += data.count;
    }
  });

  const days:any = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  const mostActiveDayIndex = Object.keys(weeklyData)
  .map(Number) // Convert from string[] to number[]
  .reduce((a, b) => weeklyData[a] > weeklyData[b] ? a : b);

// Step 2: Use that index to access the day name
const mostActiveDay = days[mostActiveDayIndex];

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

export function calculateConsistencyScore(activeDays: number, totalDays: number, maxStreak: number) {
  const activityRate = (activeDays / totalDays) * 100;
  const streakBonus = Math.min(maxStreak / 30, 1) * 20; // Max 20 bonus points
  return Math.min(activityRate + streakBonus, 100).toFixed(1);
}

export function calculateProfileCompleteness(info: Info, enhancedProfile: EnhancedProfile) {
  const fields = [
    info.userName,
    info.fullName,
    info.institution,
    enhancedProfile.bio,
    enhancedProfile.location,
    enhancedProfile.profileImageUrl,
  ];
  const completedFields = fields.filter(
    (field) => field && (typeof field === "string" ? field.trim() !== "" : true)
  ).length;
  return ((completedFields / fields.length) * 100).toFixed(0);
}