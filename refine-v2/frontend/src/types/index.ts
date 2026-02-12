export type Mode = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

export interface Problem {
  id: number;
  num1: number;
  operator: string;
  num2: number;
}

export interface GameSession {
  seed: string;
  problems: Problem[];
}

export interface GameConfig {
  mode: Mode;
  difficulty: Difficulty;
  customConfig?: {
    min: number;
    max: number;
  };
  timeLimit: number;
}

export interface ValidationResponse {
  correct: number;
  total: number;
  score: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
}

export interface LeaderboardEntry {
  rank: number;
  username?: string;
  score: number;
  correct: number;
  total: number;
  time_limit: number;
  played_at: string;
}

export interface LeaderboardResponse {
  global: LeaderboardEntry[];
  personal: LeaderboardEntry[];
}

export interface ModeStat {
  mode: string;
  difficulty: number;
  games_played: number;
  best_score: number;
  avg_score: number;
  avg_accuracy: number;
}

export interface GameSessionRecord {
  id: number;
  mode: string;
  difficulty: number;
  score: number;
  correct: number;
  total: number;
  time_limit: number;
  played_at: string;
}

export interface StatsResponse {
  stats: ModeStat[];
  recent_games: GameSessionRecord[];
}
