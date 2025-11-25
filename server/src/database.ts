import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Todo, Note, DietItem, Exercise, UserPreferences } from './types';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private client: MongoClient;
  private db: Db | null = null;
  private todosCollection: Collection<Todo> | null = null;
  private notesCollection: Collection<Note> | null = null;
  private dietItemsCollection: Collection<DietItem> | null = null;
  private exercisesCollection: Collection<Exercise> | null = null;
  private preferencesCollection: Collection<UserPreferences> | null = null;

  constructor() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/synergy-planner';
    console.log('MongoDB URI configured:', uri.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local');
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to MongoDB...');
      await this.client.connect();
      
      // Verify connection by pinging the database
      await this.client.db('admin').command({ ping: 1 });
      console.log('✓ Connected to MongoDB successfully');
      
      this.db = this.client.db();
      console.log(`✓ Using database: ${this.db.databaseName}`);
      
      // Initialize collections
      this.todosCollection = this.db.collection<Todo>('todos');
      this.notesCollection = this.db.collection<Note>('notes');
      this.dietItemsCollection = this.db.collection<DietItem>('dietItems');
      this.exercisesCollection = this.db.collection<Exercise>('exercises');
      this.preferencesCollection = this.db.collection<UserPreferences>('preferences');
      
      // Create indexes for better performance
      await this.createIndexes();
      console.log('✓ Collections initialized successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    try {
      // Create indexes on id fields for faster lookups
      await this.todosCollection!.createIndex({ id: 1 });
      await this.notesCollection!.createIndex({ id: 1 });
      await this.dietItemsCollection!.createIndex({ id: 1 });
      await this.exercisesCollection!.createIndex({ id: 1 });
      console.log('✓ Database indexes created');
    } catch (error) {
      console.warn('Warning: Could not create indexes:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log('Disconnected from MongoDB');
  }

  // Todos
  async getTodos(): Promise<Todo[]> {
    return await this.todosCollection!.find({}).toArray();
  }

  async getTodoById(id: number): Promise<Todo | null> {
    return await this.todosCollection!.findOne({ id });
  }

  async createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    const newTodo: Todo = {
      ...todo,
      id: Date.now() + Math.random()
    };
    await this.todosCollection!.insertOne(newTodo as any);
    return newTodo;
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<Todo | null> {
    const result = await this.todosCollection!.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async deleteTodo(id: number): Promise<boolean> {
    const result = await this.todosCollection!.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Notes
  async getNotes(): Promise<Note[]> {
    return await this.notesCollection!.find({}).toArray();
  }

  async getNoteById(id: number): Promise<Note | null> {
    return await this.notesCollection!.findOne({ id });
  }

  async createNote(note: Omit<Note, 'id'>): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: Date.now() + Math.random()
    };
    await this.notesCollection!.insertOne(newNote as any);
    return newNote;
  }

  async updateNote(id: number, updates: Partial<Note>): Promise<Note | null> {
    const result = await this.notesCollection!.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await this.notesCollection!.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Diet Items
  async getDietItems(): Promise<DietItem[]> {
    return await this.dietItemsCollection!.find({}).toArray();
  }

  async getDietItemById(id: number): Promise<DietItem | null> {
    return await this.dietItemsCollection!.findOne({ id });
  }

  async createDietItem(item: Omit<DietItem, 'id'>): Promise<DietItem> {
    const newItem: DietItem = {
      ...item,
      id: Date.now() + Math.random()
    };
    await this.dietItemsCollection!.insertOne(newItem as any);
    return newItem;
  }

  async updateDietItem(id: number, updates: Partial<DietItem>): Promise<DietItem | null> {
    const result = await this.dietItemsCollection!.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async deleteDietItem(id: number): Promise<boolean> {
    const result = await this.dietItemsCollection!.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return await this.exercisesCollection!.find({}).toArray();
  }

  async getExerciseById(id: number): Promise<Exercise | null> {
    return await this.exercisesCollection!.findOne({ id });
  }

  async createExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now() + Math.random()
    };
    await this.exercisesCollection!.insertOne(newExercise as any);
    return newExercise;
  }

  async updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | null> {
    const result = await this.exercisesCollection!.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async deleteExercise(id: number): Promise<boolean> {
    const result = await this.exercisesCollection!.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async bulkCreateExercises(exercises: Omit<Exercise, 'id'>[]): Promise<Exercise[]> {
    const newExercises = exercises.map(ex => ({
      ...ex,
      id: Date.now() + Math.random()
    }));
    await this.exercisesCollection!.insertMany(newExercises as any);
    return newExercises;
  }

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    const prefs = await this.preferencesCollection!.findOne({});
    return prefs || { theme: 'dark' };
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const result = await this.preferencesCollection!.findOneAndUpdate(
      {},
      { $set: updates },
      { returnDocument: 'after', upsert: true }
    );
    return result || { theme: 'dark', ...updates };
  }
}

export const db = new Database();
