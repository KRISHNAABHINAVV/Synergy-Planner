import { Router, Request, Response } from 'express';
import { db } from '../database';

const router = Router();

// Get all exercises
router.get('/', async (req: Request, res: Response) => {
  try {
    const exercises = await db.getExercises();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Get exercise by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const exercise = await db.getExerciseById(id);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// Create exercise
router.post('/', async (req: Request, res: Response) => {
  try {
    const newExercise = await db.createExercise(req.body);
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

// Bulk create exercises
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const exercises = await db.bulkCreateExercises(req.body);
    res.status(201).json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exercises' });
  }
});

// Update exercise
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const updatedExercise = await db.updateExercise(id, req.body);
    if (!updatedExercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(updatedExercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// Delete exercise
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const success = await db.deleteExercise(id);
    if (!success) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

export default router;
