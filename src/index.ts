import express from "express";
import { db } from "./database/db.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json())
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.post('/', (req, res) => {
    const macs: string[] = req.body.mac_addresses;

    if (!macs || !Array.isArray(macs)) {
        return res.status(400).json({ error: 'MACs inválidos' });
    }

    const stmt = db.prepare(`
    INSERT INTO devices_detected (mac_address, detected_at)
    VALUES (?, ?)
    ON CONFLICT(mac_address) DO UPDATE SET detected_at=excluded.detected_at
  `);

    const now = Date.now();

    const insertMany = db.transaction((macs: string[]) => {
        for (const mac of macs) {
            stmt.run(mac, now);
        }
    });

    try {
        insertMany(macs);
        res.json({ success: true, count: macs.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar MACs' });
    }
});

app.get('/active-devices', (req, res) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    try {
        const row = db.prepare(`
      SELECT COUNT(*) AS active_devices
      FROM devices_detected
      WHERE detected_at >= ?
    `).get(fiveMinutesAgo);

        res.json({ active_devices: row.active_devices });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar dispositivos ativos' });
    }
});

app.get('/macs/recent', (req, res) => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    try {
        const rows = db.prepare(`
      SELECT mac_address, detected_at
      FROM devices_detected
      WHERE detected_at >= ?
      ORDER BY detected_at DESC
    `).all(twentyFourHoursAgo);
        const result = rows.map((row: { mac_address: string; detected_at: string | number | Date; }) => ({
            mac_address: row.mac_address,
            detected_at: new Date(row.detected_at).toISOString()
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar MACs recentes' });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
});