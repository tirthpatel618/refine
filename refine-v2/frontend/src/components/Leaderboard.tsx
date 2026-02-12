import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { LeaderboardResponse } from '../types';

interface LeaderboardProps {
  mode: string;
  difficulty: number;
  timeLimit: number;
}

export default function Leaderboard({ mode, difficulty, timeLimit }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(mode, difficulty, timeLimit)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mode, difficulty, timeLimit]);

  if (loading) return <div className="text-center text-gray-400 text-sm py-4">Loading leaderboard...</div>;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Global */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Global Top 5</h3>
        {data.global.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {data.global.map((e) => (
              <div key={e.rank} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-400 w-4">{e.rank}</span>
                  <span className="text-sm text-gray-900">{e.username}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{e.score}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-4">No scores yet</div>
        )}
      </div>

      {/* Personal */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Top 5</h3>
        {data.personal.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {data.personal.map((e) => (
              <div key={e.rank} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-400 w-4">{e.rank}</span>
                  <span className="text-sm text-gray-500">
                    {e.correct}/{e.total}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{e.score}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-4">No scores yet</div>
        )}
      </div>
    </div>
  );
}
