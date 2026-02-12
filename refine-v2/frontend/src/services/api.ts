import type {
  GameConfig,
  GameSession,
  ValidationResponse,
  AuthResponse,
  LeaderboardResponse,
  StatsResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const difficultyMap = {
  easy: 1,
  medium: 2,
  hard: 3,
  custom: 4,
} as const;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Game
  getProblems(config: GameConfig): Promise<GameSession> {
    let count = config.timeLimit;
    if (config.difficulty === 'easy') count = config.timeLimit * 2;
    else if (config.difficulty === 'custom') count = config.timeLimit * 4;

    return request('/api/problems', {
      method: 'POST',
      body: JSON.stringify({
        mode: config.mode,
        difficulty: difficultyMap[config.difficulty],
        count,
        ...(config.difficulty === 'custom' && config.customConfig && {
          config: { min: config.customConfig.min, max: config.customConfig.max },
        }),
      }),
    });
  },

  validateAnswers(seed: string, config: GameConfig, answers: (number | null)[]): Promise<ValidationResponse> {
    const validAnswers = answers
      .filter((a): a is number => a !== null)
      .map(Number);

    return request('/api/validate', {
      method: 'POST',
      body: JSON.stringify({
        seed,
        mode: config.mode,
        difficulty: difficultyMap[config.difficulty],
        answers: validAnswers,
        ...(config.difficulty === 'custom' && config.customConfig && {
          config: { min: config.customConfig.min, max: config.customConfig.max },
        }),
      }),
    });
  },

  // Auth
  signup(email: string, username: string, password: string): Promise<AuthResponse> {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout(): Promise<void> {
    return request('/api/auth/logout', { method: 'POST' });
  },

  getCurrentUser(): Promise<AuthResponse> {
    return request('/api/auth/me');
  },

  // Sessions
  saveGameSession(data: {
    mode: string;
    difficulty: number;
    score: number;
    correct: number;
    total: number;
    time_limit: number;
  }): Promise<void> {
    return request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Stats & Leaderboard
  getUserStats(difficulty: number, mode?: string): Promise<StatsResponse> {
    const params = new URLSearchParams({ difficulty: String(difficulty) });
    if (mode) params.set('mode', mode);
    return request(`/api/stats?${params}`);
  },

  getLeaderboard(mode: string, difficulty: number, timeLimit: number): Promise<LeaderboardResponse> {
    return request(`/api/leaderboard?mode=${mode}&difficulty=${difficulty}&time_limit=${timeLimit}`);
  },
};
