import { Router, Request, Response } from 'express';
import { db } from '../database';

const router = Router();

// Get user preferences
router.get('/', async (req: Request, res: Response) => {
  try {
    const preferences = await db.getUserPreferences();
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user preferences
router.put('/', async (req: Request, res: Response) => {
  try {
    const preferences = await db.updateUserPreferences(req.body);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
