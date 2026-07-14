import {
  ensureDb,
  getInitials,
  hashPassword,
  mapFuncionario,
  normalizePayload,
  resolveDatabaseError,
} from '../_shared.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const pool = ensureDb(res);
    if (!pool) return;

    try {
      const result = await pool.query(
        `SELECT id, nome, email, cargo, departamento, status, nivel_acesso, foto_url, iniciais
         FROM public.funcionarios
         ORDER BY nome ASC`
      );

      return res.status(200).json(result.rows.map(mapFuncionario));
    } catch (error) {
      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  if (req.method === 'POST') {
    const pool = ensureDb(res);
    if (!pool) return;

    const payload = normalizePayload(req.body);

    if (!payload.name || !payload.email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO public.funcionarios
          (nome, email, senha_hash, cargo, departamento, status, nivel_acesso, foto_url, iniciais)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, nome, email, cargo, departamento, status, nivel_acesso, foto_url, iniciais`,
        [
          payload.name,
          payload.email,
          hashPassword(payload.password),
          payload.role,
          payload.department,
          payload.status,
          payload.accessLevel,
          payload.photo,
          getInitials(payload.name),
        ]
      );

      return res.status(201).json(mapFuncionario(result.rows[0]));
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe funcionário com este e-mail.' });
      }

      const dbError = resolveDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
