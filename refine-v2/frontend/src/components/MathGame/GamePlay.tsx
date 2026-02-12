import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameSession, GameConfig } from '../../types';

interface GamePlayProps {
  session: GameSession;
  config: GameConfig;
  onComplete: (answers: number[]) => void;
}

export default function GamePlay({ session, config, onComplete }: GamePlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);

  const answersRef = useRef<number[]>([]);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const endGame = useCallback((finalAnswers?: number[]) => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    onCompleteRef.current(finalAnswers ?? answersRef.current);
  }, []);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endGame]);

  // Keep input focused
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const handleSubmit = () => {
    if (completedRef.current || currentAnswer.trim() === '') return;

    const answer = Number(currentAnswer);
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIndex < session.problems.length - 1 && timeLeft > 0) {
      setCurrentIndex(currentIndex + 1);
    } else if (timeLeft > 0) {
      endGame(newAnswers);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const problem = session.problems[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const isLow = timeLeft <= 10;

  if (!problem || completedRef.current) return null;

  return (
    <div>
      {/* Top bar */}
      <div className="flex justify-between items-center mb-12">
        <span className="text-sm text-gray-400">
          {answers.length} answered
        </span>
        <span className={`text-2xl font-mono font-bold ${isLow ? 'text-red-500' : 'text-gray-900'}`}>
          {minutes}:{seconds}
        </span>
        {answers.length > 0 && (
          <button
            onClick={() => endGame()}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            End early
          </button>
        )}
        {answers.length === 0 && <div />}
      </div>

      {/* Problem */}
      <div className="text-center mb-10">
        <div className="text-6xl font-mono font-bold text-gray-900 tracking-tight">
          {problem.num1} {problem.operator} {problem.num2}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3 max-w-xs mx-auto">
        <input
          ref={inputRef}
          type="number"
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="?"
          autoFocus
          className="flex-1 px-4 py-3 text-center text-xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <button
          onClick={handleSubmit}
          disabled={currentAnswer.trim() === ''}
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
