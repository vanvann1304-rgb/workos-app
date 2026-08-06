import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const habits = await db.all('SELECT * FROM habits ORDER BY created_at ASC');
    res.json(habits.map((h: any) => ({ ...h, target_days: JSON.parse(h.target_days || '[]') })));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, icon = '⭐', color = '#2563eb', repeat = 'daily', target_days = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = uuidv4();
    await db.run('INSERT INTO habits (id, name, icon, color, repeat, target_days, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, icon, color, repeat, JSON.stringify(target_days), new Date().toISOString()]);
    const habit = await db.get('SELECT * FROM habits WHERE id = ?', [id]);
    res.status(201).json({ ...habit, target_days: JSON.parse(habit.target_days) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { name, icon, color, repeat, target_days } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (icon) { updates.push('icon = ?'); values.push(icon); }
    if (color) { updates.push('color = ?'); values.push(color); }
    if (repeat) { updates.push('repeat = ?'); values.push(repeat); }
    if (target_days) { updates.push('target_days = ?'); values.push(JSON.stringify(target_days)); }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates' });
    values.push(req.params.id);
    await db.run(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`, values);
    const habit = await db.get('SELECT * FROM habits WHERE id = ?', [req.params.id]);
    res.json({ ...habit, target_days: JSON.parse(habit.target_days) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
  await db.run('DELETE FROM habits WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    let query = 'SELECT * FROM habit_logs WHERE 1=1';
    const params: any[] = [];
    if (from) { query += ' AND date >= ?'; params.push(from); }
    if (to) { query += ' AND date <= ?'; params.push(to); }
    const logs = await db.all(query, params);
    res.json(logs);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/log', async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Date required' });
    
    const existing = await db.get('SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?', [req.params.id, date]);
    
    if (existing) {
      const newCompleted = existing.completed ? 0 : 1;
      await db.run('UPDATE habit_logs SET completed = ? WHERE id = ?', [newCompleted, existing.id]);
      res.json({ ...existing, completed: newCompleted });
    } else {
      const id = uuidv4();
      await db.run('INSERT INTO habit_logs (id, habit_id, date, completed) VALUES (?, ?, ?, 1)', [id, req.params.id, date]);
      res.json({ id, habit_id: req.params.id, date, completed: 1 });
    }
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
