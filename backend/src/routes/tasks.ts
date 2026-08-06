import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, category, date, search, tag } = req.query;
    
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];
    
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (priority) { query += ' AND priority = ?'; params.push(priority); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (date) { query += ' AND date(deadline) = date(?)'; params.push(date); }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (tag) { query += ' AND tags LIKE ?'; params.push(`%${tag}%`); }
    
    query += ' ORDER BY created_at DESC';
    
    const tasks = await db.all(query, params);
    
    const enriched = await Promise.all(tasks.map(async (task: any) => {
      const totalRow = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM checklist_items WHERE task_id = ?', [task.id]);
      const doneRow = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM checklist_items WHERE task_id = ? AND completed = 1', [task.id]);
      return {
        ...task,
        tags: JSON.parse(task.tags || '[]'),
        workflow: JSON.parse(task.workflow || '[]'),
        checklist_total: totalRow?.c || 0,
        checklist_done: doneRow?.c || 0,
      };
    }));
    
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const checklist = await db.all('SELECT * FROM checklist_items WHERE task_id = ? ORDER BY item_order ASC', [req.params.id]);
    const logs = await db.all('SELECT * FROM activity_logs WHERE task_id = ? ORDER BY created_at DESC', [req.params.id]);
    const attachments = await db.all('SELECT * FROM attachments WHERE task_id = ? ORDER BY created_at DESC', [req.params.id]);
    
    res.json({
      ...task,
      tags: JSON.parse(task.tags || '[]'),
      workflow: JSON.parse(task.workflow || '[]'),
      checklist,
      activity_logs: logs,
      attachments,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title, description = '', deadline = null, priority = 'medium',
      category = 'Khác', status = 'todo', progress = 0,
      assignee = '', tags = [], workflow = [], planner_slot = '',
      color = '', checklist = []
    } = req.body;
    
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(`
      INSERT INTO tasks (id, title, description, deadline, priority, category, status, progress, assignee, tags, workflow, planner_slot, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, title.trim(), description, deadline, priority, category, status, progress, assignee, JSON.stringify(tags), JSON.stringify(workflow), planner_slot, color, now, now]);
    
    if (checklist.length > 0) {
      for (let i = 0; i < checklist.length; i++) {
        await db.run('INSERT INTO checklist_items (id, task_id, text, completed, item_order) VALUES (?, ?, ?, 0, ?)', [uuidv4(), id, checklist[i], i]);
      }
    }
    
    await db.run('INSERT INTO activity_logs (id, task_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?)', [uuidv4(), id, 'created', `Task "${title}" đã được tạo`, now]);
    
    const created = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json({ ...created, tags: JSON.parse(created.tags), workflow: JSON.parse(created.workflow) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const allowed = ['title','description','deadline','priority','category','status','progress','assignee','tags','workflow','planner_slot','color'];
    const updates: string[] = [];
    const values: any[] = [];
    
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(
          field === 'tags' || field === 'workflow' ? JSON.stringify(req.body[field]) : req.body[field]
        );
      }
    }
    
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    
    const now = new Date().toISOString();
    updates.push('updated_at = ?');
    values.push(now, req.params.id);
    
    await db.run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
    
    const changedFields = Object.keys(req.body).filter(k => allowed.includes(k)).join(', ');
    await db.run('INSERT INTO activity_logs (id, task_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?)', [uuidv4(), req.params.id, 'updated', `Đã cập nhật: ${changedFields}`, now]);
    
    const updated = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ ...updated, tags: JSON.parse(updated.tags), workflow: JSON.parse(updated.workflow) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/checklist', async (req: Request, res: Response) => {
  const items = await db.all('SELECT * FROM checklist_items WHERE task_id = ? ORDER BY item_order ASC', [req.params.id]);
  res.json(items);
});

router.post('/:id/checklist', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Text required' });
    
    const countRow = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM checklist_items WHERE task_id = ?', [req.params.id]);
    const id = uuidv4();
    await db.run('INSERT INTO checklist_items (id, task_id, text, completed, item_order) VALUES (?, ?, ?, 0, ?)', [id, req.params.id, text.trim(), countRow?.c || 0]);
    
    const item = await db.get('SELECT * FROM checklist_items WHERE id = ?', [id]);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/checklist/:itemId', async (req: Request, res: Response) => {
  try {
    const { completed, text } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    
    if (completed !== undefined) { updates.push('completed = ?'); values.push(completed ? 1 : 0); }
    if (text !== undefined) { updates.push('text = ?'); values.push(text); }
    
    if (updates.length > 0) {
      values.push(req.params.itemId);
      await db.run(`UPDATE checklist_items SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    
    const totalRow = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM checklist_items WHERE task_id = ?', [req.params.id]);
    const doneRow = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM checklist_items WHERE task_id = ? AND completed = 1', [req.params.id]);
    const total = totalRow?.c || 0;
    const done = doneRow?.c || 0;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    
    await db.run('UPDATE tasks SET progress = ?, updated_at = ? WHERE id = ?', [progress, new Date().toISOString(), req.params.id]);
    
    const item = await db.get('SELECT * FROM checklist_items WHERE id = ?', [req.params.itemId]);
    res.json({ item, progress });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/checklist/:itemId', async (req: Request, res: Response) => {
  await db.run('DELETE FROM checklist_items WHERE id = ? AND task_id = ?', [req.params.itemId, req.params.id]);
  res.json({ success: true });
});

router.post('/:id/attachments', async (req: Request, res: Response) => {
  try {
    const { type, name, url } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });
    
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.run('INSERT INTO attachments (id, task_id, type, name, url, created_at) VALUES (?, ?, ?, ?, ?, ?)', [id, req.params.id, type || 'link', name, url, now]);
    await db.run('INSERT INTO activity_logs (id, task_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?)', [uuidv4(), req.params.id, 'attachment_added', `Đã thêm: ${name}`, now]);
    
    const att = await db.get('SELECT * FROM attachments WHERE id = ?', [id]);
    res.status(201).json(att);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/attachments/:attachId', async (req: Request, res: Response) => {
  await db.run('DELETE FROM attachments WHERE id = ? AND task_id = ?', [req.params.attachId, req.params.id]);
  res.json({ success: true });
});

export default router;
