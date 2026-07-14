import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapLancamento(row) {
  return {
    id: Number(row.id),
    tipo: row.tipo,
    descricao: row.descricao,
    valor: Number(row.valor || 0),
    data: row.data_lancamento ? new Date(row.data_lancamento).toISOString().slice(0, 10) : '',
    oculto: Boolean(row.oculto),
    orcamentoId: row.orcamento_id ? Number(row.orcamento_id) : null,
    orcamentoNumero: row.orcamento_numero || '',
    cliente: row.cliente || '',
  };
}

function normalizeLancamentoPayload(body = {}) {
  const tipo = body.tipo;

  const parsedOrcamentoId = Number(body.orcamentoId);
  const orcamentoId = Number.isInteger(parsedOrcamentoId) && parsedOrcamentoId > 0 ? parsedOrcamentoId : null;

  return {
    tipo: tipo === 'despesa' ? 'despesa' : 'receita',
    descricao: String(body.descricao || '').trim(),
    valor: Math.abs(Number(body.valor || 0)),
    data: String(body.data || '').trim(),
    oculto: body.oculto === true,
    orcamentoId,
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query(
        `SELECT f.id, f.tipo, f.descricao, f.valor, f.data_lancamento, f.oculto, f.orcamento_id, o.numero AS orcamento_numero, o.cliente
         FROM public.financeiro f
         LEFT JOIN public.orcamentos o ON o.id = f.orcamento_id
         ORDER BY f.data_lancamento DESC, f.id DESC`
      );

      return res.status(200).json(result.rows.map(mapLancamento));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'POST') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeLancamentoPayload(req.body);

    if (!payload.descricao) {
      return res.status(400).json({ error: 'Descrição é obrigatória.' });
    }

    if (!payload.valor || !Number.isFinite(payload.valor) || payload.valor <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero.' });
    }

    if (!payload.data) {
      return res.status(400).json({ error: 'Data é obrigatória.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO public.financeiro (tipo, descricao, valor, data_lancamento, oculto, orcamento_id)
         VALUES ($1, $2, $3, NULLIF($4, '')::date, $5, $6)
         RETURNING id, tipo, descricao, valor, data_lancamento, oculto, orcamento_id`,
        [payload.tipo, payload.descricao, payload.valor, payload.data, payload.oculto, payload.orcamentoId]
      );

      const inserted = result.rows[0];
      const enriched = await pool.query(
        `SELECT f.id, f.tipo, f.descricao, f.valor, f.data_lancamento, f.oculto, f.orcamento_id, o.numero AS orcamento_numero, o.cliente
         FROM public.financeiro f
         LEFT JOIN public.orcamentos o ON o.id = f.orcamento_id
         WHERE f.id = $1`,
        [inserted.id]
      );

      return res.status(201).json(mapLancamento(enriched.rows[0]));
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Orçamento selecionado não existe.' });
      }

      if (error.code === '23505') {
        return res.status(409).json({ error: 'A receita deste orçamento já foi lançada.' });
      }

      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
