import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, Award, Clock, Target, BookOpen, Calendar, Trophy, BarChart3, Activity } from 'lucide-react';

// TypeScript interfaces
interface RatingHistoryEntry {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

interface ChartDataPoint {
  contestNumber: number;
  rating: number;
  ratingChange: number;
  rank: number;
  date: string;
  contestName: string;
  contestType: string;
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

interface CodeforcesAnalyticsProps {
  ratingHistory: RatingHistoryEntry[];
}

const CodeforcesAnalytics: React.FC<CodeforcesAnalyticsProps> = ({ ratingHistory }) => {
 console.log("Rating History:", ratingHistory);
  const [selectedView, setSelectedView] = useState<'overview' | 'progress' | 'performance'>('overview');

  // Process data for charts
  const chartData: ChartDataPoint[] = useMemo(() => {
    return ratingHistory.map((entry, index) => {
      const contestType = entry.contestName.includes('Div. 3') ? 'Div. 3' :
                         entry.contestName.includes('Div. 2') ? 'Div. 2' :
                         entry.contestName.includes('Div. 1') ? 'Div. 1' :
                         entry.contestName.includes('Educational') ? 'Educational' :
                         entry.contestName.includes('Global') ? 'Global' : 'Other';
      
      return {
        contestNumber: index + 1,
        rating: entry.newRating,
        ratingChange: entry.newRating - entry.oldRating,
        rank: entry.rank,
        date: new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
        contestName: entry.contestName.slice(0, 30) + (entry.contestName.length > 30 ? '...' : ''),
        contestType
      };
    });
  }, [ratingHistory]);

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
      count: ratingHistory.filter(entry => entry.rank >= range.min && entry.rank <= range.max).length,
      color: range.color
    }));
  }, [ratingHistory]);

  const contestTypeStats: ContestTypeStats[] = useMemo(() => {
    const typeMap = new Map<string, { ratings: number[], ranks: number[] }>();
    
    chartData.forEach(entry => {
      if (!typeMap.has(entry.contestType)) {
        typeMap.set(entry.contestType, { ratings: [], ranks: [] });
      }
      typeMap.get(entry.contestType)!.ratings.push(entry.ratingChange);
      typeMap.get(entry.contestType)!.ranks.push(entry.rank);
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
    const currentRating = chartData[chartData.length - 1]?.rating || 0;
    const maxRating = Math.max(...chartData.map(d => d.rating));
    const minRating = Math.min(...chartData.map(d => d.rating));
    const totalRatingChange = currentRating - (chartData[0]?.rating || 0);
    const bestRank = Math.min(...ratingHistory.map(h => h.rank));
    const avgRank = Math.round(ratingHistory.reduce((sum, h) => sum + h.rank, 0) / ratingHistory.length);

    return {
      currentRating,
      maxRating,
      minRating,
      totalRatingChange,
      bestRank,
      avgRank,
      totalContests: ratingHistory.length
    };
  }, [chartData, ratingHistory]);

  const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; subtitle?: string; color: string }> = 
    ({ icon, title, value, subtitle, color }) => (
    <div className="bg-gray-300 rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
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
        <div className="bg-gray-900 p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{`Contest #${label}`}</p>
          <p className="text-sm text-gray-600">{data.contestName}</p>
          <p className="text-sm">{`Rating: ${payload[0].value}`}</p>
          <p className="text-sm">{`Rank: ${data.rank}`}</p>
          <p className="text-sm">{`Change: ${data.ratingChange > 0 ? '+' : ''}${data.ratingChange}`}</p>
          <p className="text-xs text-gray-500">{data.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
      <div className="mx-auto">

<div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-white">
                Contest Details
              </h3>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏆</span>
              </div>
            </div>
        {/* Navigation */}
        <div className="flex justify-center space-x-2 mb-8 bg-gray-900 rounded-lg p-2 shadow-sm">
          {[
            { key: 'overview',  icon: <BarChart3 size={18} /> },
            { key: 'progress',  icon: <TrendingUp size={18} /> },
            { key: 'performance',icon: <Activity size={18} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                selectedView === tab.key 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
  
            </button>
          ))}
        </div>

        {selectedView === 'overview' && (
          <>
            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<Award />} 
                title="Current Rating" 
                value={stats.currentRating} 
                subtitle={`+${stats.totalRatingChange} overall`}
                color="#10B981" 
              />
              <StatCard 
                icon={<Trophy />} 
                title="Best Rank" 
                value={stats.bestRank} 
                subtitle={`Avg: ${stats.avgRank}`}
                color="#3B82F6" 
              />
              <StatCard 
                icon={<TrendingUp />} 
                title="Peak Rating" 
                value={stats.maxRating} 
                subtitle={`Min: ${stats.minRating}`}
                color="#F59E0B" 
              />
              <StatCard 
                icon={<Calendar />} 
                title="Total Contests" 
                value={stats.totalContests} 
                subtitle="Participated"
                color="#8B5CF6" 
              />
            </div> */}

            {/* Rating Progress Chart */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="mr-2 text-blue-500" />
                Rating Progression Over Time
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="contestNumber" />
                  <YAxis />
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
            </div>
          </>
        )}

        {selectedView === 'progress' && (
          <>
            {/* Rating Change Analysis */}
            <div className=" mb-8">
              <div className="bg-gray-900 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
               
                  Rating Changes
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
  <CartesianGrid strokeDasharray="3 1" />
  <XAxis dataKey="contestNumber" />
  <YAxis />
  <Tooltip />
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

        {selectedView === 'performance' && (
          <>
            {/* Rank vs Rating Scatter */}
            <div className="bg-gray-900  rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
              
                Rank vs Rating Correlation
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rank" name="Rank" />
                  <YAxis dataKey="rating" name="Rating" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '1 3' }}
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

export default CodeforcesAnalytics;