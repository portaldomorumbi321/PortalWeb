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
  const id = Number(req.query.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (req.method === 'PUT') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeEventoPayload(req.body);

    if (!payload.titulo || !payload.data) {
      return res.status(400).json({ error: 'Título e data são obrigatórios.' });
    }

    try {
      const result = await pool.query(
        `UPDATE public.eventos
            SET titulo = $1,
                descricao = $2,
                data_evento = $3::date,
                hora = $4,
                tipo = $5,
                cliente = $6,
                agente = $7,
                atualizado_em = NOW()
          WHERE id = $8
        RETURNING id, titulo, descricao, data_evento, hora, tipo, cliente, agente`,
        [
          payload.titulo,
          payload.descricao || null,
          payload.data,
          payload.hora || null,
          payload.tipo,
          payload.cliente || null,
          payload.agente || null,
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      return res.status(200).json(mapEvento(result.rows[0]));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'DELETE') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query('DELETE FROM public.eventos WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      return res.status(204).send();
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
