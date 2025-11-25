import { Router, Request, Response } from 'express';
import { db } from '../database';

const router = Router();

// Get all todos
router.get('/', async (req: Request, res: Response) => {
  try {
    const todos = await db.getTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Get todo by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const todo = await db.getTodoById(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// Create todo
router.post('/', async (req: Request, res: Response) => {
  try {
    const newTodo = await db.createTodo(req.body);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const updatedTodo = await db.updateTodo(id, req.body);
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const success = await db.deleteTodo(id);
    if (!success) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
