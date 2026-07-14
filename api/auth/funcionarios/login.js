import {
  ensureDb,
  mapFuncionario,
  resolveDatabaseError,
  verifyPassword,
} from '../../_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const pool = ensureDb(res);
  if (!pool) return;

  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, nome, email, cargo, departamento, status, nivel_acesso, foto_url, iniciais, senha_hash
       FROM public.funcionarios
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const funcionario = result.rows[0];

    if (funcionario.status !== 'Ativo') {
      return res.status(403).json({ error: 'Funcionário inativo.' });
    }

    if (!verifyPassword(password, funcionario.senha_hash)) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      funcionario: mapFuncionario(funcionario),
    });
  } catch (error) {
    const dbError = resolveDatabaseError(error);
    return res.status(dbError.status).json({ error: dbError.message });
  }
}
