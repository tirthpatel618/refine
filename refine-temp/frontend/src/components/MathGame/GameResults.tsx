import React from 'react';
import type { ValidationResponse } from '../../types';

interface GameResultsProps {
  result: ValidationResponse;
  onPlayAgain: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({ result, onPlayAgain }) => {
  const percentage = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
      <h3 className="text-3xl font-bold text-white mb-6">Game Complete!</h3>
      
      <div className="space-y-4 mb-8">
        <div className="text-5xl font-bold text-white">
          {result.correct} / {result.total}
        </div>
        <div className="text-2xl text-white/90">
          {percentage}% Correct
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="px-12 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-white/90 transition-colors"
      >
        Play Again
      </button>
    </div>
  );
};

export default GameResults;