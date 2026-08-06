import express from 'express';
import cors from 'cors';
import path from 'path';
import db, { initDatabase } from './database/init';
import tasksRouter from './routes/tasks';
import notesRouter from './routes/notes';
import habitsRouter from './routes/habits';
import pomodoroRouter from './routes/pomodoro';
import statsRouter from './routes/stats';
import settingsRouter from './routes/settings';
import notificationsRouter from './routes/notifications';
import uploadRouter from './routes/upload';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

initDatabase().catch(err => console.error('Database init error:', err));

app.use('/api/tasks', tasksRouter);
app.use('/api/notes', notesRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/pomodoro', pomodoroRouter);
app.use('/api/stats', statsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/upload', uploadRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/backup', async (_req, res) => {
  try {
    const tasks = await db.all('SELECT * FROM tasks');
    const checklist = await db.all('SELECT * FROM checklist_items');
    const logs = await db.all('SELECT * FROM activity_logs');
    const attachments = await db.all('SELECT * FROM attachments');
    const notes = await db.all('SELECT * FROM notes');
    const habits = await db.all('SELECT * FROM habits');
    const habitLogs = await db.all('SELECT * FROM habit_logs');
    
    res.json({
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      data: { tasks, checklist, logs, attachments, notes, habits, habitLogs }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

export default app;
