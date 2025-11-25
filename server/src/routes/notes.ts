import { Router, Request, Response } from 'express';
import { db } from '../database';

const router = Router();

// Get all notes
router.get('/', async (req: Request, res: Response) => {
  try {
    const notes = await db.getNotes();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get note by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const note = await db.getNoteById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create note
router.post('/', async (req: Request, res: Response) => {
  try {
    const newNote = await db.createNote(req.body);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const updatedNote = await db.updateNote(id, req.body);
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseFloat(req.params.id);
    const success = await db.deleteNote(id);
    if (!success) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
