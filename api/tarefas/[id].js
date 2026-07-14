import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapTarefa(row) {
  return {
    id: Number(row.id),
    titulo: row.titulo,
    descricao: row.descricao || '',
    responsavel: row.responsavel || '',
    prioridade: row.prioridade,
    status: row.status,
    prazo: row.prazo ? new Date(row.prazo).toISOString().slice(0, 10) : '',
    categoria: row.categoria || '',
  };
}

function normalizeTarefaPayload(body = {}) {
  const status = body.status;
  const prioridade = body.prioridade;

  return {
    titulo: String(body.titulo || '').trim(),
    descricao: String(body.descricao || '').trim(),
    responsavel: String(body.responsavel || '').trim(),
    prioridade: prioridade === 'Alta' || prioridade === 'Baixa' ? prioridade : 'Média',
    status: status === 'Em andamento' || status === 'Concluída' || status === 'Cancelada' ? status : 'Pendente',
    prazo: String(body.prazo || '').trim(),
    categoria: String(body.categoria || '').trim(),
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

    const payload = normalizeTarefaPayload(req.body);

    if (!payload.titulo) {
      return res.status(400).json({ error: 'Título é obrigatório.' });
    }

    try {
      const result = await pool.query(
        `UPDATE public.tarefas
            SET titulo = $1,
                descricao = $2,
                responsavel = $3,
                prioridade = $4,
                status = $5,
                prazo = NULLIF($6, '')::date,
                categoria = $7,
                atualizado_em = NOW()
          WHERE id = $8
        RETURNING id, titulo, descricao, responsavel, prioridade, status, prazo, categoria`,
        [
          payload.titulo,
          payload.descricao || null,
          payload.responsavel || null,
          payload.prioridade,
          payload.status,
          payload.prazo,
          payload.categoria || null,
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }

      return res.status(200).json(mapTarefa(result.rows[0]));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'DELETE') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query('DELETE FROM public.tarefas WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
      }

      return res.status(204).send();
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
