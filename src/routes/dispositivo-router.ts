import { db } from "../database/db.js";
import { Router, type Request, type Response } from "express";

export const dispositivoRouter = Router()

type Dispositivo = {
    id: number
    mac: string
    criado: Date
    ultima_deteccao: Date
    total_repeticoes: number
}

dispositivoRouter.post('/macs', (req, res) => {
    console.log('Recebendo dados...');
    type responseESP = { mac_addresses: string[]; local: string; aparelho: string };
    const esp32: responseESP = req.body;

    if (!esp32 || !Array.isArray(esp32.mac_addresses)) {
        return res.status(400).json({ error: 'MACs inválidos' });
    }

    const now = new Date();
    const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const query = db.prepare(`
        INSERT INTO dispositivos (mac, ultima_deteccao)
        VALUES (?, ?)
        ON CONFLICT(mac) DO UPDATE SET 
            ultima_deteccao = excluded.ultima_deteccao,
            total_repeticoes = total_repeticoes + 1
    `);

    const getDeviceId = db.prepare(`SELECT id FROM dispositivos WHERE mac = ?`);

    const getLastPassagem = db.prepare(`
        SELECT id, ultima_deteccao
        FROM passagens
        WHERE dispositivo_id = ?
        ORDER BY ultima_deteccao DESC
        LIMIT 1
    `);

    const insertPassagem = db.prepare(`
        INSERT INTO passagens (local, aparelho, data, dispositivo_id)
        VALUES (?, ?, ?, ?)
    `);

    const updateUltimaPassagem = db.prepare(`
        UPDATE passagens SET ultima_deteccao = ? WHERE id = ?
    `);

    const insertMany = db.transaction((macs: string[]) => {
        for (const mac of macs) {
            query.run(mac, nowStr);

            const device: Dispositivo | undefined = getDeviceId.get(mac) as Dispositivo | undefined;
            if (!device) throw new Error(`Não foi possível recuperar o ID do dispositivo ${mac}`);

            const lastPassagem = getLastPassagem.get(device.id) as { id: number; ultima_deteccao: string } | undefined;

            if (lastPassagem) {
                const ultimaData = new Date(lastPassagem.ultima_deteccao);
                const diffMinutes = (now.getTime() - ultimaData.getTime()) / 1000 / 60;

                if (diffMinutes >= 15) {
                    insertPassagem.run(esp32.local, esp32.aparelho, nowStr, device.id);
                } else {
                    updateUltimaPassagem.run(nowStr, lastPassagem.id);
                }
            } else {
                insertPassagem.run(esp32.local, esp32.aparelho, nowStr, device.id);
            }
        }
    });

    try {
        insertMany(esp32.mac_addresses);
        res.json({ success: true, count: esp32.mac_addresses.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar MACs e passagens' });
    }
});


dispositivoRouter.get('/macs/recent', (req: Request, res: Response) => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    try {
        const rows = db.prepare(`
      SELECT mac_address, detected_at
      FROM devices_detected
      WHERE detected_at >= ?
      ORDER BY detected_at DESC
    `).all(twentyFourHoursAgo);
        const result = rows.map((row: any) => ({
            mac_address: row.mac_address,
            detected_at: new Date(row.detected_at).toISOString()
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar MACs recentes' });
    }
});