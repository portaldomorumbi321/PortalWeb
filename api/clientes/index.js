import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapCliente(row) {
  return {
    id: Number(row.id),
    nome: row.nome,
    email: row.email || '',
    telefone: row.telefone || '',
    cidade: row.cidade || '',
    estado: row.estado || '',
    status: row.status,
    cpfCnpj: row.cpf_cnpj || '',
    dataNascimento: row.data_nascimento ? new Date(row.data_nascimento).toISOString().slice(0, 10) : '',
    documentoNome: row.documento_nome || '',
  };
}

function normalizeClientePayload(body = {}) {
  return {
    nome: String(body.nome || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    telefone: String(body.telefone || '').trim(),
    cidade: String(body.cidade || '').trim(),
    estado: String(body.estado || '').trim().toUpperCase().slice(0, 2),
    status: body.status === 'Inativo' ? 'Inativo' : 'Ativo',
    cpfCnpj: String(body.cpfCnpj || '').trim(),
    dataNascimento: String(body.dataNascimento || '').trim(),
    documentoNome: String(body.documentoNome || '').trim(),
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query(
        `SELECT id, nome, email, telefone, cidade, estado, status, cpf_cnpj, data_nascimento, documento_nome
         FROM public.clientes
         ORDER BY nome ASC`
      );

      return res.status(200).json(result.rows.map(mapCliente));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'POST') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeClientePayload(req.body);

    if (!payload.nome) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO public.clientes
          (nome, email, telefone, cidade, estado, status, cpf_cnpj, data_nascimento, documento_nome)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, '')::date, $9)
         RETURNING id, nome, email, telefone, cidade, estado, status, cpf_cnpj, data_nascimento, documento_nome`,
        [
          payload.nome,
          payload.email || null,
          payload.telefone || null,
          payload.cidade || null,
          payload.estado || null,
          payload.status,
          payload.cpfCnpj || null,
          payload.dataNascimento,
          payload.documentoNome || null,
        ]
      );

      return res.status(201).json(mapCliente(result.rows[0]));
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe cliente com este CPF/CNPJ.' });
      }

      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
