import axios from 'axios';
import * as cheerio from 'cheerio';
interface HeatmapResult {
  heatmapData: HeatmapDay[];
  stats: HeatmapStats;
  calendar: Record<string, number>;
}

interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  intensity: number; // 0-4 scale
  dayOfWeek: number; // 0=Sun...6=Sat
  week: number; // week number of the year
  month: number; // 1-12
  day: number; // 1-31
  year: number;
}

interface HeatmapStats {
  totalSubmissions: number;
  activeDays: number;
  maxSubmissionsPerDay: number;
  currentStreak: number;
  longestStreak: number;
  last6MonthsData: boolean;
  averageSubmissionsPerDay: number;
  mostActiveMonth: string | null;
  lastSubmissionDate: string | null;
}

export async function generateCodeChefHeatmap(username: string): Promise<HeatmapResult> {
  const result: HeatmapResult = {
    heatmapData: [],
    stats: {
      totalSubmissions: 0,
      activeDays: 0,
      maxSubmissionsPerDay: 0,
      currentStreak: 0,
      longestStreak: 0,
      last6MonthsData: true,
      averageSubmissionsPerDay: 0,
      mostActiveMonth: null,
      lastSubmissionDate: null,
    },
    calendar: {},
  };

  const currentYear = new Date().getFullYear();
  let rawHeatmap: Record<string, number> = {};

  const apis = [
    `https://codechef-api.vercel.app/handle/${username}`,
    `https://competitive-coding-api.herokuapp.com/api/codechef/${username}`,
    `https://codechef-api.herokuapp.com/${username}`,
    `https://api.codechef.com/users/${username}`, // Official API placeholder
  ];

  for (const apiUrl of apis) {
    try {
      const apiResponse = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (apiResponse.data && apiResponse.data.success !== false) {
        const apiData = apiResponse.data;

        if (apiData.heatMap) {
          rawHeatmap = apiData.heatMap;
          break;
        } else if (apiData.submissionCalendar) {
          rawHeatmap = apiData.submissionCalendar;
          break;
        } else if (apiData.calendar) {
          rawHeatmap = apiData.calendar;
          break;
        } else if (apiData.submissions) {
          rawHeatmap = processSubmissionsToHeatmap(apiData.submissions);
          break;
        } else if (apiData.data && apiData.data.heatMap) {
          rawHeatmap = apiData.data.heatMap;
          break;
        }
      }
    } catch {
      // Ignore and continue to next API
      continue;
    }
  }

  if (Object.keys(rawHeatmap).length === 0) {
    rawHeatmap = await scrapeCodeChefSubmissions(username);
  }

  result.heatmapData = generateHeatmapStructure(rawHeatmap, currentYear);
  result.calendar = rawHeatmap;
  result.stats = calculateHeatmapStats(rawHeatmap);

  return result;
}

function processSubmissionsToHeatmap(
  submissions: any[]
): Record<string, number> {
  const heatmap: Record<string, number> = {};

  if (Array.isArray(submissions)) {
    submissions.forEach((submission) => {
      let dateStr: string | null = null;

      if (submission.date) {
        dateStr = submission.date.split('T')[0];
      } else if (submission.submissionDate) {
        dateStr = submission.submissionDate.split('T')[0];
      } else if (submission.time) {
        dateStr = new Date(submission.time).toISOString().split('T')[0];
      }

      if (dateStr) {
        heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
      }
    });
  }

  return heatmap;
}

