import React, { useState, useEffect, useRef } from 'react';
import type { GameSession, GameConfig } from '../../types';


interface GamePlayProps {
  session: GameSession;
  config: GameConfig;
  onComplete: (answers: number[]) => void;
}

const GamePlay: React.FC<GamePlayProps> = ({ session, config, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Use refs to access current values in timer without re-creating interval
  const answersRef = useRef<number[]>([]);
  const isCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  // Keep refs updated
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  
  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Timer effect - only runs once on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!isCompletedRef.current) {
            isCompletedRef.current = true;
            setIsCompleted(true);
            // Use ref to get current answers
            onCompleteRef.current(answersRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // Empty dependency array - timer never recreates

  const handleSubmit = () => {
    if (isCompleted || currentAnswer.trim() === '') return;

    const answer = Number(currentAnswer);
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    // Move to next question if available
    if (currentIndex < session.problems.length - 1 && timeLeft > 0) {
      setCurrentIndex(currentIndex + 1);
    } else if (timeLeft > 0) {
      // All questions answered before time up
      handleEndGame(newAnswers);
    }
  };

  const handleEndGame = (finalAnswers?: number[]) => {
    if (isCompleted) return;
    
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsCompleted(true);
    isCompletedRef.current = true;
    
    // Use provided answers or current answers
    const answersToSubmit = finalAnswers || answers;
    onComplete(answersToSubmit);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCompleted && currentAnswer.trim() !== '') {
      handleSubmit();
    }
  };

  // Check if we've run out of questions
  useEffect(() => {
    if (currentIndex >= session.problems.length && !isCompleted && answers.length > 0) {
      handleEndGame();
    }
  }, [currentIndex, session.problems.length, isCompleted, answers.length]);

  const currentProblem = session.problems[currentIndex];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
      <div className="text-center">
        <div className="flex justify-between items-center mb-8">
          <div className="text-white">
            Questions Answered: <span className="font-bold">{answers.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-white">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            {answers.length > 0 && !isCompleted && (
              <button
                onClick={() => handleEndGame()}
                className="px-4 py-2 bg-red-500/80 text-white text-sm font-semibold rounded-lg hover:bg-red-500 transition-colors"
              >
                End Game
              </button>
            )}
          </div>
        </div>

        {currentProblem && !isCompleted ? (
          <>
            <div className="text-5xl font-bold text-white mb-8">
              {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = ?
            </div>

            <input
              type="number"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your answer"
              className="w-64 px-6 py-4 text-2xl text-center rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 mb-6"
              autoFocus
              disabled={isCompleted}
            />

            <div>
              <button
                onClick={handleSubmit}
                disabled={isCompleted || currentAnswer.trim() === ''}
                className="px-12 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            </div>
          </>
        ) : (
          <div className="text-3xl font-bold text-white">
            {isCompleted ? "Game Ended!" : "Loading..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlay;