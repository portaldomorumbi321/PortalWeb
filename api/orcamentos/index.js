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
  if (req.method === 'GET') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query(
        `SELECT id, numero, cliente, email, agente_viagem, status, data_criacao, data_validade, observacoes,
                itens, voos, hospedagem, roteiro, day_by_day, transporte, restaurante, experiencias, seguro
         FROM public.orcamentos
         ORDER BY data_criacao DESC, id DESC`
      );

      return res.status(200).json(result.rows.map(mapOrcamento));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'POST') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeOrcamentoPayload(req.body);

    if (!payload.numero || !payload.cliente) {
      return res.status(400).json({ error: 'Número e cliente são obrigatórios.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO public.orcamentos
          (numero, cliente, email, agente_viagem, status, data_criacao, data_validade, observacoes,
           itens, voos, hospedagem, roteiro, day_by_day, transporte, restaurante, experiencias, seguro)
         VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, NULLIF($7, '')::date, $8,
                 $9::jsonb, $10::jsonb, $11::jsonb, $12, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb)
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
        ]
      );

      return res.status(201).json(mapOrcamento(result.rows[0]));
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe orçamento com este número.' });
      }
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
