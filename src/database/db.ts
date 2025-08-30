import * as dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

export const db = new Pool({
    connectionString: process.env.DATABASE_URL, // usa só a URL
    max: 3,
    idleTimeoutMillis: 30000,
    ssl: true
});

await db.query(`
CREATE TABLE IF NOT EXISTS dispositivos (
    id SERIAL PRIMARY KEY,
    mac TEXT UNIQUE NOT NULL,
    criado TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ultima_deteccao TIMESTAMPTZ NOT NULL,
    total_repeticoes INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS passagens (
    id SERIAL PRIMARY KEY,
    local TEXT NOT NULL,
    aparelho TEXT NOT NULL,
    data TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dispositivo_id INTEGER NOT NULL REFERENCES dispositivos(id) ON DELETE CASCADE,
    ultima_deteccao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`);