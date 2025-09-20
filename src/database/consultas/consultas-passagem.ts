export const queryInserirPassagem = `
        INSERT INTO passagens (local, aparelho, dispositivo_id)
        VALUES ($1, $2, $3)
    `
export const queryPegarUltimaPassagem = `SELECT id, ultima_deteccao
    FROM passagens
    WHERE dispositivo_id = $1
    ORDER BY ultima_deteccao DESC
    LIMIT 1`

export const queryAtualizarUltimaPassagem = `
    UPDATE passagens
    SET ultima_deteccao = NOW()
    WHERE id = $1;
`

export const queryPegarDadosGeraisPassagens = `
    SELECT COUNT(*) as totalDePassagens, COUNT(DISTINCT dispositivo_id) as totalDePassagensUnicas
    FROM passagens
    WHERE local = $1 AND data BETWEEN $2 AND $3
`

export const queryPegarPassagensUltimos5Min = `
    SELECT p.local,
           COUNT(*) AS oportunidades,
           COUNT(DISTINCT p.dispositivo_id) AS unicos
    FROM passagens p
    WHERE p.ultima_deteccao >= NOW() - INTERVAL '5 minutes'
    GROUP BY p.local
`;

export const queryPegarPassagensUnicasPorMinuto = `
    SELECT local, COUNT(*) as oportunidades, COUNT(DISTINCT dispositivo_id) as unicos 
    FROM passagens
    WHERE data BETWEEN $1 AND $2 
      AND data - ultima_deteccao > INTERVAL '1 minute'
    GROUP BY local
`;
