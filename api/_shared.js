import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

let pool;

function resolveConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL ||
    ''
  );
}

export function getPool() {
  const connectionString = resolveConnectionString();

  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  return pool;
}

export function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function hashPassword(password) {
  if (!password) {
    return null;
  }

  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password, passwordHash) {
  if (!password || !passwordHash) {
    return false;
  }

  return hashPassword(password) === passwordHash;
}

export function mapFuncionario(row) {
  return {
    id: Number(row.id),
    name: row.nome,
    role: row.cargo || '',
    department: row.departamento || '',
    status: row.status,
    initials: row.iniciais || getInitials(row.nome),
    accessLevel: row.nivel_acesso,
    email: row.email,
    photo: row.foto_url || undefined,
  };
}

export function normalizePayload(body = {}) {
  return {
    name: String(body.name || '').trim(),
    role: String(body.role || '').trim(),
    department: String(body.department || '').trim(),
    status: body.status === 'Inativo' ? 'Inativo' : 'Ativo',
    accessLevel: body.accessLevel === 'Administrador' ? 'Administrador' : 'Agente',
    email: String(body.email || '').trim().toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
    photo: typeof body.photo === 'string' ? body.photo : null,
  };
}

export function resolveDatabaseError(error) {
  if (!error) {
    return { status: 500, message: 'Erro de conexão com o banco de dados.' };
  }

  if (error.code === 'ENOTFOUND') {
    return { status: 503, message: 'Não foi possível resolver o host do banco (DNS). Verifique internet/VPN/DNS.' };
  }

  if (error.code === 'ECONNREFUSED') {
    return { status: 503, message: 'Conexão com o banco recusada. Verifique a string de conexão e firewall.' };
  }

  if (error.code === 'ETIMEDOUT') {
    return { status: 503, message: 'Tempo de conexão com o banco esgotado. Verifique rede e disponibilidade do Neon.' };
  }

  return { status: 500, message: 'Erro de conexão com o banco de dados.' };
}

export function ensureDb(res) {
  const activePool = getPool();

  if (!activePool) {
    res.status(500).json({ error: 'String de conexão não configurada. Defina DATABASE_URL (ou POSTGRES_URL/POSTGRES_PRISMA_URL).' });
    return null;
  }

  return activePool;
}
