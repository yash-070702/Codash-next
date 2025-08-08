'use client';

import React, { useState, useMemo } from 'react';

interface HeatmapDataItem {
  date: string;
  count: number;
  intensity?: number;
  dayOfWeek?: number;
  week?: number;
  month?: number;
  day?: number;
  year?: number;
}

interface HeatmapData {
  [year: string]: HeatmapDataItem[];
}

interface ActivityHeatmapProps {
  heatmapData: HeatmapData;
}

const ActivityHeatMapCF: React.FC<ActivityHeatmapProps> = ({ heatmapData }) => {
  console.log("Heatmap Data:", heatmapData);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredCell, setHoveredCell] = useState<any>(null);

  const processHeatmapData = (data: HeatmapData, year: number) => {
    if (!data || !data[year]) return {};
    const processedData: Record<string, { count: number }> = {};
    data[year].forEach(item => {
      processedData[item.date] = { count: item.count };
    });
    return processedData;
  };

  const generateDemoData = (year: number) => {
    const data: Record<string, { count: number }> = {};
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      let activityLevel = 0;
      const random = Math.random();

      if (isWeekend) {
        activityLevel = random < 0.3 ? Math.floor(random * 8) : 0;
      } else {
        activityLevel = random < 0.7 ? Math.floor(random * 12) + 1 : 0;
      }

      data[dateStr] = { count: activityLevel };
    }

    return data;
  };

  const activityData = useMemo(() => {
    if (!heatmapData || !heatmapData[selectedYear]) {
      return generateDemoData(selectedYear);
    }

    return processHeatmapData(heatmapData, selectedYear);
  }, [heatmapData, selectedYear]);

  const hasDataForYear = useMemo(() => {
    return !!heatmapData && !!heatmapData[selectedYear] && heatmapData[selectedYear].length > 0;
  }, [heatmapData, selectedYear]);

  const availableYears = useMemo(() => {
    if (!heatmapData) {
      return [2024, 2023, 2022, 2021, 2020];
    }
    return Object.keys(heatmapData).map(Number).sort((a, b) => b - a);
  }, [heatmapData]);

  const getIntensityLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 8) return 3;
    return 4;
  };

  const getColor = (level: number) => {
    const colors: Record<number, string> = {
      0: '#1a1a1a',
      1: '#0d4429',
      2: '#006d32',
      3: '#26a641',
      4: '#39d353',
    };
    return colors[level] || colors[0];
  };

  const generateCalendarGrid = () => {
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());

    const weeks: any[] = [];
    const monthBoundaries: any[] = [];
    let currentDate = new Date(firstSunday);
    let weekIndex = 0;
    let lastMonth = -1;

    while (currentDate <= endDate || weeks.length < 53) {
      const week: any[] = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isCurrentYear = currentDate.getFullYear() === selectedYear;
        const data = activityData[dateStr] || { count: 0 };

        if (isCurrentYear && currentDate.getMonth() !== lastMonth) {
          monthBoundaries.push({
            month: currentDate.getMonth(),
            weekIndex: weekIndex,
            monthName: currentDate.toLocaleDateString('en-US', { month: 'short' })
          });
          lastMonth = currentDate.getMonth();
        }

        week.push({
          date: new Date(currentDate),
          dateStr,
          isCurrentYear,
          ...data
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
      weekIndex++;

      if (currentDate > endDate && weeks.length >= 53) break;
    }

    return { weeks, monthBoundaries };
  };

  const { weeks, monthBoundaries } = generateCalendarGrid();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTooltip = (cell: any) => {
    const date = cell.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const activity =
      cell.count === 0 ? 'No activity' : cell.count === 1 ? '1 contribution' : `${cell.count} contributions`;

    return `${activity} on ${date}`;
  };

  const NoDataComponent = () => (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 sm:p-12 overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-300">No Data Available</h3>
          <p className="text-gray-500 max-w-md">
            There's no activity data available for {selectedYear}. Try selecting a different year from the dropdown above.
          </p>
        </div>
        {availableYears.length > 0 && (
          <div className="text-sm text-gray-400">
            Available years: {availableYears.join(', ')}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Coding Activity Heatmap
            </h1>
            <div className="flex items-center">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white min-w-[100px]"
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="bg-gray-700">
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!hasDataForYear && heatmapData ? (
            <NoDataComponent />
          ) : (
            <>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-200">
                    Activity Overview - {selectedYear}
                  </h3>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <div className="min-w-[800px] relative">
                    <div className="flex mb-6 ml-12 relative h-4">
                      {monthBoundaries.map((boundary, index) => (
                        <div
                          key={boundary.month}
                          className="absolute text-xs text-gray-400 font-medium"
                          style={{
                            left: `${boundary.weekIndex * 15 + (boundary.weekIndex > 0 ? Math.floor(boundary.weekIndex / 4.33) * 8 : 0)}px`,
                            transform: 'translateX(-50%)',
                            top: '0px'
                          }}
                        >
                          {boundary.monthName}
                        </div>
                      ))}
                    </div>

                    <div className="flex">
                      <div className="flex flex-col mr-3 justify-start">
                        {days.map((day, index) => (
                          <div
                            key={day}
                            className="text-xs text-gray-400 h-3 flex items-center mb-1"
                          >
                            {index % 2 === 1 ? day : ''}
                          </div>
                        ))}
                      </div>

                      <div className="flex">
                        {weeks.map((week, weekIndex) => {
                          const isMonthStart = monthBoundaries.some(b => b.weekIndex === weekIndex && weekIndex > 0);
                          return (
                            <div
                              key={weekIndex}
                              className="flex flex-col space-y-1"
                              style={{
                                marginLeft: isMonthStart ? '8px' : '0px',
                                marginRight: weekIndex < weeks.length - 1 ? '1px' : '0px'
                              }}
                            >
                              {week.map((day: any, dayIndex: any) => (
                                <div
                                  key={`${weekIndex}-${dayIndex}`}
                                  className="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-gray-500 hover:scale-110 border border-gray-800"
                                  style={{
                                    backgroundColor: day.isCurrentYear ?
                                      getColor(getIntensityLevel(day.count)) :
                                      '#0f0f0f',
                                    opacity: day.isCurrentYear ? 1 : 0.3
                                  }}
                                  onMouseEnter={() => setHoveredCell(day)}
                                  onMouseLeave={() => setHoveredCell(null)}
                                  title={day.isCurrentYear ? formatTooltip(day) : ''}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-xs text-gray-400">
                    <p>Hover over squares to see activity details</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>Less</span>
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className="w-3 h-3 rounded-sm border border-gray-700"
                          style={{ backgroundColor: getColor(level) }}
                        />
                      ))}
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 h-12 flex items-center">
                <div className={`p-3 bg-gray-700 rounded-lg border border-gray-600 shadow-lg transition-opacity duration-200 ${
                  hoveredCell && hoveredCell.isCurrentYear ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="text-sm font-medium text-gray-200 whitespace-nowrap">
                    {hoveredCell && hoveredCell.isCurrentYear ? formatTooltip(hoveredCell) : 'Hover over a square to see activity details'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatMapCF;
