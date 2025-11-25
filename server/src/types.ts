export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  description: string;
  date: string;
  time: string;
  type?: 'task' | 'meeting' | 'card';
}

export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  category?: string;
}

export interface DietItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  date: string;
}

export interface Exercise {
  id: number;
  name: string;
  details: string;
  time: string;
  completed: boolean;
  isAiGenerated?: boolean;
  date: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
}
