import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { logger } from './logger';

/**
 * Si la ruta no es ':memory:', nos aseguramos de que exista el directorio
 * destino antes de que better-sqlite3 intente crear el archivo.
 */
function ensureDbDirectory(dbPath: string): void {
  if (dbPath === ':memory:') return;
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDbDirectory(config.dbPath);

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Esquema y migraciones idempotentes. Se ejecutan en cada arranque:
 * CREATE TABLE IF NOT EXISTS es seguro de reintentar y evita
 * la necesidad de un runner de migraciones para un proyecto de este tamaño.
 */
function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 0),
      duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
    CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
  `);
  logger.info('Migraciones de base de datos aplicadas correctamente');
}

migrate();
