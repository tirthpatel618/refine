export interface Problem {
    num1: number;
    operation: '+' | '-' | '×' | '÷'
    num2: number;
  }
  
  export interface GameSession {
    seed: string;
    problems: Problem[];
  }
  
  export interface GameConfig {
    mode: 'addition' | 'subtraction' | 'multiplication' | 'division';
    difficulty: 1 | 2 | 3 | 4;
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
  
  export interface EmailResponse {
    success: boolean;
    message: string;
  }