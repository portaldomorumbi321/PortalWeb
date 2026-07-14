import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapOrcamento(row) {
  return {
    id: Number(row.id),
    numero: row.numero,
    cliente: row.cliente,
    email: row.email || '',
    agenteViagem: row.agente_viagem || '',
    status: row.status,
    dataCriacao: row.data_criacao ? new Date(row.data_criacao).toISOString().slice(0, 10) : '',
    dataValidade: row.data_validade ? new Date(row.data_validade).toISOString().slice(0, 10) : '',
    observacoes: row.observacoes || '',
    itens: Array.isArray(row.itens) ? row.itens : [],
    voos: Array.isArray(row.voos) ? row.voos : [],
    hospedagem: Array.isArray(row.hospedagem) ? row.hospedagem : [],
    roteiro: row.roteiro || '',
    dayByDay: Array.isArray(row.day_by_day) ? row.day_by_day : [],
    transporte: Array.isArray(row.transporte) ? row.transporte : [],
    restaurante: Array.isArray(row.restaurante) ? row.restaurante : [],
    experiencias: Array.isArray(row.experiencias) ? row.experiencias : [],
    seguro: Array.isArray(row.seguro) ? row.seguro : [],
  };
}

function normalizeOrcamentoPayload(body = {}) {
  const status = body.status;

  return {
    numero: String(body.numero || '').trim(),
    cliente: String(body.cliente || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    agenteViagem: String(body.agenteViagem || '').trim(),
    status: status === 'Enviado' || status === 'Aprovado' || status === 'Rejeitado' || status === 'Cancelado' ? status : 'Rascunho',
    dataCriacao: String(body.dataCriacao || '').trim(),
    dataValidade: String(body.dataValidade || '').trim(),
    observacoes: String(body.observacoes || '').trim(),
    itens: Array.isArray(body.itens) ? body.itens : [],
    voos: Array.isArray(body.voos) ? body.voos : [],
    hospedagem: Array.isArray(body.hospedagem) ? body.hospedagem : [],
    roteiro: typeof body.roteiro === 'string' ? body.roteiro : '',
    dayByDay: Array.isArray(body.dayByDay) ? body.dayByDay : [],
    transporte: Array.isArray(body.transporte) ? body.transporte : [],
    restaurante: Array.isArray(body.restaurante) ? body.restaurante : [],
    experiencias: Array.isArray(body.experiencias) ? body.experiencias : [],
    seguro: Array.isArray(body.seguro) ? body.seguro : [],
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

    const payload = normalizeOrcamentoPayload(req.body);

    if (!payload.numero || !payload.cliente) {
      return res.status(400).json({ error: 'Número e cliente são obrigatórios.' });
    }

    try {
      const result = await pool.query(
        `UPDATE public.orcamentos
            SET numero = $1,
                cliente = $2,
                email = $3,
                agente_viagem = $4,
                status = $5,
                data_criacao = NULLIF($6, '')::date,
                data_validade = NULLIF($7, '')::date,
                observacoes = $8,
                itens = $9::jsonb,
                voos = $10::jsonb,
                hospedagem = $11::jsonb,
                roteiro = $12,
                day_by_day = $13::jsonb,
                transporte = $14::jsonb,
                restaurante = $15::jsonb,
                experiencias = $16::jsonb,
                seguro = $17::jsonb,
                atualizado_em = NOW()
          WHERE id = $18
        RETURNING id, numero, cliente, email, agente_viagem, status, data_criacao, data_validade, observacoes,
                  itens, voos, hospedagem, roteiro, day_by_day, transporte, restaurante, experiencias, seguro`,
        [
          payload.numero,
          payload.cliente,
          payload.email || null,
          payload.agenteViagem || null,
          payload.status,
          payload.dataCriacao,
          payload.dataValidade,
          payload.observacoes || null,
          JSON.stringify(payload.itens),
          JSON.stringify(payload.voos),
          JSON.stringify(payload.hospedagem),
          payload.roteiro || null,
          JSON.stringify(payload.dayByDay),
          JSON.stringify(payload.transporte),
          JSON.stringify(payload.restaurante),
          JSON.stringify(payload.experiencias),
          JSON.stringify(payload.seguro),
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Orçamento não encontrado.' });
      }

      return res.status(200).json(mapOrcamento(result.rows[0]));
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe orçamento com este número.' });
      }
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'DELETE') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query('DELETE FROM public.orcamentos WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Orçamento não encontrado.' });
      }

      return res.status(204).send();
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
