import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, Award, Clock, Target, BookOpen, Calendar, Trophy, BarChart3, Activity } from 'lucide-react';

// TypeScript interfaces for LeetCode data
interface Contest {
  title: string;
  startTime: number;
}

interface HistoryEntry {
  contest: Contest;
  rating: number;
  ranking: number;
  attended: boolean;
  trendDirection: string;
}

interface Ranking {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  totalParticipants: number;
  topPercentage: number;
}

interface ChartDataPoint {
  contestNumber: number;
  rating: number;
  ratingChange: number;
  ranking: number;
  date: string;
  contestName: string;
  contestType: string;
  attended: boolean;
}

interface RankDistribution {
  range: string;
  count: number;
  color: string;
}

interface ContestTypeStats {
  type: string;
  count: number;
  avgRatingChange: number;
  bestRank: number;
  worstRank: number;
}

interface LeetCodeAnalyticsProps {
  ranking: Ranking;
  history: HistoryEntry[];
}

const LeetCodeAnalytics: React.FC<LeetCodeAnalyticsProps> = ({ ranking, history }) => {
  if (!history || history.length === 0|| !ranking) {
    return( 
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-bold text-white">
            LeetCode Contest Analytics
          </h3>
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🏆</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              No contest data available
            </p>
            <p className="text-gray-500 text-xs">
              Participate in contests to see your stats here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [selectedView, setSelectedView] = useState<'overview' | 'progress' | 'performance'>('overview');

  // Process data for charts - only include attended contests
  const attendedContests = history.filter(entry => entry.attended);
  
  const chartData: ChartDataPoint[] = useMemo(() => {
    let previousRating = 1500; // Default starting rating
    
    return attendedContests.map((entry, index) => {
      const contestType = entry.contest.title.includes('Weekly') ? 'Weekly' :
                         entry.contest.title.includes('Biweekly') ? 'Biweekly' :
                         entry.contest.title.includes('Smarking') ? 'Smarking' : 'Other';
      
      const ratingChange = entry.rating - previousRating;
      previousRating = entry.rating;
      
      return {
        contestNumber: index + 1,
        rating: entry.rating,
        ratingChange: ratingChange,
        ranking: entry.ranking,
        date: new Date(entry.contest.startTime * 1000).toLocaleDateString(),
        contestName: entry.contest.title.slice(0, 30) + (entry.contest.title.length > 30 ? '...' : ''),
        contestType,
        attended: entry.attended
      };
    });
  }, [attendedContests]);

  const rankDistribution: RankDistribution[] = useMemo(() => {
    const ranges = [
      { min: 1, max: 1000, range: '1-1000', color: '#10B981' },
      { min: 1001, max: 3000, range: '1001-3000', color: '#3B82F6' },
      { min: 3001, max: 5000, range: '3001-5000', color: '#F59E0B' },
      { min: 5001, max: 10000, range: '5001-10000', color: '#EF4444' },
      { min: 10001, max: Infinity, range: '10000+', color: '#8B5CF6' }
    ];

    return ranges.map(range => ({
      range: range.range,
      count: attendedContests.filter(entry => entry.ranking >= range.min && entry.ranking <= range.max).length,
      color: range.color
    }));
  }, [attendedContests]);

  const contestTypeStats: ContestTypeStats[] = useMemo(() => {
    const typeMap = new Map<string, { ratings: number[], ranks: number[] }>();
    
    chartData.forEach(entry => {
      if (!typeMap.has(entry.contestType)) {
        typeMap.set(entry.contestType, { ratings: [], ranks: [] });
      }
      typeMap.get(entry.contestType)!.ratings.push(entry.ratingChange);
      typeMap.get(entry.contestType)!.ranks.push(entry.ranking);
    });

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      count: data.ratings.length,
      avgRatingChange: Math.round(data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length),
      bestRank: Math.min(...data.ranks),
      worstRank: Math.max(...data.ranks)
    }));
  }, [chartData]);

  const stats = useMemo(() => {
    const currentRating = ranking.rating;
    const maxRating = chartData.length > 0 ? Math.max(...chartData.map(d => d.rating)) : currentRating;
    const minRating = chartData.length > 0 ? Math.min(...chartData.map(d => d.rating)) : currentRating;
    const totalRatingChange = chartData.length > 0 ? currentRating - chartData[0].rating : 0;
    const bestRank = attendedContests.length > 0 ? Math.min(...attendedContests.map(h => h.ranking)) : 0;
    const avgRank = attendedContests.length > 0 ? Math.round(attendedContests.reduce((sum, h) => sum + h.ranking, 0) / attendedContests.length) : 0;

    return {
      currentRating: Math.round(currentRating),
      maxRating: Math.round(maxRating),
      minRating: Math.round(minRating),
      totalRatingChange: Math.round(totalRatingChange),
      bestRank,
      avgRank,
      totalContests: ranking.attendedContestsCount,
      globalRanking: ranking.globalRanking,
      topPercentage: ranking.topPercentage
    };
  }, [chartData, attendedContests, ranking]);

  const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; subtitle?: string; color: string }> = 
    ({ icon, title, value, subtitle, color }) => (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border border-gray-700" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-2xl" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 border border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{`Contest #${label}`}</p>
          <p className="text-sm text-gray-400">{data.contestName}</p>
          <p className="text-sm text-white">{`Rating: ${payload[0].value}`}</p>
          <p className="text-sm text-white">{`Rank: ${data.ranking}`}</p>
          <p className="text-sm text-white">{`Change: ${data.ratingChange > 0 ? '+' : ''}${data.ratingChange}`}</p>
          <p className="text-xs text-gray-500">{data.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 shadow-lg">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-white">
            LeetCode Contest Analytics
          </h3>
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="text-white" size={20} />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Award />}
            title="Current Rating"
            value={stats.currentRating}
            subtitle={`Max: ${stats.maxRating}`}
            color="#3B82F6"
          />
          <StatCard
            icon={<Users />}
            title="Global Ranking"
            value={`#${stats.globalRanking.toLocaleString()}`}
            subtitle={`Top ${stats.topPercentage}%`}
            color="#10B981"
          />
          <StatCard
            icon={<Trophy />}
            title="Best Rank"
            value={stats.bestRank || 'N/A'}
            subtitle={`Avg: ${stats.avgRank || 'N/A'}`}
            color="#F59E0B"
          />
          <StatCard
            icon={<Calendar />}
            title="Contests"
            value={stats.totalContests}
            subtitle={`${attendedContests.length} attended`}
            color="#EF4444"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-2 mb-8 bg-gray-900 rounded-lg p-2 shadow-sm">
          {[
            { key: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
            { key: 'progress', label: 'Progress', icon: <TrendingUp size={18} /> },
            { key: 'performance', label: 'Performance', icon: <Activity size={18} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                selectedView === tab.key 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className='hidden sm:block'>{tab.label}</span>
            </button>
          ))}
        </div>

        {selectedView === 'overview' && (
          <>
            {/* Rating Progress Chart */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <TrendingUp className="mr-2 text-blue-500" />
                Rating Progression Over Time
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="contestNumber" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No attended contests to display
                </div>
              )}
            </div>

           
          </>
        )}

        {selectedView === 'progress' && chartData.length > 0 && (
          <>
            {/* Rating Change Analysis */}
            <div className="mb-8">
              <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                  <Activity className="mr-2 text-purple-500" />
                  Rating Changes
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="contestNumber" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ratingChange">
                      {chartData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.ratingChange >= 0 ? '#10B981' : '#EF4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {selectedView === 'performance' && chartData.length > 0 && (
          <>
            {/* Rank vs Rating Scatter */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <Target className="mr-2 text-yellow-500" />
                Rank vs Rating Correlation
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="ranking" name="Rank" stroke="#9CA3AF" />
                  <YAxis dataKey="rating" name="Rating" stroke="#9CA3AF" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={<CustomTooltip />}
                  />
                  <Scatter 
                    data={chartData} 
                    fill="#8B5CF6"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeetCodeAnalytics;