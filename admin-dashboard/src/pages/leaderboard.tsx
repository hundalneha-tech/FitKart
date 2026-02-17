import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useLeaderboard } from '@/hooks/useApi';
import { Trophy, Zap, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user: string;
  steps: number;
  coins: number;
  country: string;
  trend: 'up' | 'down' | 'same';
}

type TimeRange = 'weekly' | 'monthly' | 'alltime';

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

  const { data: leaderboardData, isLoading, error } = useLeaderboard(timeRange);

  // Mock data
  const mockLeaderboards = {
    weekly: [
      { rank: 1, user: 'fitness_king', steps: 125000, coins: 2500, country: 'India', trend: 'up' as const },
      { rank: 2, user: 'run_master', steps: 118000, coins: 2360, country: 'USA', trend: 'up' as const },
      { rank: 3, user: 'step_counter', steps: 115000, coins: 2300, country: 'UK', trend: 'same' as const },
      { rank: 4, user: 'walk_daily', steps: 95000, coins: 1900, country: 'Canada', trend: 'down' as const },
      { rank: 5, user: 'cardio_queen', steps: 85000, coins: 1700, country: 'Australia', trend: 'up' as const },
      { rank: 6, user: 'gym_dude', steps: 75000, coins: 1500, country: 'India', trend: 'down' as const },
      { rank: 7, user: 'yoga_master', steps: 65000, coins: 1300, country: 'USA', trend: 'same' as const },
      { rank: 8, user: 'run_fast', steps: 55000, coins: 1100, country: 'Germany', trend: 'up' as const },
      { rank: 9, user: 'health_buddy', steps: 45000, coins: 900, country: 'France', trend: 'down' as const },
      { rank: 10, user: 'active_boy', steps: 35000, coins: 700, country: 'Spain', trend: 'up' as const },
    ],
    monthly: [
      { rank: 1, user: 'fitness_king', steps: 525000, coins: 10500, country: 'India', trend: 'up' as const },
      { rank: 2, user: 'run_master', steps: 485000, coins: 9700, country: 'USA', trend: 'up' as const },
      { rank: 3, user: 'step_counter', steps: 465000, coins: 9300, country: 'UK', trend: 'same' as const },
      { rank: 4, user: 'cardio_queen', steps: 425000, coins: 8500, country: 'Australia', trend: 'up' as const },
      { rank: 5, user: 'gym_dude', steps: 385000, coins: 7700, country: 'India', trend: 'down' as const },
      { rank: 6, user: 'walk_daily', steps: 375000, coins: 7500, country: 'Canada', trend: 'down' as const },
      { rank: 7, user: 'yoga_master', steps: 325000, coins: 6500, country: 'USA', trend: 'same' as const },
      { rank: 8, user: 'run_fast', steps: 295000, coins: 5900, country: 'Germany', trend: 'up' as const },
      { rank: 9, user: 'health_buddy', steps: 265000, coins: 5300, country: 'France', trend: 'down' as const },
      { rank: 10, user: 'active_boy', steps: 235000, coins: 4700, country: 'Spain', trend: 'up' as const },
    ],
    alltime: [
      { rank: 1, user: 'fitness_king', steps: 2125000, coins: 42500, country: 'India', trend: 'up' as const },
      { rank: 2, user: 'run_master', steps: 1985000, coins: 39700, country: 'USA', trend: 'up' as const },
      { rank: 3, user: 'step_counter', steps: 1865000, coins: 37300, country: 'UK', trend: 'same' as const },
      { rank: 4, user: 'gym_dude', steps: 1725000, coins: 34500, country: 'India', trend: 'down' as const },
      { rank: 5, user: 'cardio_queen', steps: 1625000, coins: 32500, country: 'Australia', trend: 'up' as const },
      { rank: 6, user: 'walk_daily', steps: 1485000, coins: 29700, country: 'Canada', trend: 'down' as const },
      { rank: 7, user: 'yoga_master', steps: 1345000, coins: 26900, country: 'USA', trend: 'same' as const },
      { rank: 8, user: 'run_fast', steps: 1225000, coins: 24500, country: 'Germany', trend: 'up' as const },
      { rank: 9, user: 'health_buddy', steps: 1085000, coins: 21700, country: 'France', trend: 'down' as const },
      { rank: 10, user: 'active_boy', steps: 945000, coins: 18900, country: 'Spain', trend: 'up' as const },
    ],
  };

  const leaderboard = mockLeaderboards[timeRange];

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-400 transform rotate-180" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-400';
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top performers and rankings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          {(['weekly', 'monthly', 'alltime'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setTimeRange(tab)}
              className={`px-6 py-3 font-medium transition border-b-2 ${
                timeRange === tab
                  ? 'border-blue-600 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'weekly' && '📅 Weekly'}
              {tab === 'monthly' && '📆 Monthly'}
              {tab === 'alltime' && '🏆 All-Time'}
            </button>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg border border-yellow-700">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-200 font-medium">1st Place</span>
            </div>
            <p className="text-2xl font-bold text-yellow-300">{leaderboard[0].user}</p>
            <p className="text-yellow-200 text-sm mt-1">{leaderboard[0].steps.toLocaleString()} steps</p>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-lg border border-gray-600">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-gray-300" />
              <span className="text-gray-300 font-medium">2nd Place</span>
            </div>
            <p className="text-2xl font-bold text-gray-200">{leaderboard[1].user}</p>
            <p className="text-gray-400 text-sm mt-1">{leaderboard[1].steps.toLocaleString()} steps</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900 to-amber-800 p-6 rounded-lg border border-amber-700">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-amber-600" />
              <span className="text-amber-200 font-medium">3rd Place</span>
            </div>
            <p className="text-2xl font-bold text-amber-300">{leaderboard[2].user}</p>
            <p className="text-amber-200 text-sm mt-1">{leaderboard[2].steps.toLocaleString()} steps</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading leaderboard...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">Failed to load leaderboard</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Rank</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Steps</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Coins Earned</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Country</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr
                      key={entry.rank}
                      className={`border-b border-gray-700 transition ${
                        entry.rank <= 3 ? 'bg-gray-700/30' : idx % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'
                      } hover:bg-gray-700`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getMedalIcon(entry.rank)}
                          <span className={`text-lg font-bold ${getRankColor(entry.rank)}`}>#{entry.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{entry.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          {entry.steps.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-green-400 font-medium">₹{entry.coins.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{entry.country}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(entry.trend)}
                          <span className="text-xs text-gray-400">
                            {entry.trend === 'up' && '↑'}
                            {entry.trend === 'down' && '↓'}
                            {entry.trend === 'same' && '→'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Country Filter Info */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-blue-300 text-sm flex items-center gap-2">
            <span>💡</span>
            Showing leaderboard for all countries. Filter by country available in search.
          </p>
        </div>
      </div>
    </Layout>
  );
}
