
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';
import { fetchCodeChefHeatmapAndContests, generateCodeChefHeatmap } from '@/lib/codechef';
import { getCodeChefHeatmap } from '@/lib/codechef';
// Types for response data structures
interface Question {
  code: string;
  url: string;
}

interface Difficulties {
  Easy: number;
  Medium: number;
  Hard: number;
}



// Main GET handler
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
    const url = `https://www.codechef.com/users/${username}`;
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);

    // Parse profile details
    const rating = $('.rating-number').first().text().trim();
    const stars = $('.rating-star').first().text().trim();
    const highestRating = $('.rating-header small')
      .first()
      .text()
      .replace('(', '')
      .replace(')', '')
      .trim();

    const institute = $('.user-details-container .user-country-name')
      .first()
      .text()
      .trim();

    // Parse ranks
    const globalRank = $('.rating-ranks ul li')
      .first()
      .find('strong')
      .text()
      .trim();
    const countryRank = $('.rating-ranks ul li')
      .last()
      .find('strong')
      .text()
      .trim();

    // Total solved problems
    const totalSolvedText = $('section.problems-solved')
      .text()
      .match(/Total Problems Solved:\s*(\d+)/);

    const totalSolved = totalSolvedText ? parseInt(totalSolvedText[1]) : 0;

    // Difficulty-wise solved counts
    const difficulties: Difficulties = { Easy: 0, Medium: 0, Hard: 0 };
    $('section.problems-solved article').each((_, el) => {
      const text = $(el).find('h5').text().trim();
      const countText = $(el).find('p').text().match(/\d+/);
      const count = countText ? parseInt(countText[0]) : 0;
      if (text.includes('Easy')) difficulties.Easy = count;
      else if (text.includes('Medium')) difficulties.Medium = count;
      else if (text.includes('Hard')) difficulties.Hard = count;
    });

    // Solved problems list
    const solvedProblems: Question[] = [];
    $('section.problems-solved article p a').each((_, el) => {
      const code = $(el).text().trim();
      const href = $(el).attr('href');
      if (code && href) {
        solvedProblems.push({
          code,
          url: `https://www.codechef.com${href}`,
        });
      }
    });

    // Contest count
    const contestsText = $('h5:contains("Contests")').text();
    const contestCountMatch = contestsText.match(/Contests\s*\((\d+)\)/);
    const contestCount = contestCountMatch ? parseInt(contestCountMatch[1]) : 0;

    // Generate heatmap data
    const heatmapResult = await generateCodeChefHeatmap(username);
   

    return new Response(
      JSON.stringify({
        success: true,
        username,
        profileUrl: url,
        data: {
          rating,
          stars,
          highestRating,
          totalSolved,
          totalQuestionsCount: totalSolved,
          institute,
          globalRank,
          countryRank,
          contestCount,
          difficultyWiseSolved: difficulties,
          solvedProblems,
          heatmap: heatmapResult.heatmapData,
          heatmapStats: heatmapResult.stats,
          calendar: heatmapResult.calendar,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error fetching CodeChef data:', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch CodeChef data',
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}




