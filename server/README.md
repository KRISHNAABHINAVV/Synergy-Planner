# Synergy Backend Setup

## Overview
This is the Express.js backend API for the Synergy Life Planner application. It provides REST API endpoints for managing todos, notes, diet items, exercises, and user preferences.

## Features
- RESTful API endpoints
- In-memory storage (ready for MongoDB integration)
- CORS enabled for frontend communication
- TypeScript support
- Hot reload during development

## API Endpoints

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get todo by ID
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get note by ID
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Diet Items
- `GET /api/diet` - Get all diet items
- `GET /api/diet/:id` - Get diet item by ID
- `POST /api/diet` - Create new diet item
- `PUT /api/diet/:id` - Update diet item
- `DELETE /api/diet/:id` - Delete diet item

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/:id` - Get exercise by ID
- `POST /api/exercises` - Create new exercise
- `POST /api/exercises/bulk` - Bulk create exercises
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Delete exercise

### User Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences

### Health Check
- `GET /api/health` - Server health status

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update PORT if needed (default: 5000)

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## MongoDB Integration (Future)

The current implementation uses in-memory storage. To integrate MongoDB:

1. Install MongoDB driver or Mongoose:
   ```bash
   npm install mongoose
   ```

2. Replace the `Database` class in `src/database.ts` with MongoDB models and operations

3. Update `.env` with MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/synergy
   ```

## Project Structure

```
server/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── todos.ts
│   │   ├── notes.ts
│   │   ├── diet.ts
│   │   ├── exercises.ts
│   │   └── preferences.ts
│   ├── database.ts      # In-memory database (replace with MongoDB)
│   ├── types.ts         # TypeScript type definitions
│   └── server.ts        # Express app setup
├── package.json
├── tsconfig.json
└── .env
```

## Development

The server runs on `http://localhost:5000` by default.

- **Auto-reload**: The dev server automatically restarts when you make changes
- **TypeScript**: All code is written in TypeScript and compiled to JavaScript
- **CORS**: Enabled for frontend communication

## Notes

- Data is currently stored in memory and will be lost when the server restarts
- For production use, integrate with MongoDB or another persistent database
- The API is designed to be database-agnostic for easy migration
