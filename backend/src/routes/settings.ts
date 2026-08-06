import { Router, Request, Response } from 'express';
import db from '../database/init';

const router = Router();

router.get('/', async (_req, res: Response) => {
  const settings = await db.all('SELECT key, value FROM settings');
  const obj: Record<string, string> = {};
  (settings as any[]).forEach(s => { obj[s.key] = s.value; });
  res.json(obj);
});

router.patch('/', async (req: Request, res: Response) => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
