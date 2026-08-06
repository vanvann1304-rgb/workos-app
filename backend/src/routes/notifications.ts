import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init';

const router = Router();

router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys) return res.status(400).json({ error: 'Invalid subscription' });
    
    const id = uuidv4();
    await db.run('INSERT OR REPLACE INTO push_subscriptions (id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, endpoint, keys.p256dh, keys.auth, new Date().toISOString()]);
    
    res.status(201).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/upcoming', async (_req, res: Response) => {
  try {
    const now = new Date().toISOString();
    const inOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    const tasks = await db.all(`
      SELECT t.*, 
        CAST((julianday(t.deadline) - julianday('now')) * 24 * 60 AS INTEGER) as minutes_until_deadline
      FROM tasks t
      WHERE t.deadline IS NOT NULL 
        AND t.deadline > ? 
        AND t.deadline <= ?
        AND t.status NOT IN ('done', 'cancelled')
      ORDER BY t.deadline ASC
    `, [now, inOneHour]);
    
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/overdue', async (_req, res: Response) => {
  try {
    const now = new Date().toISOString();
    const tasks = await db.all(`
      SELECT * FROM tasks 
      WHERE deadline IS NOT NULL AND deadline < ? AND status NOT IN ('done', 'cancelled')
      ORDER BY deadline ASC
    `, [now]);
    res.json(tasks.map((t: any) => ({ ...t, tags: JSON.parse(t.tags || '[]') })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
