import React, { useState } from 'react';
import type { GameConfig } from '../../types';

interface GameConfigProps {
  onStart: (config: GameConfig) => void;
}

const GameConfigPanel: React.FC<GameConfigProps> = ({ onStart }) => {
  const [mode, setMode] = useState<GameConfig['mode']>('addition');
  const [difficulty, setDifficulty] = useState<GameConfig['difficulty']>('easy');
  const [timeLimit, setTimeLimit] = useState(60);
  const [customMin, setCustomMin] = useState(1);
  const [customMax, setCustomMax] = useState(100);

  const handleStart = () => {
    const config: GameConfig = {
      mode,
      difficulty,
      timeLimit,
      ...(difficulty === 'custom' && {
        customConfig: { min: customMin, max: customMax }
      })
    };
    onStart(config);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
      <h3 className="text-2xl font-semibold text-white mb-6">in the meantime, you can practice some mental math here</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2">Operation</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as GameConfig['mode'])}
            className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="addition">Addition</option>
            <option value="subtraction">Subtraction</option>
            <option value="multiplication">Multiplication</option>
            <option value="division">Division</option>
          </select>
        </div>

        <div>
          <label className="block text-white mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as GameConfig['difficulty'])}
            className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {difficulty === 'custom' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-white mb-2">Min</label>
              <input
                type="number"
                value={customMin}
                onChange={(e) => setCustomMin(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white mb-2">Max</label>
              <input
                type="number"
                value={customMax}
                onChange={(e) => setCustomMax(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-white mb-2">Time Limit</label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
            <option value={120}>120 seconds</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          className="w-full px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-white/90 transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default GameConfigPanel;