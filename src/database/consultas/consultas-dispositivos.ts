export const insercaoDispositivos = `
    INSERT INTO dispositivos (mac, ultima_deteccao) VALUES ($1, $2) 
    ON CONFLICT(mac) 
    DO UPDATE SET ultima_deteccao = excluded.ultima_deteccao, total_repeticoes = total_repeticoes + 1
    RETURNING id
    `

export const getDispositivoPorId = `SELECT id FROM dispositivos WHERE mac = $1 LIMIT 1`

export const queryPegarDispositivosPorUltimaData = `
      SELECT mac, ultima_deteccao
      FROM dispositivos
      WHERE ultima_deteccao >= $1
      ORDER BY ultima_deteccao DESC
`
