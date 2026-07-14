import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapLancamento(row) {
  return {
    id: Number(row.id),
    tipo: row.tipo,
    descricao: row.descricao,
    valor: Number(row.valor || 0),
    data: row.data_lancamento ? new Date(row.data_lancamento).toISOString().slice(0, 10) : '',
    oculto: Boolean(row.oculto),
    orcamentoPago: Boolean(row.orcamento_pago),
    formaPagamento: row.forma_pagamento || '',
    parcelas: row.parcelas ? Number(row.parcelas) : null,
    orcamentoId: row.orcamento_id ? Number(row.orcamento_id) : null,
    orcamentoNumero: row.orcamento_numero || '',
    cliente: row.cliente || '',
  };
}

function normalizeLancamentoPayload(body = {}) {
  const tipo = body.tipo;

  const parsedOrcamentoId = Number(body.orcamentoId);
  const orcamentoId = Number.isInteger(parsedOrcamentoId) && parsedOrcamentoId > 0 ? parsedOrcamentoId : null;

  const normalizedTipo = tipo === 'despesa' ? 'despesa' : 'receita';
  const orcamentoPago = body.orcamentoPago === true;
  const formaPagamento = orcamentoPago ? String(body.formaPagamento || '').trim() : '';
  const parcelas =
    orcamentoPago && Number.isInteger(Number(body.parcelas)) && Number(body.parcelas) > 0 ? Number(body.parcelas) : null;

  return {
    tipo: normalizedTipo,
    descricao: String(body.descricao || '').trim(),
    valor: Math.abs(Number(body.valor || 0)),
    data: String(body.data || '').trim(),
    oculto: body.oculto === true,
    orcamentoPago,
    formaPagamento,
    parcelas,
    orcamentoId,
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

    if (payload.orcamentoPago && (!payload.formaPagamento || !payload.parcelas)) {
      return res.status(400).json({ error: 'Informe forma de pagamento e parcelas para receita com orçamento quitado.' });
    }

    try {
      const result = await pool.query(
        `UPDATE public.financeiro
            SET tipo = $1,
                descricao = $2,
                valor = $3,
                data_lancamento = NULLIF($4, '')::date,
                oculto = $5,
                orcamento_pago = $6,
                forma_pagamento = NULLIF($7, ''),
                parcelas = $8,
                orcamento_id = $9,
                atualizado_em = NOW()
          WHERE id = $10
        RETURNING id`,
        [
          payload.tipo,
          payload.descricao,
          payload.valor,
          payload.data,
          payload.oculto,
          payload.orcamentoPago,
          payload.formaPagamento,
          payload.parcelas,
          payload.orcamentoId,
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Lançamento não encontrado.' });
      }

      const updated = await pool.query(
        `SELECT f.id, f.tipo, f.descricao, f.valor, f.data_lancamento, f.oculto, f.orcamento_pago, f.forma_pagamento, f.parcelas, f.orcamento_id, o.numero AS orcamento_numero, o.cliente
         FROM public.financeiro f
         LEFT JOIN public.orcamentos o ON o.id = f.orcamento_id
         WHERE f.id = $1`,
        [id]
      );

      return res.status(200).json(mapLancamento(updated.rows[0]));
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

  if (req.method === 'DELETE') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query('DELETE FROM public.financeiro WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Lançamento não encontrado.' });
      }

      return res.status(204).send();
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
