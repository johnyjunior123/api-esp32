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
    console.log('Recebendo dados...')
    type responseESP = { mac_addresses: string[]; local: string; aparelho: string };
    const esp32: responseESP = req.body;
    console.log(esp32)
    if (!esp32 || !Array.isArray(esp32.mac_addresses)) {
        return res.status(400).json({ error: 'MACs inválidos' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const query = db.prepare(`
        INSERT INTO dispositivos (mac, ultima_deteccao)
        VALUES (?, ?)
        ON CONFLICT(mac) DO UPDATE SET 
            ultima_deteccao = excluded.ultima_deteccao,
            total_repeticoes = total_repeticoes + 1
    `);

    const getDeviceId = db.prepare(`SELECT id FROM dispositivos WHERE mac = ?`);

    const insertPassagem = db.prepare(`
        INSERT INTO passagens (local, aparelho, data, dispositivo_id)
        VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((macs: string[]) => {
        for (const mac of macs) {
            // Inserir ou atualizar dispositivo
            query.run(mac, now);

            // Recuperar ID do dispositivo
            const device: Dispositivo | undefined = getDeviceId.get(mac) as Dispositivo | undefined;
            if (!device) throw new Error(`Não foi possível recuperar o ID do dispositivo ${mac}`);

            // Inserir passagem
            insertPassagem.run(esp32.local, esp32.aparelho, now, device.id);
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