
export enum Dashboard {
  Notes = 'NOTES',
  Planner = 'PLANNER',
  Health = 'HEALTH',
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  description: string;
  date: Date;
  time: string;
  type?: 'task' | 'meeting' | 'card';
}

export interface Note {
  id: number;
  title: string;
  content: string;
  date: Date;
  category?: string;
}

export interface FoodAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  description: string;
}
