import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapLead(row) {
  return {
    id: Number(row.id),
    nome: row.nome,
    email: row.email || '',
    whatsapp: row.whatsapp || '',
    status: row.status,
    statusCrm: row.status_crm,
    viagens: Number(row.viagens || 0),
    criadoEm: row.criado_em ? new Date(row.criado_em).toISOString().slice(0, 10) : '',
    atendente: row.atendente || '',
  };
}

function normalizeLeadPayload(body = {}) {
  const status = body.status;
  const statusCrm = body.statusCrm;

  return {
    nome: String(body.nome || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    whatsapp: String(body.whatsapp || '').trim(),
    status: status === 'Em Contato' || status === 'Qualificado' || status === 'Perdido' || status === 'Vendido' ? status : 'Novo',
    statusCrm:
      statusCrm === 'Qualificação' ||
      statusCrm === 'Reunião' ||
      statusCrm === 'Follow-ups' ||
      statusCrm === 'Pagos' ||
      statusCrm === 'Nutrição' ||
      statusCrm === 'Finalizados'
        ? statusCrm
        : 'Novo Lead',
    viagens: Math.max(0, Number(body.viagens || 0)),
    criadoEm: String(body.criadoEm || '').trim(),
    atendente: String(body.atendente || '').trim(),
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query(
        `SELECT id, nome, email, whatsapp, status, status_crm, viagens, criado_em, atendente
         FROM public.leads
         ORDER BY criado_em DESC, id DESC`
      );

      return res.status(200).json(result.rows.map(mapLead));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'POST') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeLeadPayload(req.body);

    if (!payload.nome) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO public.leads
          (nome, email, whatsapp, status, status_crm, viagens, criado_em, atendente)
         VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, '')::date, $8)
         RETURNING id, nome, email, whatsapp, status, status_crm, viagens, criado_em, atendente`,
        [
          payload.nome,
          payload.email || null,
          payload.whatsapp || null,
          payload.status,
          payload.statusCrm,
          payload.viagens,
          payload.criadoEm,
          payload.atendente || null,
        ]
      );

      return res.status(201).json(mapLead(result.rows[0]));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
