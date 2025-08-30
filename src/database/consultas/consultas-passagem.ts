export const queryInserirPassagem = `
        INSERT INTO passagens (local, aparelho, dispositivo_id)
        VALUES ($1, $2, $3)
    `
export const queryPegarUltimaPassagem = `SELECT id, ultima_deteccao
    FROM passagens
    WHERE dispositivo_id = $1
    ORDER BY ultima_deteccao DESC
    LIMIT 1`

export const queryAtualizarUltimaPassagem = `UPDATE passagens SET ultima_deteccao = ? WHERE id = $1`

export const queryPegarDadosGeraisPassagens = `
    SELECT COUNT(*) as totalDePassagens, COUNT(DISTINCT dispositivo_id) as totalDePassagensUnicas
    FROM passagens
    WHERE local = $1 AND data BETWEEN $2 AND $3
`