import express from "express";
import { db } from "./database/db.js";
import dotenv from 'dotenv';
import { dispositivoRouter } from "./routes/dispositivo-router.js";
import { passagemRouter } from "./routes/passagens-router.js";
import cors from 'cors';
dotenv.config();

const app = express();
app.use(express.json())
app.use(cors())
app.use(dispositivoRouter)
app.use(passagemRouter)

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.get('/', (req, res) => {
    res.send("Api em funcionamento...")
})

app.get('/active-devices', (req, res) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    try {
        const row: any = db.prepare(`
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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
});