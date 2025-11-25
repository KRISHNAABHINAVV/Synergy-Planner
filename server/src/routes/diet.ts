import { Router, Request, Response } from 'express';
import { db } from '../database';

const router = Router();

// Get all diet items
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await db.getDietItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diet items' });
  }
});

// Get diet item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const item = await db.getDietItemById(id);
    if (!item) {
      return res.status(404).json({ error: 'Diet item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diet item' });
  }
});

// Create diet item
router.post('/', async (req: Request, res: Response) => {
  try {
    const newItem = await db.createDietItem(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create diet item' });
  }
});

// Update diet item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const updatedItem = await db.updateDietItem(id, req.body);
    if (!updatedItem) {
      return res.status(404).json({ error: 'Diet item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update diet item' });
  }
});

// Delete diet item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const success = await db.deleteDietItem(id);
    if (!success) {
      return res.status(404).json({ error: 'Diet item not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete diet item' });
  }
});

export default router;
