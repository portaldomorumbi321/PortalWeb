const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(__dirname, '../.env'));
loadEnvFile(path.resolve(__dirname, '../.env.local'));

const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || FRONTEND_ORIGIN)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const WHATSAPP_AUTH_PATH =
  process.env.WHATSAPP_AUTH_PATH ||
  path.resolve(process.env.LOCALAPPDATA || process.env.TEMP || process.cwd(), 'PortalWeb', 'wwebjs_auth');

const app = express();
app.use(express.json({ limit: '10mb' }));

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

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowedOrigin =
    typeof origin === 'string' &&
    (FRONTEND_ORIGINS.includes(origin) || LOCALHOST_ORIGIN_REGEX.test(origin));

  if (isAllowedOrigin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return isAllowedOrigin ? res.sendStatus(204) : res.sendStatus(403);
  }

  next();
});

const connectionString = resolveConnectionString();

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null;

function ensureDb(req, res, next) {
  if (!pool) {
    return res.status(500).json({
      error: 'String de conexão não configurada. Defina DATABASE_URL (ou POSTGRES_URL/POSTGRES_PRISMA_URL).',
    });
  }

  next();
}

function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function hashPassword(password) {
  if (!password) {
    return null;
  }

  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, passwordHash) {
  if (!password || !passwordHash) {
    return false;
  }

  return hashPassword(password) === passwordHash;
}

