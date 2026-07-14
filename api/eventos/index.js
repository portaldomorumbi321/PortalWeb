import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapEvento(row) {
  return {
    id: Number(row.id),
    titulo: row.titulo,
    descricao: row.descricao || '',
    data: row.data_evento ? new Date(row.data_evento).toISOString().slice(0, 10) : '',
    hora: row.hora || '',
    tipo: row.tipo,
    cliente: row.cliente || '',
    agente: row.agente || '',
  };
}

function normalizeEventoPayload(body = {}) {
  const tipo = body.tipo;

  return {
    titulo: String(body.titulo || '').trim(),
    descricao: String(body.descricao || '').trim(),
    data: String(body.data || '').trim(),
    hora: String(body.hora || '').trim(),
    tipo: tipo === 'Viagem' || tipo === 'Tarefa' || tipo === 'Lembrete' || tipo === 'Outro' ? tipo : 'Reunião',
    cliente: String(body.cliente || '').trim(),
    agente: String(body.agente || '').trim(),
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query(
        `SELECT id, titulo, descricao, data_evento, hora, tipo, cliente, agente
         FROM public.eventos
         ORDER BY data_evento ASC, hora ASC, id ASC`
      );

      return res.status(200).json(result.rows.map(mapEvento));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'POST') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeEventoPayload(req.body);

    if (!payload.titulo || !payload.data) {
      return res.status(400).json({ error: 'Título e data são obrigatórios.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO public.eventos
          (titulo, descricao, data_evento, hora, tipo, cliente, agente)
         VALUES ($1, $2, $3::date, $4, $5, $6, $7)
         RETURNING id, titulo, descricao, data_evento, hora, tipo, cliente, agente`,
        [
          payload.titulo,
          payload.descricao || null,
          payload.data,
          payload.hora || null,
          payload.tipo,
          payload.cliente || null,
          payload.agente || null,
        ]
      );

      return res.status(201).json(mapEvento(result.rows[0]));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
