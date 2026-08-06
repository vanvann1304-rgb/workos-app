import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init';

const router = Router();

router.get('/sessions', async (_req, res: Response) => {
  const sessions = await db.all('SELECT * FROM pomodoro_sessions ORDER BY started_at DESC LIMIT 100');
  res.json(sessions);
});

router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { task_id = null, duration = 25, type = 'work' } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.run('INSERT INTO pomodoro_sessions (id, task_id, duration, type, started_at, completed) VALUES (?, ?, ?, ?, ?, 0)',
      [id, task_id, duration, type, now]);
    res.status(201).json({ id, task_id, duration, type, started_at: now, completed: 0 });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch('/sessions/:id/complete', async (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();
    await db.run('UPDATE pomodoro_sessions SET completed = 1, ended_at = ? WHERE id = ?', [now, req.params.id]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/stats', async (_req, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = await db.get<{ c: number; total: number }>("SELECT COUNT(*) as c, SUM(duration) as total FROM pomodoro_sessions WHERE date(started_at) = ? AND completed = 1 AND type = 'work'", [today]);
    const weekSessions = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM pomodoro_sessions WHERE date(started_at) >= date('now', '-7 days') AND completed = 1 AND type = 'work'");
    res.json({
      today_sessions: todaySessions?.c || 0,
      today_minutes: todaySessions?.total || 0,
      week_sessions: weekSessions?.c || 0,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