function mapFuncionario(row) {
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

function mapCliente(row) {
  return {
    id: Number(row.id),
    nome: row.nome,
    email: row.email || '',
    telefone: row.telefone || '',
    cep: row.cep || '',
    endereco: row.endereco || '',
    numero: row.numero || '',
    complemento: row.complemento || '',
    cidade: row.cidade || '',
    estado: row.estado || '',
    status: row.status,
    cpfCnpj: row.cpf_cnpj || '',
    dataNascimento: row.data_nascimento ? new Date(row.data_nascimento).toISOString().slice(0, 10) : '',
    documentoNome: row.documento_nome || '',
  };
}

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

function mapTarefa(row) {
  return {
    id: Number(row.id),
    titulo: row.titulo,
    descricao: row.descricao || '',
    responsavel: row.responsavel || '',
    prioridade: row.prioridade,
    status: row.status,
    prazo: row.prazo ? new Date(row.prazo).toISOString().slice(0, 10) : '',
    categoria: row.categoria || '',
  };
}

function normalizePayload(body) {
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

function normalizeClientePayload(body) {
  return {
    nome: String(body?.nome || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    telefone: String(body?.telefone || '').trim(),
    cep: String(body?.cep || '').trim(),
    endereco: String(body?.endereco || '').trim(),
    numero: String(body?.numero || '').trim(),
    complemento: String(body?.complemento || '').trim(),
    cidade: String(body?.cidade || '').trim(),
    estado: String(body?.estado || '').trim().toUpperCase().slice(0, 2),
    status: body?.status === 'Inativo' ? 'Inativo' : 'Ativo',
    cpfCnpj: String(body?.cpfCnpj || '').trim(),
    dataNascimento: String(body?.dataNascimento || '').trim(),
    documentoNome: String(body?.documentoNome || '').trim(),
  };
}

function normalizeProdutoPayload(body) {
  return {
    nome: String(body?.nome || '').trim(),
    codigo: String(body?.codigo || '').trim().toUpperCase(),
    categoria: String(body?.categoria || '').trim(),
    preco: Number(body?.preco || 0),
    fornecedor: String(body?.fornecedor || '').trim(),
    operadora: String(body?.operadora || '').trim(),
    unidade: String(body?.unidade || 'un').trim() || 'un',
    status: body?.status === 'Inativo' ? 'Inativo' : 'Ativo',
  };
}

function normalizeFornecedorPayload(body) {
  return {
    razaoSocial: String(body?.razaoSocial || '').trim(),
    nomeFantasia: String(body?.nomeFantasia || '').trim(),
    cnpj: String(body?.cnpj || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    telefone: String(body?.telefone || '').trim(),
    cep: String(body?.cep || '').trim(),
    endereco: String(body?.endereco || '').trim(),
    complemento: String(body?.complemento || '').trim(),
    cidade: String(body?.cidade || '').trim(),
    estado: String(body?.estado || '').trim().toUpperCase().slice(0, 2),
    status: body?.status === 'Inativo' ? 'Inativo' : 'Ativo',
    categoria: String(body?.categoria || '').trim(),
  };
}

function normalizeTarefaPayload(body) {
  const status = body?.status;
  const prioridade = body?.prioridade;

  return {
    titulo: String(body?.titulo || '').trim(),
    descricao: String(body?.descricao || '').trim(),
    responsavel: String(body?.responsavel || '').trim(),
    prioridade: prioridade === 'Alta' || prioridade === 'Baixa' ? prioridade : 'Média',
    status: status === 'Em andamento' || status === 'Concluída' || status === 'Cancelada' ? status : 'Pendente',
    prazo: String(body?.prazo || '').trim(),
    categoria: String(body?.categoria || '').trim(),
  };
}

function resolveDatabaseError(error) {
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

app.get('/', (req, res) => {
  res.send('Servidor backend rodando.');
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/funcionarios/login', ensureDb, async (req, res) => {
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

    res.json({
      message: 'Login realizado com sucesso.',
      funcionario: mapFuncionario(funcionario),
    });
  } catch (error) {
    console.error('Erro ao autenticar funcionário:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.get('/api/funcionarios', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, email, cargo, departamento, status, nivel_acesso, foto_url, iniciais
       FROM public.funcionarios
       ORDER BY nome ASC`
    );

    res.json(result.rows.map(mapFuncionario));
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/funcionarios', ensureDb, async (req, res) => {
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

    res.status(201).json(mapFuncionario(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe funcionário com este e-mail.' });
    }

    console.error('Erro ao criar funcionário:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/funcionarios/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizePayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

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

    res.json(mapFuncionario(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe funcionário com este e-mail.' });
    }

    console.error('Erro ao atualizar funcionário:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.delete('/api/funcionarios/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query('DELETE FROM public.funcionarios WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.get('/api/clientes', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, email, telefone, cep, endereco, numero, complemento, cidade, estado, status, cpf_cnpj, data_nascimento, documento_nome
       FROM public.clientes
       ORDER BY nome ASC`
    );

    res.json(result.rows.map(mapCliente));
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/clientes', ensureDb, async (req, res) => {
  const payload = normalizeClientePayload(req.body);

  if (!payload.nome) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.clientes
        (nome, email, telefone, cep, endereco, numero, complemento, cidade, estado, status, cpf_cnpj, data_nascimento, documento_nome)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULLIF($12, '')::date, $13)
       RETURNING id, nome, email, telefone, cep, endereco, numero, complemento, cidade, estado, status, cpf_cnpj, data_nascimento, documento_nome`,
      [
        payload.nome,
        payload.email || null,
        payload.telefone || null,
        payload.cep || null,
        payload.endereco || null,
        payload.numero || null,
        payload.complemento || null,
        payload.cidade || null,
        payload.estado || null,
        payload.status,
        payload.cpfCnpj || null,
        payload.dataNascimento,
        payload.documentoNome || null,
      ]
    );

    res.status(201).json(mapCliente(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe cliente com este CPF/CNPJ.' });
    }

    console.error('Erro ao criar cliente:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/clientes/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeClientePayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (!payload.nome) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }

  try {
    const result = await pool.query(
      `UPDATE public.clientes
          SET nome = $1,
              email = $2,
              telefone = $3,
              cep = $4,
              endereco = $5,
              numero = $6,
              complemento = $7,
              cidade = $8,
              estado = $9,
              status = $10,
              cpf_cnpj = $11,
              data_nascimento = NULLIF($12, '')::date,
              documento_nome = $13,
              atualizado_em = NOW()
        WHERE id = $14
      RETURNING id, nome, email, telefone, cep, endereco, numero, complemento, cidade, estado, status, cpf_cnpj, data_nascimento, documento_nome`,
      [
        payload.nome,
        payload.email || null,
        payload.telefone || null,
        payload.cep || null,
        payload.endereco || null,
        payload.numero || null,
        payload.complemento || null,
        payload.cidade || null,
        payload.estado || null,
        payload.status,
        payload.cpfCnpj || null,
        payload.dataNascimento,
        payload.documentoNome || null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.json(mapCliente(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe cliente com este CPF/CNPJ.' });
    }

    console.error('Erro ao atualizar cliente:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.delete('/api/clientes/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query('DELETE FROM public.clientes WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.get('/api/produtos', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, codigo, categoria, preco, fornecedor, operadora, unidade, status
       FROM public.produtos
       ORDER BY nome ASC`
    );

    res.json(result.rows.map(mapProduto));
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/produtos', ensureDb, async (req, res) => {
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

    res.status(201).json(mapProduto(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ja existe produto com este codigo.' });
    }

    console.error('Erro ao criar produto:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/produtos/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeProdutoPayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID invalido.' });
  }

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

    res.json(mapProduto(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ja existe produto com este codigo.' });
    }

    console.error('Erro ao atualizar produto:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.delete('/api/produtos/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID invalido.' });
  }

  try {
    const result = await pool.query('DELETE FROM public.produtos WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produto nao encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.get('/api/fornecedores', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, razao_social, nome_fantasia, cnpj, email, telefone, cep, endereco, complemento, cidade, estado, status, categoria
       FROM public.fornecedores
       ORDER BY razao_social ASC`
    );

    res.json(result.rows.map(mapFornecedor));
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/fornecedores', ensureDb, async (req, res) => {
  const payload = normalizeFornecedorPayload(req.body);

  if (!payload.razaoSocial) {
    return res.status(400).json({ error: 'Razão social é obrigatória.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.fornecedores
        (razao_social, nome_fantasia, cnpj, email, telefone, cep, endereco, complemento, cidade, estado, status, categoria)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      ]
    );

    res.status(201).json(mapFornecedor(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe fornecedor com este CNPJ.' });
    }

    console.error('Erro ao criar fornecedor:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/fornecedores/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeFornecedorPayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

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

    res.json(mapFornecedor(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe fornecedor com este CNPJ.' });
    }

    console.error('Erro ao atualizar fornecedor:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.get('/api/tarefas', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, titulo, descricao, responsavel, prioridade, status, prazo, categoria
       FROM public.tarefas
       ORDER BY criado_em DESC, id DESC`
    );

    res.json(result.rows.map(mapTarefa));
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/tarefas', ensureDb, async (req, res) => {
  const payload = normalizeTarefaPayload(req.body);

  if (!payload.titulo) {
    return res.status(400).json({ error: 'Título é obrigatório.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.tarefas
        (titulo, descricao, responsavel, prioridade, status, prazo, categoria)
       VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, $7)
       RETURNING id, titulo, descricao, responsavel, prioridade, status, prazo, categoria`,
      [
        payload.titulo,
        payload.descricao || null,
        payload.responsavel || null,
        payload.prioridade,
        payload.status,
        payload.prazo,
        payload.categoria || null,
      ]
    );

    res.status(201).json(mapTarefa(result.rows[0]));
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/tarefas/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeTarefaPayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (!payload.titulo) {
    return res.status(400).json({ error: 'Título é obrigatório.' });
  }

  try {
    const result = await pool.query(
      `UPDATE public.tarefas
          SET titulo = $1,
              descricao = $2,
              responsavel = $3,
              prioridade = $4,
              status = $5,
              prazo = NULLIF($6, '')::date,
              categoria = $7,
              atualizado_em = NOW()
        WHERE id = $8
      RETURNING id, titulo, descricao, responsavel, prioridade, status, prazo, categoria`,
      [
        payload.titulo,
        payload.descricao || null,
        payload.responsavel || null,
        payload.prioridade,
        payload.status,
        payload.prazo,
        payload.categoria || null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    res.json(mapTarefa(result.rows[0]));
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.delete('/api/tarefas/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query('DELETE FROM public.tarefas WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log('Frontend conectado via Socket.IO');
  socket.emit('message', 'Conectado ao servidor. Aguardando inicialização do WhatsApp...');
  socket.emit('message', 'Iniciando cliente do WhatsApp no servidor...');

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: WHATSAPP_AUTH_PATH }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('loading_screen', (percent, message) => {
    console.log('CARREGANDO WHATSAPP:', percent, message);
    socket.emit('message', `Carregando: ${message}`);
  });

  client.on('qr', (qr) => {
    console.log('QR Code recebido, enviando para o frontend...');
    qrcode.generate(qr, { small: true });
    socket.emit('qr', qr);
  });

  client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
    socket.emit('ready', 'Cliente conectado com sucesso!');
  });

  client.on('auth_failure', (msg) => {
    console.error('FALHA NA AUTENTICAÇÃO', msg);
    socket.emit('message', `Falha na autenticação: ${msg}`);
  });

  console.log('Inicializando cliente do WhatsApp...');
  client.initialize().catch((error) => {
    console.error('Erro ao inicializar cliente do WhatsApp:', error.message);
    socket.emit('message', `Não foi possível inicializar o WhatsApp: ${error.message}`);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
