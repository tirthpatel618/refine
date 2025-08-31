import type { GameConfig, GameSession, ValidationResponse, EmailResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  async getProblems(config: GameConfig): Promise<GameSession> {
    const response = await fetch(`${API_URL}/api/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: config.mode,
        difficulty: config.difficulty,
        customConfig: config.customConfig,
        count: config.timeLimit 
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
    const response = await fetch(`${API_URL}/api/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seed,
        mode: config.mode,
        difficulty: config.difficulty,
        ...(config.customConfig && { 
          min: config.customConfig.min, 
          max: config.customConfig.max 
        }),
        answers
      })
    });
    
    if (!response.ok) {
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