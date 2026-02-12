import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { LeaderboardResponse } from '../types';

const modes = [
  { value: 'addition', label: 'Addition', symbol: '+' },
  { value: 'subtraction', label: 'Subtraction', symbol: '\u2212' },
  { value: 'multiplication', label: 'Multiplication', symbol: '\u00d7' },
  { value: 'division', label: 'Division', symbol: '\u00f7' },
  { value: 'mixed', label: 'Mixed', symbol: '?' },
];

const difficulties = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const timeLimits = [30, 60, 90, 120];

export default function LeaderboardPage() {
  const [mode, setMode] = useState('addition');
  const [difficulty, setDifficulty] = useState(1);
  const [timeLimit, setTimeLimit] = useState(60);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(mode, difficulty, timeLimit)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [mode, difficulty, timeLimit]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Leaderboard</h1>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-16">Mode</span>
          <div className="flex gap-1.5">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  mode === m.value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-16">Difficulty</span>
          <div className="flex gap-1.5">
            {difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  difficulty === d.value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time limit */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-16">Time</span>
          <div className="flex gap-1.5">
            {timeLimits.map((t) => (
              <button
                key={t}
                onClick={() => setTimeLimit(t)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  timeLimit === t
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : !data ? (
        <div className="text-center text-gray-400 py-12">Failed to load leaderboard</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Global */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Global Top 5</h2>
            {data.global.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {data.global.map((e) => (
                  <div key={e.rank} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-mono w-5 text-center ${
                        e.rank === 1 ? 'text-yellow-500 font-bold' :
                        e.rank === 2 ? 'text-gray-400 font-bold' :
                        e.rank === 3 ? 'text-amber-600 font-bold' :
                        'text-gray-300'
                      }`}>
                        {e.rank}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{e.username}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{e.score}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {e.total > 0 ? Math.round((e.correct / e.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-8 text-center text-sm text-gray-400">
                No scores yet. Be the first!
              </div>
            )}
          </div>

          {/* Personal */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Top 5</h2>
            {data.personal.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {data.personal.map((e) => (
                  <div key={e.rank} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-300 w-5 text-center">{e.rank}</span>
                      <span className="text-sm text-gray-500">{e.correct}/{e.total}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{e.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-8 text-center text-sm text-gray-400">
                No scores yet for this combination
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
