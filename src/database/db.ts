import sqlite, { type Database } from 'better-sqlite3';

export const db: Database = new sqlite('devices.db');

db.exec(`
CREATE TABLE IF NOT EXISTS dispositivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mac TEXT UNIQUE NOT NULL,
    criado TEXT DEFAULT (CURRENT_TIMESTAMP),
    ultima_deteccao TEXT NOT NULL,
    total_repeticoes INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS passagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    local TEXT NOT NULL,
    aparelho TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    dispositivo_id INTEGER NOT NULL,
    ultima_deteccao TEXT DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY(dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE
);
`);