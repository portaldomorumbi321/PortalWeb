import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapProduto(row) {
  return {
    id: Number(row.id),
    nome: row.nome,
    codigo: row.codigo || '',
    categoria: row.categoria || '',
    preco: Number(row.preco || 0),
    fornecedor: row.fornecedor || '',
    operadora: row.operadora || '',
    unidade: row.unidade || 'un',
    status: row.status,
  };
}

function normalizeProdutoPayload(body = {}) {
  return {
    nome: String(body.nome || '').trim(),
    codigo: String(body.codigo || '').trim().toUpperCase(),
    categoria: String(body.categoria || '').trim(),
    preco: Number(body.preco || 0),
    fornecedor: String(body.fornecedor || '').trim(),
    operadora: String(body.operadora || '').trim(),
    unidade: String(body.unidade || 'un').trim() || 'un',
    status: body.status === 'Inativo' ? 'Inativo' : 'Ativo',
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query(
        `SELECT id, nome, codigo, categoria, preco, fornecedor, operadora, unidade, status
         FROM public.produtos
         ORDER BY nome ASC`
      );

      return res.status(200).json(result.rows.map(mapProduto));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'POST') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeProdutoPayload(req.body);

    if (!payload.nome) {
      return res.status(400).json({ error: 'Nome e obrigatorio.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO public.produtos
          (nome, codigo, categoria, preco, fornecedor, operadora, unidade, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, nome, codigo, categoria, preco, fornecedor, operadora, unidade, status`,
        [
          payload.nome,
          payload.codigo || null,
          payload.categoria || null,
          payload.preco,
          payload.fornecedor || null,
          payload.operadora || null,
          payload.unidade,
          payload.status,
        ]
      );

      return res.status(201).json(mapProduto(result.rows[0]));
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ja existe produto com este codigo.' });
      }

      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido.' });
}
