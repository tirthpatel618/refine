import { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Mode, Difficulty, GameConfig, GameSession, ValidationResponse } from '../../types';
import GameSetup from './GameSetup';
import GamePlay from './GamePlay';
import GameResults from './GameResults';

interface MathGameProps {
  mode: Mode;
}

const difficultyMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

export default function MathGame({ mode }: MathGameProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<'setup' | 'playing' | 'results'>('setup');
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [result, setResult] = useState<ValidationResponse | null>(null);

  const handleStart = async (difficulty: Difficulty, timeLimit: number, customConfig?: { min: number; max: number }) => {
    const gameConfig: GameConfig = {
      mode,
      difficulty,
      timeLimit,
      ...(difficulty === 'custom' && customConfig && { customConfig }),
    };

    const gameSession = await api.getProblems(gameConfig);
    setConfig(gameConfig);
    setSession(gameSession);
    setPhase('playing');
  };

  const handleComplete = async (answers: number[]) => {
    if (!session || !config) return;

    const validation = await api.validateAnswers(session.seed, config, answers);

    // Save session before showing results so leaderboard includes this game
    if (user && config.difficulty !== 'custom') {
      try {
        await api.saveGameSession({
          mode: config.mode,
          difficulty: difficultyMap[config.difficulty],
          score: validation.score,
          correct: validation.correct,
          total: validation.total,
          time_limit: config.timeLimit,
        });
      } catch {
        // Don't block results if save fails
      }
    }

    setResult(validation);
    setPhase('results');
  };

  const handlePlayAgain = () => {
    setPhase('setup');
    setSession(null);
    setResult(null);
  };

  return (
    <>
      {phase === 'setup' && <GameSetup mode={mode} onStart={handleStart} />}
      {phase === 'playing' && session && config && (
        <GamePlay session={session} config={config} onComplete={handleComplete} />
      )}
      {phase === 'results' && result && config && (
        <GameResults result={result} config={config} onPlayAgain={handlePlayAgain} />
      )}
    </>
  );
}
