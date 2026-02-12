import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { StatsResponse, ModeStat } from '../types';
import { useAuth } from '../contexts/AuthContext';

const difficulties = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const modes = ['addition', 'subtraction', 'multiplication', 'division', 'mixed'] as const;

const modeLabels: Record<string, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  mixed: 'Mixed',
};

const modeSymbols: Record<string, string> = {
  addition: '+',
  subtraction: '\u2212',
  multiplication: '\u00d7',
  division: '\u00f7',
  mixed: '?',
};

const difficultyLabels: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

export default function DashboardPage() {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState(1);
  const [recentMode, setRecentMode] = useState('');
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    api.getUserStats(difficulty, recentMode || undefined)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [difficulty, recentMode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getStatForMode = (mode: string): ModeStat | undefined => {
    return data?.stats.find((s) => s.mode === mode);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Welcome back, {user?.username}</p>

      {/* Difficulty filter */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-gray-500 mr-1">Difficulty:</span>
        {difficulties.map((d) => (
          <button
            key={d.value}
            onClick={() => setDifficulty(d.value)}
            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
              difficulty === d.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Stats grid — one card per mode */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {modes.map((mode) => {
                const stat = getStatForMode(mode);
                return (
                  <div key={mode} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-mono text-gray-300">{modeSymbols[mode]}</span>
                      <span className="font-medium text-gray-900">{modeLabels[mode]}</span>
                    </div>
                    {stat ? (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{stat.games_played}</div>
                          <div className="text-xs text-gray-400">Games</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{stat.best_score}</div>
                          <div className="text-xs text-gray-400">Best</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{stat.avg_accuracy}%</div>
                          <div className="text-xs text-gray-400">Accuracy</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-300 text-center py-2">No games yet</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent games */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Games</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setRecentMode('')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    recentMode === '' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                {modes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setRecentMode(m)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      recentMode === m ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {modeSymbols[m]}
                  </button>
                ))}
              </div>
            </div>

            {data?.recent_games && data.recent_games.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-400">
                      <th className="px-4 py-2 font-medium">Mode</th>
                      <th className="px-4 py-2 font-medium">Difficulty</th>
                      <th className="px-4 py-2 font-medium">Score</th>
                      <th className="px-4 py-2 font-medium">Accuracy</th>
                      <th className="px-4 py-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_games.map((g) => (
                      <tr key={g.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2 text-gray-900">{modeLabels[g.mode] || g.mode}</td>
                        <td className="px-4 py-2 text-gray-500">{difficultyLabels[g.difficulty]}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{g.score}</td>
                        <td className="px-4 py-2 text-gray-500">
                          {g.total > 0 ? Math.round((g.correct / g.total) * 100) : 0}%
                        </td>
                        <td className="px-4 py-2 text-gray-400">{g.time_limit}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-8">No games yet</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
