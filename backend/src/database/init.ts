import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../database.sqlite');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const rawDb = new sqlite3.Database(DB_PATH);

// Helper wrapper for sqlite3 to mimic clean sync/async query operations
export const db = {
  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  },
  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  },
  run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  prepare(sql: string) {
    return {
      all: (...params: any[]) => db.all(sql, params),
      get: (...params: any[]) => db.get(sql, params),
      run: (...params: any[]) => db.run(sql, params),
    };
  }
};

export async function initDatabase(): Promise<void> {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      deadline TEXT,
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
      category TEXT DEFAULT 'Khác',
      status TEXT DEFAULT 'todo' CHECK(status IN ('todo','doing','waiting','done','cancelled')),
      progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
      assignee TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      workflow TEXT DEFAULT '[]',
      planner_slot TEXT DEFAULT '',
      color TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      item_order INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      type TEXT DEFAULT 'link' CHECK(type IN ('file','link')),
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      mime_type TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled',
      content TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      pinned INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '⭐',
      color TEXT DEFAULT '#2563eb',
      repeat TEXT DEFAULT 'daily' CHECK(repeat IN ('daily','weekly','monthly','yearly')),
      target_days TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      duration INTEGER DEFAULT 25,
      type TEXT DEFAULT 'work' CHECK(type IN ('work','break','long_break')),
      started_at TEXT,
      ended_at TEXT,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      remind_at TEXT NOT NULL,
      sent INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES
      ('theme', 'system'),
      ('pin_enabled', '0'),
      ('pin_hash', ''),
      ('pomodoro_work', '25'),
      ('pomodoro_break', '5'),
      ('pomodoro_long_break', '15'),
      ('sound_enabled', '1'),
      ('notification_enabled', '1');
  `);

  try {
    await db.exec('ALTER TABLE tasks ADD COLUMN color TEXT DEFAULT ""');
  } catch (e) {
    // Column already exists, ignore
  }

  console.log('✅ Database initialized (sqlite3)');
}

export default db;
