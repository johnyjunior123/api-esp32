import { Router } from "express";
import { db } from "../database/db.js";
import type { ResultQueryPassagens } from "../types/getPassagensPorPeriodo.js";

export const passagemRouter = Router()

passagemRouter.get('/passagens', (req, res) => {
    const { local, start, end } = req.query;

    if (!local || !start || !end) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios: local, start, end' });
    }

    try {
        const totalStmt = db.prepare(`
            SELECT COUNT(*) as oportunidades, COUNT(DISTINCT dispositivo_id) as unicos
            FROM passagens
            WHERE local = ? AND data BETWEEN ? AND ?
        `);
        const { oportunidades, unicos } = totalStmt.get(local, start, end) as ResultQueryPassagens
        res.json({ local, inicio: start, fim: end, oportunidades, unicos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar passagens' });
    }
});

passagemRouter.get('/passagens-por-periodo', (req, res) => {
    const { inicio, fim } = req.query;

    if (!inicio || !fim) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios: inicio, fim' });
    }

    try {
        const totalStmt = db.prepare(`
            SELECT 
                local, 
                COUNT(*) as oportunidades, 
                COUNT(DISTINCT dispositivo_id) as unicos
            FROM passagens
            WHERE data BETWEEN ? AND ?
            GROUP BY local
        `);

        let resultado = totalStmt.all(inicio, fim) as ResultQueryPassagens[];
        res.json({ inicio, fim, locais: resultado });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar passagens' });
    }
});