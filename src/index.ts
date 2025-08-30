import express from "express";
import dotenv from 'dotenv';
import { dispositivoRouter } from "./routes/dispositivo-router.js";
import { passagemRouter } from "./routes/passagens-router.js";
import { db } from "./database/db.js";
dotenv.config();

const app = express();
app.use(express.json())
app.use(dispositivoRouter)
app.use(passagemRouter)

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.get('/', (req, res) => {
    res.send("Api em funcionamento...")
})

app.get('/active-devices', async (req, res) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    try {
        const query = ` SELECT COUNT(*) AS active_devices
        FROM devices_detected WHERE detected_at >= $1`
        const resultado = await db.query(query, [fiveMinutesAgo])
        res.json({ active_devices: Number(resultado.rows[0].active_devices) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar dispositivos ativos' });
    }
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
});