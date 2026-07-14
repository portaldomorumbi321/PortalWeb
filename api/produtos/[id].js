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
  const id = Number(req.query.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID invalido.' });
  }

  if (req.method === 'PUT') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizeProdutoPayload(req.body);

    if (!payload.nome) {
      return res.status(400).json({ error: 'Nome e obrigatorio.' });
    }

    try {
      const result = await pool.query(
        `UPDATE public.produtos
            SET nome = $1,
                codigo = $2,
                categoria = $3,
                preco = $4,
                fornecedor = $5,
                operadora = $6,
                unidade = $7,
                status = $8,
                atualizado_em = NOW()
          WHERE id = $9
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
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Produto nao encontrado.' });
      }

      return res.status(200).json(mapProduto(result.rows[0]));
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ja existe produto com este codigo.' });
      }

      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'DELETE') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query('DELETE FROM public.produtos WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Produto nao encontrado.' });
      }

      return res.status(204).send();
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido.' });
}
