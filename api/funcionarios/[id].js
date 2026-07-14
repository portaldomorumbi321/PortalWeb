import {
  ensureDb,
  getInitials,
  hashPassword,
  mapFuncionario,
  normalizePayload,
  resolveDatabaseError,
} from '../_shared.js';

export default async function handler(req, res) {
  const id = Number(req.query.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (req.method === 'PUT') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizePayload(req.body);

    if (!payload.name || !payload.email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    try {
      const result = await pool.query(
        `UPDATE public.funcionarios
            SET nome = $1,
                email = $2,
                cargo = $3,
                departamento = $4,
                status = $5,
                nivel_acesso = $6,
                foto_url = $7,
                iniciais = $8,
                senha_hash = COALESCE($9, senha_hash),
                atualizado_em = NOW()
          WHERE id = $10
        RETURNING id, nome, email, cargo, departamento, status, nivel_acesso, foto_url, iniciais`,
        [
          payload.name,
          payload.email,
          payload.role,
          payload.department,
          payload.status,
          payload.accessLevel,
          payload.photo,
          getInitials(payload.name),
          payload.password.trim() ? hashPassword(payload.password) : null,
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Funcionário não encontrado.' });
      }

      return res.status(200).json(mapFuncionario(result.rows[0]));
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe funcionário com este e-mail.' });
      }

      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'DELETE') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query('DELETE FROM public.funcionarios WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Funcionário não encontrado.' });
      }

      return res.status(204).send();
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
