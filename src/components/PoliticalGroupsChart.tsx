'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PoliticalGroup {
  group: string;
  average: number;
  count: number;
  spectrum: {
    position: number;
    label: string;
    color: string;
  };
  meps: Array<{
    name: string;
    attendance: number;
  }>;
}

interface PoliticalGroupsData {
  groups: PoliticalGroup[];
  totalMeps: number;
  totalGroups: number;
}

export default function PoliticalGroupsChart() {
  const [data, setData] = useState<PoliticalGroupsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'spectrum' | 'attendance'>('spectrum');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/political-groups');
        const result = await response.json();
        
        if (response.ok) {
          setData(result);
        } else {
          setError(result.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError('Failed to fetch political groups data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Political Group Attendance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Average attendance rates by political group
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Political Group Attendance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Average attendance rates by political group
          </p>
        </div>
        <div className="p-6">
          <div className="text-center text-red-600">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.groups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Political Group Attendance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Average attendance rates by political group
          </p>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            No data available
          </div>
        </div>
      </div>
    );
  }

  // Filter out groups with less than 3 MEPs for better statistical significance
  const significantGroups = data.groups.filter(group => group.count >= 3);
  
  // Sort groups based on selected criteria
  const sortedGroups = [...significantGroups].sort((a, b) => {
    if (sortBy === 'attendance') {
      return b.average - a.average; // Highest attendance first
    } else {
      return a.spectrum.position - b.spectrum.position; // Political spectrum (left to right)
    }
  });
  
  // Prepare data for the chart with abbreviated names and spectrum colors
  const chartData = sortedGroups.map((group) => {
    // Abbreviate long group names
    let shortName = group.group;
    if (group.group.includes('Group of the European People\'s Party')) {
      shortName = 'EPP';
    } else if (group.group.includes('Progressive Alliance of Socialists')) {
      shortName = 'S&D';
    } else if (group.group.includes('Renew Europe')) {
      shortName = 'Renew';
    } else if (group.group.includes('Greens/European Free Alliance')) {
      shortName = 'Greens-EFA';
    } else if (group.group.includes('European Conservatives and Reformists')) {
      shortName = 'ECR';
    } else if (group.group.includes('Identity and Democracy')) {
      shortName = 'ID';
    } else if (group.group.includes('Patriots for Europe')) {
      shortName = 'Patriots';
    } else if (group.group.includes('The Left')) {
      shortName = 'The Left';
    } else if (group.group.length > 15) {
      shortName = group.group.substring(0, 15) + '...';
    }

    return {
      name: shortName,
      fullName: group.group,
      attendance: group.average,
      count: group.count,
      color: group.spectrum.color,
      spectrumLabel: group.spectrum.label
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Political Group Attendance
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Average attendance rates by political group ({data.totalMeps} MEPs across {data.totalGroups} groups)
        </p>
      </div>
      <div className="p-6">
        {/* Political Spectrum Legend */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Political Spectrum</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#DC2626' }}></div>
              <span>Far Left</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#EF4444' }}></div>
              <span>Left</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#10B981' }}></div>
              <span>Left-Center</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#3B82F6' }}></div>
              <span>Center</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#8B5CF6' }}></div>
              <span>Right-Center</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#F59E0B' }}></div>
              <span>Right</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#6B7280' }}></div>
              <span>Far Right</span>
            </div>
          </div>
        </div>
        
        {/* Sort Toggle */}
        <div className="mb-4 flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSortBy('spectrum')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                sortBy === 'spectrum'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sort by Political Spectrum
            </button>
            <button
              onClick={() => setSortBy('attendance')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                sortBy === 'attendance'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sort by Attendance
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chart View</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value}%`, 
                    'Average Attendance'
                  ]}
                  labelFormatter={(label: string, payload: any) => {
                    if (payload && payload[0] && payload[0].payload) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Bar 
                  dataKey="attendance" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table View */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Table View</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MEPs
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedGroups.map((group, index) => (
                    <tr key={group.group} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: group.spectrum.color }}
                          ></div>
                          <div>
                            <div>{group.group}</div>
                            <div className="text-xs text-gray-500">{group.spectrum.label}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className={`font-semibold ${
                          group.average >= 90 ? 'text-green-600' :
                          group.average >= 80 ? 'text-blue-600' :
                          group.average >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {group.average}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {group.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
