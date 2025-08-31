import React, { useState } from 'react';
import { api } from '../../services/api';
import type { GameConfig, GameSession, ValidationResponse } from '../../types';
import GameConfigPanel from './GameConfig';
import GamePlay from './GamePlay';
import GameResults from './GameResults';

const MathGame: React.FC = () => {
  const [gameState, setGameState] = useState<'config' | 'playing' | 'results'>('config');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [gameResult, setGameResult] = useState<ValidationResponse | null>(null);

  const handleStartGame = async (config: GameConfig) => {
    try {
      const session = await api.getProblems(config);
      setGameConfig(config);
      setGameSession(session);
      setGameState('playing');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleGameComplete = async (answers: number[]) => {
    if (!gameSession || !gameConfig) return;
    
    try {
      const result = await api.validateAnswers(gameSession.seed, gameConfig, answers);
      setGameResult(result);
      setGameState('results');
    } catch (error) {
      console.error('Failed to validate answers:', error);
      alert('Failed to submit answers. Please try again.');
    }
  };

  const handlePlayAgain = () => {
    setGameState('config');
    setGameSession(null);
    setGameResult(null);
  };

  return (
    <div className="w-full">
      {gameState === 'config' && (
        <GameConfigPanel onStart={handleStartGame} />
      )}
      {gameState === 'playing' && gameSession && gameConfig && (
        <GamePlay
          session={gameSession}
          config={gameConfig}
          onComplete={handleGameComplete}
        />
      )}
      {gameState === 'results' && gameResult && gameConfig && (
        <GameResults
          result={gameResult}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default MathGame;