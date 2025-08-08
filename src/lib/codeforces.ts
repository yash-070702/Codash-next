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

export function generateCfHeatmap(submissions: Submission[]) {
  const heatmap: Record<string, number> = {};
  submissions.forEach((submission) => {
    const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split("T")[0]; // yyyy-mm-dd

    heatmap[date] = (heatmap[date] || 0) + 1;
  });

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const today = new Date();
  const data = [];

  for (let d = new Date(startOfYear); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const count = heatmap[dateStr] || 0;
    let intensity = 0;

    if (count === 0) intensity = 0;
    else if (count <= 2) intensity = 1;
    else if (count <= 5) intensity = 2;
    else if (count <= 10) intensity = 3;
    else intensity = 4;

    data.push({
      date: dateStr,
      count,
      intensity,
      dayOfWeek: d.getDay(),
      week: Math.ceil((d.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      month: d.getMonth() + 1,
      day: d.getDate(),
    });
  }

  return data;
}

export function generateDifficultyStats(submissions: Submission[]) {
  const difficultyStats = {
    "Easy (≤1200)": 0,
    "Medium (1201-1800)": 0,
    "Hard (1801-2400)": 0,
    "Very Hard (2401+)": 0,
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
          difficultyStats["Easy (≤1200)"]++;
        } else if (rating <= 1800) {
          difficultyStats["Medium (1201-1800)"]++;
        } else if (rating <= 2400) {
          difficultyStats["Hard (1801-2400)"]++;
        } else {
          difficultyStats["Very Hard (2401+)"]++;
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