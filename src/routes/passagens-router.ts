import { Router } from "express";
import { pegarDadosGeraisPassagens, pegarDadosGeraisPassagensPorPeriodo } from "../services/passagem-service.js";

export const passagemRouter = Router()

passagemRouter.get('/passagens', async (req, res) => {
    const { local, start, end } = req.query;

    if (!local || !start || !end) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios: local, start, end' });
    }

    try {
        const resultado = await pegarDadosGeraisPassagens(local.toString(), new Date(start.toString()), new Date(end.toString()))
        res.status(200).json(resultado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar passagens' });
    }
});

passagemRouter.get('/passagens-por-periodo', async (req, res) => {
    const { inicio, fim } = req.query;

    if (!inicio || !fim) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios: local, start, end' });
    }

    try {
        const resultado = await pegarDadosGeraisPassagensPorPeriodo(new Date(inicio.toString()), new Date(fim.toString()))
        res.status(200).json(resultado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar passagens' });
    }
});