import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const notes = await db.all('SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC');
    res.json(notes.map((n: any) => ({ ...n, tags: JSON.parse(n.tags || '[]') })));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const note = await db.get('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ ...note, tags: JSON.parse(note.tags || '[]') });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title = 'Untitled', content = '', tags = [], pinned = false } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.run('INSERT INTO notes (id, title, content, tags, pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, content, JSON.stringify(tags), pinned ? 1 : 0, now, now]);
    const note = await db.get('SELECT * FROM notes WHERE id = ?', [id]);
    res.status(201).json({ ...note, tags: JSON.parse(note.tags) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, tags, pinned } = req.body;
    const now = new Date().toISOString();
    const updates: string[] = ['updated_at = ?'];
    const values: any[] = [now];
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (content !== undefined) { updates.push('content = ?'); values.push(content); }
    if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }
    if (pinned !== undefined) { updates.push('pinned = ?'); values.push(pinned ? 1 : 0); }
    values.push(req.params.id);
    await db.run(`UPDATE notes SET ${updates.join(', ')} WHERE id = ?`, values);
    const note = await db.get('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    res.json({ ...note, tags: JSON.parse(note.tags) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  await db.run('DELETE FROM notes WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
