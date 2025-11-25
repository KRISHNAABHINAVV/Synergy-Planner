# Synergy - The Ultimate Life Planner

## Backend & Frontend Integration Setup

This project now includes a full-stack implementation with Express.js backend and React frontend. **LocalStorage has been removed** and all data is now managed through the backend API, ready for MongoDB integration.

---

## 🚀 Quick Start

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Start the Backend Server
```bash
# Development mode (with hot reload)
npm run dev

# The server will start on http://localhost:5000
```

### 3. Start the Frontend
```bash
# In a new terminal, from the project root
npm run dev

# The frontend will start on http://localhost:5173 (or another port)
```

---

## 📁 Project Structure

```
synergy/
├── server/                   # Backend API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── database.ts      # In-memory storage (ready for MongoDB)
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── server.ts        # Express server
│   ├── .env                 # Backend environment variables
│   └── package.json
│
├── services/                # Frontend API service
│   └── api.ts              # API client
│
├── components/             # React components (updated to use API)
│   ├── notes/
│   ├── planner/
│   └── health/
│
├── contexts/               # React contexts
│   └── ThemeContext.tsx   # Now uses backend for theme persistence
│
└── .env                   # Frontend environment variables
```

---

## 🔧 Configuration

### Backend (.env in server/)
```env
PORT=5000
NODE_ENV=development
```

### Frontend (.env in root)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api`

### Notes
- `GET /api/notes` - Fetch all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Todos (Planner)
- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Diet Items
- `GET /api/diet` - Fetch all diet items
- `POST /api/diet` - Create diet item
- `DELETE /api/diet/:id` - Delete diet item

### Exercises (Workout)
- `GET /api/exercises` - Fetch all exercises
- `POST /api/exercises` - Create exercise
- `POST /api/exercises/bulk` - Bulk create exercises
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Delete exercise

### User Preferences
- `GET /api/preferences` - Get theme preference
- `PUT /api/preferences` - Update theme

---

## 🔄 Changes from localStorage to Backend

### What Changed:
1. **ThemeContext** - Now saves theme to backend API
2. **NotesDashboard** - All CRUD operations use API
3. **PlannerDashboard** - Todos managed through backend
4. **DietPlanner** - Diet items persisted via API
5. **WorkoutPlanner** - Exercises stored in backend

### Benefits:
- ✅ Data persistence across devices (when MongoDB is added)
- ✅ No data loss on browser clear
- ✅ Ready for multi-user support
- ✅ Centralized data management
- ✅ Easy MongoDB integration

---

## 🗃️ MongoDB Integration (Next Steps)

The backend is designed to easily switch from in-memory storage to MongoDB:

### 1. Install Mongoose
```bash
cd server
npm install mongoose
npm install --save-dev @types/mongoose
```

### 2. Create MongoDB Models

Example for Todos (`server/src/models/Todo.ts`):
```typescript
import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  description: String,
  date: Date,
  time: String,
  type: String
});

export const TodoModel = mongoose.model('Todo', todoSchema);
```

### 3. Connect to MongoDB

Update `server/src/server.ts`:
```typescript
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/synergy');
```

### 4. Update Database Class

Replace methods in `server/src/database.ts` with MongoDB operations:
```typescript
async getTodos() {
  return await TodoModel.find();
}

async createTodo(todo: Omit<Todo, 'id'>) {
  const newTodo = new TodoModel(todo);
  return await newTodo.save();
}
```

### 5. Update .env
```env
MONGODB_URI=mongodb://localhost:27017/synergy
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/synergy
```

---

## 🎨 Features

### Notes
- Rich text editor with blocks (text, images, charts, drawings, tables)
- AI-powered features ready
- Full CRUD operations via API

### Planner
- Calendar view with todos
- Task completion tracking
- Consistency streak visualization
- Date-specific task management

### Health - Diet
- AI-powered food calculator (requires Gemini API key)
- Camera food scanner
- Manual nutrition entry
- Daily calorie/macro tracking

### Health - Workout
- AI workout plan generator (requires Gemini API key)
- Weekly workout calendar
- Exercise tracking with completion status
- Custom exercise creation

---

## 🔐 Environment Variables

### For AI Features (Optional)
Add to your frontend `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

---

## 🐛 Troubleshooting

### Backend not starting?
- Check if port 5000 is available
- Verify all dependencies are installed: `cd server && npm install`
- Check `.env` file exists in server directory

### Frontend can't connect to backend?
- Ensure backend is running on http://localhost:5000
- Check `.env` file in root has correct `VITE_API_URL`
- Check browser console for CORS errors

### Data not persisting?
- **This is expected!** Current implementation uses in-memory storage
- Data resets when backend restarts
- Follow MongoDB integration steps above for persistence

---

## 📦 Production Deployment

### Build Backend
```bash
cd server
npm run build
npm start
```

### Build Frontend
```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Environment Variables for Production
Update API URL in frontend `.env`:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## 🎯 Next Steps

1. ✅ Backend API created
2. ✅ Frontend connected to backend
3. ✅ localStorage removed
4. ⏳ **Next: Add MongoDB for persistence**
5. ⏳ Add user authentication
6. ⏳ Deploy to production

---

## 📝 Notes

- The backend currently uses **in-memory storage** - data will be lost on server restart
- All API calls include error handling with user-friendly alerts
- The codebase is ready for MongoDB - just follow the integration steps above
- TypeScript is used throughout for type safety

---

## 🤝 Contributing

When adding new features:
1. Create the backend endpoint in `server/src/routes/`
2. Add method to `services/api.ts`
3. Update component to use the API service
4. Test both frontend and backend

---

Happy coding! 🎉
