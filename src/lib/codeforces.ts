interface Problem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags?: string[];
}

interface Submission {
  creationTimeSeconds: number;
  verdict: string;
  problem: Problem;
  programmingLanguage: string;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

type CodeforcesProblem = {
  rating?: number;
};

type CodeforcesAPIResponse = {
  status: string;
  result: {
    problems: CodeforcesProblem[];
  };
};

export async function getProblemsByDifficultyTier(): Promise<Record<string, number>> {
  const url = "https://codeforces.com/api/problemset.problems";

  try {
    const res = await fetch(url);
    const data: CodeforcesAPIResponse = await res.json();

    if (data.status !== "OK") throw new Error("Failed to fetch problems");

    const counts = {
      "Easy": 0,
      "Medium": 0,
      "Hard": 0,
      "Unrated": 0,
    };

    for (const problem of data.result.problems) {
      const rating = problem.rating;

      if (rating === undefined) {
        counts["Unrated"]++;
      } else if (rating <= 1200) {
        counts["Easy"]++;
      } else if (rating <= 1800) {
        counts["Medium"]++;
      } else  {
        counts["Hard"]++;
      }
    }

    console.log({ totalQuestions: counts });
    return counts;
  } catch (err) {
    console.error("Error:", err);
    return {
      "Easy": 0,
      "Medium": 0,
      "Hard": 0,
      "Very Hard": 0,
      "Unrated": 0,
    };
  }
}
export function generateCfHeatmapYearWise(submissions: Submission[]) {
  if (!submissions || submissions.length === 0) return {};

  // Find earliest submission date (account creation approximation)
  const timestamps = submissions.map(sub => sub.creationTimeSeconds * 1000);
  const earliestTimestamp = Math.min(...timestamps);
  const earliestDate = new Date(earliestTimestamp);

  const startYear = earliestDate.getFullYear();
  const currentYear = new Date().getFullYear();

  // Group submissions by date string for quick count lookup
  const submissionCountByDate: Record<string, number> = {};
  submissions.forEach(submission => {
    const dateStr = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
    submissionCountByDate[dateStr] = (submissionCountByDate[dateStr] || 0) + 1;
  });

  // Helper to generate daily heatmap data for one year
  function generateYearHeatmap(year: number) {
    const heatmapData = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const count = submissionCountByDate[dateStr] || 0;

      let intensity = 0;
      if (count === 0) intensity = 0;
      else if (count <= 2) intensity = 1;
      else if (count <= 5) intensity = 2;
      else if (count <= 10) intensity = 3;
      else intensity = 4;

      heatmapData.push({
        date: dateStr,
        count,
        intensity,
        dayOfWeek: d.getDay(),
        week: Math.ceil((d.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)),
        month: d.getMonth() + 1,
        day: d.getDate(),
        year,
      });
    }
    return heatmapData;
  }

  // Generate heatmap for all years from earliest to current
  const heatmapByYear: Record<number, ReturnType<typeof generateYearHeatmap>> = {};
  for (let y = startYear; y <= currentYear; y++) {
    heatmapByYear[y] = generateYearHeatmap(y);
  }

  return heatmapByYear;
}


export function generateDifficultyStats(submissions: Submission[]) {
  const difficultyStats = {
    "Easy": 0,
    "Medium": 0,
    "Hard": 0,
    Unrated: 0,
  };

  const solvedSet = new Set<string>();

  submissions.forEach((submission) => {
    if (submission.verdict === "OK") {
      const problem = submission.problem;
      const problemId = `${problem.contestId}-${problem.index}`;

      if (!solvedSet.has(problemId)) {
        solvedSet.add(problemId);
        const rating = problem.rating;

        if (!rating) {
          difficultyStats["Unrated"]++;
        } else if (rating <= 1200) {
          difficultyStats["Easy"]++;
        } else if (rating <= 1800) {
          difficultyStats["Medium"]++;
        } else{
          difficultyStats["Hard"]++;
        } 
      }
    }
  });
  return difficultyStats;
}

export function getRecentlySolvedProblems(submissions: Submission[], limit = 10) {
  const solvedProblems = [];
  const solvedSet = new Set<string>();

  // Sort submissions by creation time (newest first)
  const sortedSubmissions = submissions
    .filter((submission) => submission.verdict === "OK")
    .sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);

  for (const submission of sortedSubmissions) {
    const problem = submission.problem;
    const problemId = `${problem.contestId}-${problem.index}`;

    if (!solvedSet.has(problemId)) {
      solvedSet.add(problemId);

      const solvedDate = new Date(submission.creationTimeSeconds * 1000);
      const now = new Date();
      const daysAgo = Math.floor((now.getTime() - solvedDate.getTime()) / (1000 * 60 * 60 * 24));

      solvedProblems.push({
        problemId,
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating || null,
        tags: problem.tags || [],
        solvedAt: solvedDate.toISOString(),
        daysAgo,
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
        contestUrl: `https://codeforces.com/contest/${problem.contestId}`,
        difficulty: getDifficultyLevel(problem.rating),
        programmingLanguage: submission.programmingLanguage,
        timeConsumedMillis: submission.timeConsumedMillis,
        memoryConsumedBytes: submission.memoryConsumedBytes,
      });

      if (solvedProblems.length >= limit) break;
    }
  }

  return {
    problems: solvedProblems,
    totalRecent: solvedProblems.length,
    summary: {
      last7Days: solvedProblems.filter((p) => p.daysAgo <= 7).length,
      last30Days: solvedProblems.filter((p) => p.daysAgo <= 30).length,
      averageRating:
        solvedProblems
          .filter((p) => p.rating)
          .reduce((sum, p, _, arr) => sum + (p.rating || 0) / arr.length, 0) || 0,
      mostUsedLanguage: getMostUsedLanguage(solvedProblems),
      topTags: getTopTags(solvedProblems),
    },
  };
}

export function getDifficultyLevel(rating?: number | null): string {
  if (!rating) return "Unrated";
  if (rating <= 1200) return "Easy";
  if (rating <= 1800) return "Medium";
  if (rating <= 2400) return "Hard";
  return "Very Hard";
}

export function getMostUsedLanguage(problems: any[]): string {
  const langCount: Record<string, number> = {};
  problems.forEach((p) => {
    langCount[p.programmingLanguage] = (langCount[p.programmingLanguage] || 0) + 1;
  });

  return Object.entries(langCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";
}

export function getTopTags(problems: any[], limit = 5) {
  const tagCount: Record<string, number> = {};
  problems.forEach((p) => {
    p.tags.forEach((tag: string) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}