const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (response.status === 204) {
        return null as T;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Todos
  async getTodos() {
    return this.request<any[]>('/todos');
  }

  async createTodo(todo: any) {
    return this.request<any>('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  async updateTodo(id: number, updates: any) {
    return this.request<any>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTodo(id: number) {
    return this.request<void>(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  // Notes
  async getNotes() {
    return this.request<any[]>('/notes');
  }

  async createNote(note: any) {
    return this.request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: number, updates: any) {
    return this.request<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteNote(id: number) {
    return this.request<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Diet Items
  async getDietItems() {
    return this.request<any[]>('/diet');
  }

  async createDietItem(item: any) {
    return this.request<any>('/diet', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateDietItem(id: number, updates: any) {
    return this.request<any>(`/diet/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDietItem(id: number) {
    return this.request<void>(`/diet/${id}`, {
      method: 'DELETE',
    });
  }

  // Exercises
  async getExercises() {
    return this.request<any[]>('/exercises');
  }

  async createExercise(exercise: any) {
    return this.request<any>('/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    });
  }

  async bulkCreateExercises(exercises: any[]) {
    return this.request<any[]>('/exercises/bulk', {
      method: 'POST',
      body: JSON.stringify(exercises),
    });
  }

  async updateExercise(id: number, updates: any) {
    return this.request<any>(`/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteExercise(id: number) {
    return this.request<void>(`/exercises/${id}`, {
      method: 'DELETE',
    });
  }

  // User Preferences
  async getPreferences() {
    return this.request<any>('/preferences');
  }

  async updatePreferences(updates: any) {
    return this.request<any>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const api = new ApiService(API_BASE_URL);
