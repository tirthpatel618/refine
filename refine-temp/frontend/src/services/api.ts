import type { GameConfig, GameSession, ValidationResponse, EmailResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://your-api.amazonaws.com';

const difficultyMap = {
  'easy': 1,
  'medium': 2,
  'hard': 3,
  'custom': 4
} as const;

export const api = {
  async getProblems(config: GameConfig): Promise<GameSession> {
    let problemCount = config.timeLimit;
    if (config.difficulty === 'easy') {
        problemCount = config.timeLimit * 2;
    } else if (config.difficulty === 'custom') {
        problemCount = config.timeLimit * 4;
    }

    const response = await fetch(`${API_URL}/api/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: config.mode,
        difficulty: difficultyMap[config.difficulty],
        ...(config.difficulty === 'custom' && config.customConfig && {
          config: {
            min: config.customConfig.min,
            max: config.customConfig.max
          }
        }),
        count: problemCount
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch problems');
    }
    
    return response.json();
  },

  async validateAnswers(
    seed: string, 
    config: GameConfig, 
    answers: (number | null)[]
  ): Promise<ValidationResponse> {
    const validAnswers = answers
      .filter((answer): answer is number => answer !== null)
      .map(answer => Number(answer));

    const requestBody = {
      seed,
      mode: config.mode,
      difficulty: difficultyMap[config.difficulty],
      answers: validAnswers,
      ...(config.difficulty === 'custom' && config.customConfig && {
        config: {
          min: config.customConfig.min,
          max: config.customConfig.max
        }
      })
    };

    console.log('Validate request:', requestBody); // Debug log

    const response = await fetch(`${API_URL}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Validation failed:', errorText);
      throw new Error('Failed to validate answers');
    }
    
    return response.json();
  },

  async submitEmail(email: string): Promise<EmailResponse> {
    const response = await fetch(`${API_URL}/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit email');
    }
    
    return response.json();
  }
};