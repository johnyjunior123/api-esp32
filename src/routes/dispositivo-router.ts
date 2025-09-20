import { db } from "../database/db.js";
import { Router, type Request, type Response } from "express";
import { inserirDispositivo, pegarDispositivos24Horas } from "../services/dispositivo-service.js";
import { atualizarUltimaPassagem, inserirPassagem, pegarUltimaPassagem, tempoDeSaidaMaiorQueUmaHora } from "../services/passagem-service.js";

export const dispositivoRouter = Router()

export type Dispositivo = {
    id: number
    mac: string
    criado: Date
    ultima_deteccao: Date
    total_repeticoes: number
}

dispositivoRouter.post('/macs', async (req, res) => {
    type responseESP = { mac_addresses: string[]; local: string; aparelho: string };
    const esp32: responseESP = req.body;

    console.log(`Recebendo dados... ${esp32.mac_addresses?.length ?? 0} macs`);

    if (!esp32 || !Array.isArray(esp32.mac_addresses)) {
        return res.status(400).json({ error: 'MACs inválidos' });
    }

    (async () => {
        try {
            await db.query('BEGIN');

            for (const mac of esp32.mac_addresses) {
                try {
                    const dispositivo = await inserirDispositivo(mac);
                    if (!dispositivo) throw new Error(`Falha ao inserir ${mac}`);

                    const ultimaPassagem = await pegarUltimaPassagem(dispositivo.id);
                    if (ultimaPassagem) {
                        if (await tempoDeSaidaMaiorQueUmaHora(ultimaPassagem)) {
                            await inserirPassagem(esp32.local, esp32.aparelho, dispositivo.id);
                        } else {
                            await atualizarUltimaPassagem(dispositivo.id);
                        }
                    } else {
                        await inserirPassagem(esp32.local, esp32.aparelho, dispositivo.id);
                    }
                } catch (err) {
                    console.error(`Erro no MAC ${mac}:`, err);
                    // Continua mesmo se um MAC der erro
                }
            }

            await db.query('COMMIT');
        } catch (err) {
            await db.query('ROLLBACK');
            console.error('Erro geral na transação:', err);
        }
    })();

    res.status(202).json({ received: true });
});

dispositivoRouter.get('/macs/recent', async (req: Request, res: Response) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
        const dispositivos = await pegarDispositivos24Horas(twentyFourHoursAgo)
        res.status(200).json(dispositivos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar MACs recentes' });
    }
});