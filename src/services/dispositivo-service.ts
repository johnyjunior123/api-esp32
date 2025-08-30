import { getDispositivoPorId, insercaoDispositivos, queryPegarDispositivosPorUltimaData } from "../database/consultas/consultas-dispositivos.js";
import { db } from "../database/db.js";
import type { Dispositivo } from "../routes/dispositivo-router.js";

export async function pegarDispositivoPorId(mac: string): Promise<Partial<Dispositivo> | null> {
    const { rows } = await db.query<{ id: number }>(getDispositivoPorId, [mac]);
    if (rows[0]) {
        return { id: rows[0].id }
    }
    return null
}

export async function inserirDispositivo(mac: string): Promise<{ id: number } | null> {
    const { rows } = await db.query<{ id: number }>(insercaoDispositivos, [mac, new Date()])
    if (rows[0]) {
        return { ...rows[0] }
    }
    return null
}

export async function pegarDispositivos24Horas(data: Date): Promise<{ mac_address: string, detected_at: Date }[] | []> {
    const { rows } = await db.query<{ mac_address: string, detected_at: Date }>(queryPegarDispositivosPorUltimaData, [data])
    if (rows) {
        return rows
    }
    return []
}