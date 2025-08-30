import { db } from "../database/db.js";
import { Router, type Request, type Response } from "express";
import { inserirDispositivo, pegarDispositivos24Horas } from "../services/dispositivo-service.js";
import { atualizarUltimaPassagem, inserirPassagem, pegarUltimaPassagem, tempoDeSaidaMaiorQue15Minutos } from "../services/passagem-service.js";

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
    console.log(`Recebendo dados... ${esp32.mac_addresses.length} macs`);

    if (!esp32 || !Array.isArray(esp32.mac_addresses)) {
        return res.status(400).json({ error: 'MACs inválidos' });
    }

    try {
        await db.query('BEGIN')
        for (const mac of esp32.mac_addresses) {
            const dispositivo = await inserirDispositivo(mac)
            if (!dispositivo) throw new Error(`Não foi possível recuperar o ID do dispositivo ${mac}`);
            const ultimaPassagem = await pegarUltimaPassagem(dispositivo.id)

            if (ultimaPassagem) {
                if (await tempoDeSaidaMaiorQue15Minutos(ultimaPassagem)) {
                    inserirPassagem(esp32.local, esp32.aparelho, dispositivo.id)
                    continue
                }
                atualizarUltimaPassagem(dispositivo.id)
            } else {
                inserirPassagem(esp32.local, esp32.aparelho, dispositivo.id)
            }
        }
        await db.query('COMMIT')
        res.json({ success: true, count: esp32.mac_addresses.length });
    } catch (err) {
        await db.query('ROLLBACK'); // desfaz tudo se deu erro
        console.error(err);
        console.log('Erro ao salvador MACs e Passagens')
        res.status(500).json({ error: 'Erro ao salvar MACs e passagens' });
    }
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