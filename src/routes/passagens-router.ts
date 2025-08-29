import { Router } from "express";
import { db } from "../database/db.js";

export const passagemRouter = Router()

passagemRouter.get('/passagens', (req, res) => {
    const { local, start, end } = req.query;

    if (!local || !start || !end) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios: local, start, end' });
    }

    try {
        // Total de passagens
        const totalStmt = db.prepare(`
            SELECT COUNT(*) as totalCount
            FROM passagens
            WHERE local = ? AND data BETWEEN ? AND ?
        `);
        const totalCount: { totalCount: number } = totalStmt.get(local, start, end) as { totalCount: number } || 0;
        // Total de MACs únicos
        const uniqueStmt = db.prepare(`
            SELECT COUNT(DISTINCT dispositivo_id) as uniqueCount
            FROM passagens
            WHERE local = ? AND data BETWEEN ? AND ?
        `);
        const uniqueCount: { uniqueCount: number } = uniqueStmt.get(local, start, end) as { uniqueCount: number } || 0;
        res.json({ local, inicio: start, fim: end, totalDePassagens: totalCount.totalCount, totalDePassagensUnicas: uniqueCount.uniqueCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar passagens' });
    }
});