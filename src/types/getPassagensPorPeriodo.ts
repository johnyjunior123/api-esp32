export type ResultQueryPassagens = {
    local: string
    oportunidades: number
    unicos: number
}

export type RetornoGetPassagensPorPeriodo = {
    inicio: Date
    fim: Date
    locais: ResultQueryPassagens[]
}