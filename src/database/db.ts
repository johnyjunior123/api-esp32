import Database from 'better-sqlite3';

export const db: any = new Database('devices.db');

db.exec(`
CREATE TABLE IF NOT EXISTS devices_detected (
    mac_address TEXT PRIMARY KEY,
    detected_at INTEGER NOT NULL
);
`);
