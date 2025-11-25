import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './database';
import todosRouter from './routes/todos';
import notesRouter from './routes/notes';
import dietRouter from './routes/diet';
import exercisesRouter from './routes/exercises';
import preferencesRouter from './routes/preferences';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/todos', todosRouter);
app.use('/api/notes', notesRouter);
app.use('/api/diet', dietRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/preferences', preferencesRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Synergy API is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server and connect to database
async function startServer() {
  try {
    console.log('========================================');
    console.log('Starting Synergy Life Planner Server...');
    console.log('========================================');
    
    // Connect to MongoDB
    await db.connect();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('========================================');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🗄️  MongoDB connected and ready`);
      console.log('========================================');
    });
  } catch (error) {
    console.error('========================================');
    console.error('❌ Failed to start server:', error);
    console.error('========================================');
    console.error('\nPlease check:');
    console.error('1. Your MongoDB URI in the .env file');
    console.error('2. Remove < > brackets from username/password');
    console.error('3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('4. Verify your username and password are correct');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

startServer();
