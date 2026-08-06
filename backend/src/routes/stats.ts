import { Router, Response } from 'express';
import db from '../database/init';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const totalRow = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM tasks WHERE status NOT IN (\'cancelled\')');
    const todayTotalRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE date(deadline) = ? AND status NOT IN ('cancelled')", [today]);
    const todayDoneRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE date(deadline) = ? AND status = 'done'", [today]);
    const todayDoingRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE date(deadline) = ? AND status = 'doing'", [today]);
    const todayTodoRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE date(deadline) = ? AND status = 'todo'", [today]);
    const overdueRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE date(deadline) < ? AND status NOT IN ('done','cancelled')", [today]);
    
    const total = totalRow?.c || 0;
    const todayTotal = todayTotalRow?.c || 0;
    const todayDone = todayDoneRow?.c || 0;
    const todayDoing = todayDoingRow?.c || 0;
    const todayTodo = todayTodoRow?.c || 0;
    const overdue = overdueRow?.c || 0;
    
    const todayProgress = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;
    
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const doneRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE date(deadline) = ? AND status = 'done'", [dateStr]);
      const createdRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE date(created_at) = ?", [dateStr]);
      weekData.push({ date: dateStr, done: doneRow?.c || 0, created: createdRow?.c || 0 });
    }
    
    const monthData = [];
    const now = new Date();
    for (let i = 0; i < now.getDate(); i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dateStr = d.toISOString().split('T')[0];
      const doneRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE date(deadline) = ? AND status = 'done'", [dateStr]);
      monthData.push({ date: dateStr, done: doneRow?.c || 0 });
    }
    
    const byCategory = await db.all("SELECT category, COUNT(*) as count FROM tasks WHERE status NOT IN ('cancelled') GROUP BY category");
    
    const totalNonCancelRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE status != 'cancelled'");
    const totalDoneRow = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM tasks WHERE status = 'done'");
    const totalNonCancel = totalNonCancelRow?.c || 0;
    const totalDone = totalDoneRow?.c || 0;
    const completionRate = totalNonCancel > 0 ? Math.round((totalDone / totalNonCancel) * 100) : 0;
    
    res.json({
      total,
      today: { total: todayTotal, done: todayDone, doing: todayDoing, todo: todayTodo, overdue, progress: todayProgress },
      overdue,
      completionRate,
      weekData,
      monthData,
      byCategory,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
