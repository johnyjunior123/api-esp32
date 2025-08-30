import { queryAtualizarUltimaPassagem, queryInserirPassagem, queryPegarDadosGeraisPassagens, queryPegarDadosGeraisPassagensPorPeriodo, queryPegarUltimaPassagem } from "../database/consultas/consultas-passagem.js";
import { db } from "../database/db.js";

export async function pegarUltimaPassagem(dispositivoId: number): Promise<{ id: number; ultima_deteccao: Date } | null> {
    const { rows } = await db.query<{ id: number; ultima_deteccao: Date }>(queryPegarUltimaPassagem, [dispositivoId])
    if (rows[0]) {
        return { id: rows[0].id, ultima_deteccao: rows[0].ultima_deteccao }
    }
    return null
}

export async function atualizarUltimaPassagem(ultima_deteccao: Date, dispositivo_id: number) {
    await db.query(queryAtualizarUltimaPassagem, [ultima_deteccao, dispositivo_id])
}

export async function inserirPassagem(local: string, aparelho: string, dispositivoId: number): Promise<void> {
    await db.query<{ id: number; ultima_deteccao: Date }>(queryInserirPassagem, [local, aparelho, dispositivoId])
}

export async function tempoDeSaidaMaiorQue15Minutos(passagem: {
    id: number;
    ultima_deteccao: Date;
}): Promise<boolean> {
    const ultimaData = new Date(passagem.ultima_deteccao);
    console.log(ultimaData)
    const diffMinutes = (Date.now() - ultimaData.getTime()) / 1000 / 60;
    console.log(new Date())
    console.log(diffMinutes)
    return diffMinutes >= 15 ? true : false
}

type DadosGerais = {
    local: string,
    inicio: Date,
    fim: Date,
    totalDePassagens: number,
    totalDePassagensUnicas: number
}

export async function pegarDadosGeraisPassagens(local: string, inicio: Date, fim: Date): Promise<DadosGerais | {}> {
    const { rows } = await db.query<{ totalDePassagens: number, totalDePassagensUnicas: number }>(queryPegarDadosGeraisPassagens, [local, inicio, fim])
    if (rows[0]) {
        return { local, inicio, fim, totalDePassagens: rows[0].totalDePassagens, totalDePassagensUnicas: rows[0].totalDePassagensUnicas }
    }
    return {}
}


export async function pegarDadosGeraisPassagensPorPeriodo(inicio: Date, fim: Date): Promise<DadosGerais | {}> {
    const { rows } = await db.query<{ local: string, oportunidades: number, unicos: number }>(queryPegarDadosGeraisPassagensPorPeriodo, [inicio, fim])
    if (rows[0]) {
        return { inicio, fim, locais: rows }
    }
    return {}
}