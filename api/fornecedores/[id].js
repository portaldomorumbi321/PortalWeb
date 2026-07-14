import { ensureDb, resolveDatabaseError } from '../_shared.js';

function mapFornecedor(row) {
  return {
    id: Number(row.id),
    razaoSocial: row.razao_social,
    nomeFantasia: row.nome_fantasia || '',
    cnpj: row.cnpj || '',
    email: row.email || '',
    telefone: row.telefone || '',
    cep: row.cep || '',
    endereco: row.endereco || '',
    complemento: row.complemento || '',
    cidade: row.cidade || '',
    estado: row.estado || '',
    status: row.status,
    categoria: row.categoria || '',
  };
}

function normalizeFornecedorPayload(body = {}) {
  return {
    razaoSocial: String(body.razaoSocial || '').trim(),
    nomeFantasia: String(body.nomeFantasia || '').trim(),
    cnpj: String(body.cnpj || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    telefone: String(body.telefone || '').trim(),
    cep: String(body.cep || '').trim(),
    endereco: String(body.endereco || '').trim(),
    complemento: String(body.complemento || '').trim(),
    cidade: String(body.cidade || '').trim(),
    estado: String(body.estado || '').trim().toUpperCase().slice(0, 2),
    status: body.status === 'Inativo' ? 'Inativo' : 'Ativo',
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

    const payload = normalizeFornecedorPayload(req.body);

    if (!payload.razaoSocial) {
      return res.status(400).json({ error: 'Razão social é obrigatória.' });
    }

    try {
      const result = await pool.query(
        `UPDATE public.fornecedores
            SET razao_social = $1,
                nome_fantasia = $2,
                cnpj = $3,
                email = $4,
                telefone = $5,
                cep = $6,
                endereco = $7,
                complemento = $8,
                cidade = $9,
                estado = $10,
                status = $11,
                categoria = $12,
                atualizado_em = NOW()
          WHERE id = $13
        RETURNING id, razao_social, nome_fantasia, cnpj, email, telefone, cep, endereco, complemento, cidade, estado, status, categoria`,
        [
          payload.razaoSocial,
          payload.nomeFantasia || null,
          payload.cnpj || null,
          payload.email || null,
          payload.telefone || null,
          payload.cep || null,
          payload.endereco || null,
          payload.complemento || null,
          payload.cidade || null,
          payload.estado || null,
          payload.status,
          payload.categoria || null,
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }

      return res.status(200).json(mapFornecedor(result.rows[0]));
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe fornecedor com este CNPJ.' });
      }

      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
