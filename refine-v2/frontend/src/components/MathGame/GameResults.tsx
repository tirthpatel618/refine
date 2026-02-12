import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ValidationResponse, GameConfig } from '../../types';
import Leaderboard from '../Leaderboard';

interface GameResultsProps {
  result: ValidationResponse;
  config: GameConfig;
  onPlayAgain: () => void;
}

const difficultyMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

export default function GameResults({ result, config, onPlayAgain }: GameResultsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const percentage = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  const showLeaderboard = user && config.difficulty !== 'custom';

  return (
    <div>
      {/* Score */}
      <div className="text-center mb-10">
        <div className="text-6xl font-bold text-gray-900 mb-2">
          {result.correct}<span className="text-gray-300">/{result.total}</span>
        </div>
        <div className="text-lg text-gray-500">{percentage}% correct</div>
        <div className="text-sm text-gray-400 mt-1">Score: {result.score}</div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center mb-10">
        <button
          onClick={onPlayAgain}
          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Play again
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-md border border-gray-200 hover:border-gray-400 transition-colors"
        >
          Change mode
        </button>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <Leaderboard mode={config.mode} difficulty={difficultyMap[config.difficulty]} timeLimit={config.timeLimit} />
      )}
    </div>
  );
}
