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
  if (req.method === 'GET') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query(
        `SELECT id, titulo, descricao, responsavel, prioridade, status, prazo, categoria
         FROM public.tarefas
         ORDER BY criado_em DESC, id DESC`
      );

      return res.status(200).json(result.rows.map(mapTarefa));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'POST') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeTarefaPayload(req.body);

    if (!payload.titulo) {
      return res.status(400).json({ error: 'Título é obrigatório.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO public.tarefas
          (titulo, descricao, responsavel, prioridade, status, prazo, categoria)
         VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, $7)
         RETURNING id, titulo, descricao, responsavel, prioridade, status, prazo, categoria`,
        [
          payload.titulo,
          payload.descricao || null,
          payload.responsavel || null,
          payload.prioridade,
          payload.status,
          payload.prazo,
          payload.categoria || null,
        ]
      );

      return res.status(201).json(mapTarefa(result.rows[0]));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
