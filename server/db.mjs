import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { lessonContent } from './lessons.mjs';

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      timezone TEXT NOT NULL, python_level TEXT NOT NULL, readiness TEXT NOT NULL,
      goal TEXT NOT NULL, availability TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','approved','waitlisted','declined')),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_codes (
      email TEXT PRIMARY KEY, hash TEXT NOT NULL, expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sessions (
      hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY, body TEXT NOT NULL, video_url TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1 CHECK(published IN (0,1))
    );
    CREATE TABLE IF NOT EXISTS progress (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL REFERENCES lessons(id), score INTEGER NOT NULL,
      completed_at TEXT NOT NULL, PRIMARY KEY(user_id,lesson_id)
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      week INTEGER NOT NULL CHECK(week BETWEEN 1 AND 4), url TEXT NOT NULL, notes TEXT NOT NULL,
      feedback TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'submitted'
        CHECK(status IN ('submitted','revision_requested','reviewed')),
      updated_at TEXT NOT NULL, UNIQUE(user_id,week)
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  const insert = db.prepare('INSERT OR IGNORE INTO lessons (id,body) VALUES (?,?)');
  for (const [id, lesson] of Object.entries(lessonContent)) insert.run(id, lesson.body);
  db.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)').run(
    'session',
    JSON.stringify({
      title: 'Weekly build room',
      date: '',
      url: '',
      description:
        'Bring your notebook, a question, or something you are stuck on. The first session time will be shared here.',
    }),
  );
  return db;
}
