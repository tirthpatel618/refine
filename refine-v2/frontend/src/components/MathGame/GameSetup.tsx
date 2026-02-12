import { useState } from 'react';
import type { Mode, Difficulty } from '../../types';

interface GameSetupProps {
  mode: Mode;
  onStart: (difficulty: Difficulty, timeLimit: number, customConfig?: { min: number; max: number }) => void;
}

const modeLabels: Record<Mode, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  mixed: 'Mixed',
};

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'custom', label: 'Custom' },
];

const timeLimits = [30, 60, 90, 120];

export default function GameSetup({ mode, onStart }: GameSetupProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timeLimit, setTimeLimit] = useState(60);
  const [customMin, setCustomMin] = useState(1);
  const [customMax, setCustomMax] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStart(
        difficulty,
        timeLimit,
        difficulty === 'custom' ? { min: customMin, max: customMax } : undefined,
      );
    } catch {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{modeLabels[mode]}</h2>

      {/* Difficulty */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
        <div className="flex gap-2">
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
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

      {/* Custom range (only visible when custom selected) */}
      {difficulty === 'custom' && (
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Min</label>
            <input
              type="number"
              value={customMin}
              onChange={(e) => setCustomMin(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
            <input
              type="number"
              value={customMax}
              onChange={(e) => setCustomMax(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Time limit */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit</label>
        <div className="flex gap-2">
          {timeLimits.map((t) => (
            <button
              key={t}
              onClick={() => setTimeLimit(t)}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
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

      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Start Game'}
      </button>
    </div>
  );
}