async function scrapeCodeChefSubmissions(
  username: string
): Promise<Record<string, number>> {
  const heatmap: Record<string, number> = {};

  try {
    const pages = [
      `https://www.codechef.com/users/${username}/submissions`,
      `https://www.codechef.com/users/${username}`,
      `https://www.codechef.com/ide/submissions/${username}`,
    ];

    for (const pageUrl of pages) {
      try {
        const { data: html } = await axios.get(pageUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        });

        const $ = cheerio.load(html);

        $('table tr').each((_:any, row:any) => {
          const $row = $(row);
          const timeCell = $row.find('td').first();
          const timeText = timeCell.text().trim();

          const dateFormats = [
            /(\d{4}-\d{2}-\d{2})/,
            /(\d{2}\/\d{2}\/\d{4})/,
            /(\d{2}-\d{2}-\d{4})/,
            /(\d{1,2}\s+\w+\s+\d{4})/,
          ];

          for (const format of dateFormats) {
            const match = timeText.match(format);
            if (match) {
              const date = standardizeDate(match[1]);
              if (date) {
                heatmap[date] = (heatmap[date] || 0) + 1;
              }
              break;
            }
          }
        });

        $('script').each((_, script) => {
          const scriptContent = $(script).html();
          if (
            scriptContent &&
            (scriptContent.includes('submission') ||
              scriptContent.includes('calendar'))
          ) {
            const dateRegex = /["'](\d{4}-\d{2}-\d{2})["']/g;
            let match;
            while ((match = dateRegex.exec(scriptContent)) !== null) {
              const date = match[1];
              heatmap[date] = (heatmap[date] || 0) + 1;
            }
          }
        });

        const calendarScript = $('script:contains("calendar")').html();
        if (calendarScript) {
          try {
            const calendarData = calendarScript.match(
              /calendar["']?\s*:\s*({[^}]+})/
            );
            if (calendarData) {
              const parsed = JSON.parse(calendarData[1]);
              Object.assign(heatmap, parsed);
            }
          } catch {
            // ignore
          }
        }

        if (Object.keys(heatmap).length > 0) break;
      } catch {
        continue;
      }
    }
  } catch {
  }

  return heatmap;
}

function standardizeDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function generateHeatmapStructure(
  rawHeatmap: Record<string, number>,
  year: number
): HeatmapDay[] {
  const heatmapData: HeatmapDay[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateString = date.toISOString().split('T')[0];
    const count = rawHeatmap[dateString] || 0;

    let intensity = 0;
    if (count > 0) {
      if (count <= 1) intensity = 1;
      else if (count <= 3) intensity = 2;
      else if (count <= 6) intensity = 3;
      else intensity = 4;
    }

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
      year,
    });
  }

  return heatmapData;
}

function calculateHeatmapStats(rawHeatmap: Record<string, number>): HeatmapStats {
  const dates = Object.keys(rawHeatmap).sort();
  const counts = Object.values(rawHeatmap);

  if (dates.length === 0) {
    return {
      totalSubmissions: 0,
      activeDays: 0,
      maxSubmissionsPerDay: 0,
      currentStreak: 0,
      longestStreak: 0,
      last6MonthsData: true,
      averageSubmissionsPerDay: 0,
      mostActiveMonth: null,
      lastSubmissionDate: null,
    };
  }

  const totalSubmissions = counts.reduce((a, b) => a + b, 0);
  const activeDays = dates.length;
  const maxSubmissionsPerDay = Math.max(...counts);
  const averageSubmissionsPerDay = totalSubmissions / activeDays;
  const lastSubmissionDate = dates[dates.length - 1];

  const streaks = calculateStreaks(rawHeatmap);

  const monthCounts: Record<string, number> = {};
  dates.forEach((date) => {
    const month = date.substring(0, 7);
    monthCounts[month] = (monthCounts[month] || 0) + rawHeatmap[date];
  });

  const mostActiveMonth = Object.keys(monthCounts).reduce((a, b) =>
    monthCounts[a] > monthCounts[b] ? a : b
  );

  return {
    totalSubmissions,
    activeDays,
    maxSubmissionsPerDay,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    last6MonthsData: true,
    averageSubmissionsPerDay: Math.round(averageSubmissionsPerDay * 100) / 100,
    mostActiveMonth,
    lastSubmissionDate,
  };
}

function calculateStreaks(
  heatmap: Record<string, number>
): { current: number; longest: number } {
  const dates = Object.keys(heatmap).sort();
  if (dates.length === 0) return { current: 0, longest: 0 };

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const previousDate = new Date(dates[i - 1]);
    const daysDiff = Math.floor(
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 1;
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  // Calculate current streak from today backwards
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  currentStreak = 0;

  for (let i = dates.length - 1; i >= 0; i--) {
    const date = new Date(dates[i]);
    const daysDiff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === currentStreak) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}