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
const WHATSAPP_CACHE_PATH =
  process.env.WHATSAPP_CACHE_PATH ||
  path.resolve(process.env.LOCALAPPDATA || process.env.TEMP || process.cwd(), 'PortalWeb', 'wwebjs_cache');

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

function mapEvento(row) {
  return {
    id: Number(row.id),
    titulo: row.titulo,
    descricao: row.descricao || '',
    data: row.data_evento ? new Date(row.data_evento).toISOString().slice(0, 10) : '',
    hora: row.hora || '',
    tipo: row.tipo,
    cliente: row.cliente || '',
    agente: row.agente || '',
  };
}

function mapOrcamento(row) {
  return {
    id: Number(row.id),
    numero: row.numero,
    cliente: row.cliente,
    email: row.email || '',
    agenteViagem: row.agente_viagem || '',
    status: row.status,
    dataCriacao: row.data_criacao ? new Date(row.data_criacao).toISOString().slice(0, 10) : '',
    dataValidade: row.data_validade ? new Date(row.data_validade).toISOString().slice(0, 10) : '',
    observacoes: row.observacoes || '',
    itens: Array.isArray(row.itens) ? row.itens : [],
    voos: Array.isArray(row.voos) ? row.voos : [],
    hospedagem: Array.isArray(row.hospedagem) ? row.hospedagem : [],
    roteiro: row.roteiro || '',
    dayByDay: Array.isArray(row.day_by_day) ? row.day_by_day : [],
    transporte: Array.isArray(row.transporte) ? row.transporte : [],
    restaurante: Array.isArray(row.restaurante) ? row.restaurante : [],
    experiencias: Array.isArray(row.experiencias) ? row.experiencias : [],
    seguro: Array.isArray(row.seguro) ? row.seguro : [],
  };
}

function mapLancamentoFinanceiro(row) {
  return {
    id: Number(row.id),
    tipo: row.tipo,
    descricao: row.descricao,
    valor: Number(row.valor || 0),
    data: row.data_lancamento ? new Date(row.data_lancamento).toISOString().slice(0, 10) : '',
    oculto: Boolean(row.oculto),
    orcamentoPago: Boolean(row.orcamento_pago),
    formaPagamento: row.forma_pagamento || '',
    parcelas: row.parcelas ? Number(row.parcelas) : null,
    orcamentoId: row.orcamento_id ? Number(row.orcamento_id) : null,
    orcamentoNumero: row.orcamento_numero || '',
    cliente: row.cliente || '',
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

function normalizeLeadPayload(body) {
  const status = body?.status;
  const statusCrm = body?.statusCrm;

  return {
    nome: String(body?.nome || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    whatsapp: String(body?.whatsapp || '').trim(),
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
    viagens: Math.max(0, Number(body?.viagens || 0)),
    criadoEm: String(body?.criadoEm || '').trim(),
    atendente: String(body?.atendente || '').trim(),
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

function normalizeEventoPayload(body) {
  const tipo = body?.tipo;

  return {
    titulo: String(body?.titulo || '').trim(),
    descricao: String(body?.descricao || '').trim(),
    data: String(body?.data || '').trim(),
    hora: String(body?.hora || '').trim(),
    tipo: tipo === 'Viagem' || tipo === 'Tarefa' || tipo === 'Lembrete' || tipo === 'Outro' ? tipo : 'Reunião',
    cliente: String(body?.cliente || '').trim(),
    agente: String(body?.agente || '').trim(),
  };
}

function normalizeOrcamentoPayload(body) {
  const status = body?.status;

  return {
    numero: String(body?.numero || '').trim(),
    cliente: String(body?.cliente || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    agenteViagem: String(body?.agenteViagem || '').trim(),
    status: status === 'Enviado' || status === 'Aprovado' || status === 'Rejeitado' || status === 'Cancelado' ? status : 'Rascunho',
    dataCriacao: String(body?.dataCriacao || '').trim(),
    dataValidade: String(body?.dataValidade || '').trim(),
    observacoes: String(body?.observacoes || '').trim(),
    itens: Array.isArray(body?.itens) ? body.itens : [],
    voos: Array.isArray(body?.voos) ? body.voos : [],
    hospedagem: Array.isArray(body?.hospedagem) ? body.hospedagem : [],
    roteiro: typeof body?.roteiro === 'string' ? body.roteiro : '',
    dayByDay: Array.isArray(body?.dayByDay) ? body.dayByDay : [],
    transporte: Array.isArray(body?.transporte) ? body.transporte : [],
    restaurante: Array.isArray(body?.restaurante) ? body.restaurante : [],
    experiencias: Array.isArray(body?.experiencias) ? body.experiencias : [],
    seguro: Array.isArray(body?.seguro) ? body.seguro : [],
  };
}

function normalizeLancamentoFinanceiroPayload(body) {
  const tipo = body?.tipo;
  const parsedOrcamentoId = Number(body?.orcamentoId);
  const orcamentoId = Number.isInteger(parsedOrcamentoId) && parsedOrcamentoId > 0 ? parsedOrcamentoId : null;
  const normalizedTipo = tipo === 'despesa' ? 'despesa' : 'receita';
  const orcamentoPago = body?.orcamentoPago === true;
  const formaPagamento = orcamentoPago ? String(body?.formaPagamento || '').trim() : '';
  const parcelas =
    orcamentoPago && Number.isInteger(Number(body?.parcelas)) && Number(body?.parcelas) > 0 ? Number(body?.parcelas) : null;

  return {
    tipo: normalizedTipo,
    descricao: String(body?.descricao || '').trim(),
    valor: Math.abs(Number(body?.valor || 0)),
    data: String(body?.data || '').trim(),
    oculto: body?.oculto === true,
    orcamentoPago,
    formaPagamento,
    parcelas,
    orcamentoId,
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

const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const DEFAULT_OPENAI_SYSTEM_PROMPT =
  process.env.OPENAI_SYSTEM_PROMPT ||
  'Você é o Agente IA do PortalWeb. Responda em português do Brasil, com objetividade e foco em produtividade comercial.';

function normalizeAiMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  const allowedRoles = new Set(['user', 'assistant']);

  return rawMessages
    .map((item) => ({
      role: typeof item?.role === 'string' ? item.role : '',
      content: typeof item?.content === 'string' ? item.content.trim() : '',
    }))
    .filter((item) => item.content && allowedRoles.has(item.role))
    .slice(-20);
}

app.get('/', (req, res) => {
  res.send('Servidor backend rodando.');
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/ai/chat', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY não configurada no backend.',
    });
  }

  const normalizedMessages = normalizeAiMessages(req.body?.messages);

  if (!normalizedMessages.length) {
    return res.status(400).json({ error: 'Envie pelo menos uma mensagem válida.' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const openAiResponse = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'system', content: DEFAULT_OPENAI_SYSTEM_PROMPT }, ...normalizedMessages],
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    const rawText = await openAiResponse.text();
    let parsedBody = null;

    if (rawText) {
      try {
        parsedBody = JSON.parse(rawText);
      } catch (_) {
        parsedBody = null;
      }
    }

    if (!openAiResponse.ok) {
      const apiError = parsedBody?.error?.message || 'Falha ao comunicar com a OpenAI.';
      return res.status(502).json({ error: apiError });
    }

    const reply = parsedBody?.choices?.[0]?.message?.content;

    if (typeof reply !== 'string' || !reply.trim()) {
      return res.status(502).json({ error: 'Resposta da OpenAI veio vazia.' });
    }

    res.json({ reply: reply.trim(), model: OPENAI_MODEL });
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({ error: 'Tempo limite atingido ao consultar a OpenAI.' });
    }

    console.error('Erro ao consultar OpenAI:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a mensagem da IA.' });
  } finally {
    clearTimeout(timeoutId);
  }
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

app.get('/api/leads', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, email, whatsapp, status, status_crm, viagens, criado_em, atendente
       FROM public.leads
       ORDER BY criado_em DESC, id DESC`
    );

    res.json(result.rows.map(mapLead));
  } catch (error) {
    console.error('Erro ao listar leads:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/leads', ensureDb, async (req, res) => {
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

    res.status(201).json(mapLead(result.rows[0]));
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/leads/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeLeadPayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (!payload.nome) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }

  try {
    const result = await pool.query(
      `UPDATE public.leads
          SET nome = $1,
              email = $2,
              whatsapp = $3,
              status = $4,
              status_crm = $5,
              viagens = $6,
              criado_em = NULLIF($7, '')::date,
              atendente = $8,
              atualizado_em = NOW()
        WHERE id = $9
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
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    res.json(mapLead(result.rows[0]));
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.delete('/api/leads/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query('DELETE FROM public.leads WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir lead:', error);
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

app.get('/api/eventos', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, titulo, descricao, data_evento, hora, tipo, cliente, agente
       FROM public.eventos
       ORDER BY data_evento ASC, hora ASC, id ASC`
    );

    res.json(result.rows.map(mapEvento));
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/eventos', ensureDb, async (req, res) => {
  const payload = normalizeEventoPayload(req.body);

  if (!payload.titulo || !payload.data) {
    return res.status(400).json({ error: 'Título e data são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.eventos
        (titulo, descricao, data_evento, hora, tipo, cliente, agente)
       VALUES ($1, $2, $3::date, $4, $5, $6, $7)
       RETURNING id, titulo, descricao, data_evento, hora, tipo, cliente, agente`,
      [
        payload.titulo,
        payload.descricao || null,
        payload.data,
        payload.hora || null,
        payload.tipo,
        payload.cliente || null,
        payload.agente || null,
      ]
    );

    res.status(201).json(mapEvento(result.rows[0]));
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/eventos/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeEventoPayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (!payload.titulo || !payload.data) {
    return res.status(400).json({ error: 'Título e data são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE public.eventos
          SET titulo = $1,
              descricao = $2,
              data_evento = $3::date,
              hora = $4,
              tipo = $5,
              cliente = $6,
              agente = $7,
              atualizado_em = NOW()
        WHERE id = $8
      RETURNING id, titulo, descricao, data_evento, hora, tipo, cliente, agente`,
      [
        payload.titulo,
        payload.descricao || null,
        payload.data,
        payload.hora || null,
        payload.tipo,
        payload.cliente || null,
        payload.agente || null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    res.json(mapEvento(result.rows[0]));
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.delete('/api/eventos/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query('DELETE FROM public.eventos WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.get('/api/orcamentos', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, numero, cliente, email, agente_viagem, status, data_criacao, data_validade, observacoes,
              itens, voos, hospedagem, roteiro, day_by_day, transporte, restaurante, experiencias, seguro
       FROM public.orcamentos
       ORDER BY data_criacao DESC, id DESC`
    );

    res.json(result.rows.map(mapOrcamento));
  } catch (error) {
    console.error('Erro ao listar orçamentos:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/orcamentos', ensureDb, async (req, res) => {
  const payload = normalizeOrcamentoPayload(req.body);

  if (!payload.numero || !payload.cliente) {
    return res.status(400).json({ error: 'Número e cliente são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.orcamentos
        (numero, cliente, email, agente_viagem, status, data_criacao, data_validade, observacoes,
         itens, voos, hospedagem, roteiro, day_by_day, transporte, restaurante, experiencias, seguro)
       VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, NULLIF($7, '')::date, $8,
               $9::jsonb, $10::jsonb, $11::jsonb, $12, $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb)
       RETURNING id, numero, cliente, email, agente_viagem, status, data_criacao, data_validade, observacoes,
                 itens, voos, hospedagem, roteiro, day_by_day, transporte, restaurante, experiencias, seguro`,
      [
        payload.numero,
        payload.cliente,
        payload.email || null,
        payload.agenteViagem || null,
        payload.status,
        payload.dataCriacao,
        payload.dataValidade,
        payload.observacoes || null,
        JSON.stringify(payload.itens),
        JSON.stringify(payload.voos),
        JSON.stringify(payload.hospedagem),
        payload.roteiro || null,
        JSON.stringify(payload.dayByDay),
        JSON.stringify(payload.transporte),
        JSON.stringify(payload.restaurante),
        JSON.stringify(payload.experiencias),
        JSON.stringify(payload.seguro),
      ]
    );

    res.status(201).json(mapOrcamento(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe orçamento com este número.' });
    }

    console.error('Erro ao criar orçamento:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/orcamentos/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeOrcamentoPayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (!payload.numero || !payload.cliente) {
    return res.status(400).json({ error: 'Número e cliente são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE public.orcamentos
          SET numero = $1,
              cliente = $2,
              email = $3,
              agente_viagem = $4,
              status = $5,
              data_criacao = NULLIF($6, '')::date,
              data_validade = NULLIF($7, '')::date,
              observacoes = $8,
              itens = $9::jsonb,
              voos = $10::jsonb,
              hospedagem = $11::jsonb,
              roteiro = $12,
              day_by_day = $13::jsonb,
              transporte = $14::jsonb,
              restaurante = $15::jsonb,
              experiencias = $16::jsonb,
              seguro = $17::jsonb,
              atualizado_em = NOW()
        WHERE id = $18
      RETURNING id, numero, cliente, email, agente_viagem, status, data_criacao, data_validade, observacoes,
                itens, voos, hospedagem, roteiro, day_by_day, transporte, restaurante, experiencias, seguro`,
      [
        payload.numero,
        payload.cliente,
        payload.email || null,
        payload.agenteViagem || null,
        payload.status,
        payload.dataCriacao,
        payload.dataValidade,
        payload.observacoes || null,
        JSON.stringify(payload.itens),
        JSON.stringify(payload.voos),
        JSON.stringify(payload.hospedagem),
        payload.roteiro || null,
        JSON.stringify(payload.dayByDay),
        JSON.stringify(payload.transporte),
        JSON.stringify(payload.restaurante),
        JSON.stringify(payload.experiencias),
        JSON.stringify(payload.seguro),
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }

    res.json(mapOrcamento(result.rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe orçamento com este número.' });
    }

    console.error('Erro ao atualizar orçamento:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.delete('/api/orcamentos/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query('DELETE FROM public.orcamentos WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.get('/api/financeiro', ensureDb, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.tipo, f.descricao, f.valor, f.data_lancamento, f.oculto, f.orcamento_pago, f.forma_pagamento, f.parcelas, f.orcamento_id, o.numero AS orcamento_numero, o.cliente
       FROM public.financeiro f
       LEFT JOIN public.orcamentos o ON o.id = f.orcamento_id
       ORDER BY f.data_lancamento DESC, f.id DESC`
    );

    res.json(result.rows.map(mapLancamentoFinanceiro));
  } catch (error) {
    console.error('Erro ao listar lançamentos financeiros:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.post('/api/financeiro', ensureDb, async (req, res) => {
  const payload = normalizeLancamentoFinanceiroPayload(req.body);

  if (!payload.descricao) {
    return res.status(400).json({ error: 'Descrição é obrigatória.' });
  }

  if (!payload.valor || !Number.isFinite(payload.valor) || payload.valor <= 0) {
    return res.status(400).json({ error: 'Valor deve ser maior que zero.' });
  }

  if (!payload.data) {
    return res.status(400).json({ error: 'Data é obrigatória.' });
  }

  if (payload.orcamentoPago && (!payload.formaPagamento || !payload.parcelas)) {
    return res.status(400).json({ error: 'Informe forma de pagamento e parcelas para receita com orçamento quitado.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.financeiro (tipo, descricao, valor, data_lancamento, oculto, orcamento_pago, forma_pagamento, parcelas, orcamento_id)
       VALUES ($1, $2, $3, NULLIF($4, '')::date, $5, $6, NULLIF($7, ''), $8, $9)
       RETURNING id`,
      [
        payload.tipo,
        payload.descricao,
        payload.valor,
        payload.data,
        payload.oculto,
        payload.orcamentoPago,
        payload.formaPagamento,
        payload.parcelas,
        payload.orcamentoId,
      ]
    );

    const enriched = await pool.query(
      `SELECT f.id, f.tipo, f.descricao, f.valor, f.data_lancamento, f.oculto, f.orcamento_pago, f.forma_pagamento, f.parcelas, f.orcamento_id, o.numero AS orcamento_numero, o.cliente
       FROM public.financeiro f
       LEFT JOIN public.orcamentos o ON o.id = f.orcamento_id
       WHERE f.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(mapLancamentoFinanceiro(enriched.rows[0]));
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Orçamento selecionado não existe.' });
    }

    if (error.code === '23505') {
      return res.status(409).json({ error: 'A receita deste orçamento já foi lançada.' });
    }

    console.error('Erro ao criar lançamento financeiro:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.put('/api/financeiro/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeLancamentoFinanceiroPayload(req.body);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (!payload.descricao) {
    return res.status(400).json({ error: 'Descrição é obrigatória.' });
  }

  if (!payload.valor || !Number.isFinite(payload.valor) || payload.valor <= 0) {
    return res.status(400).json({ error: 'Valor deve ser maior que zero.' });
  }

  if (!payload.data) {
    return res.status(400).json({ error: 'Data é obrigatória.' });
  }

  if (payload.orcamentoPago && (!payload.formaPagamento || !payload.parcelas)) {
    return res.status(400).json({ error: 'Informe forma de pagamento e parcelas para receita com orçamento quitado.' });
  }

  try {
    const result = await pool.query(
      `UPDATE public.financeiro
          SET tipo = $1,
              descricao = $2,
              valor = $3,
              data_lancamento = NULLIF($4, '')::date,
              oculto = $5,
              orcamento_pago = $6,
              forma_pagamento = NULLIF($7, ''),
              parcelas = $8,
              orcamento_id = $9,
              atualizado_em = NOW()
        WHERE id = $10
      RETURNING id`,
      [
        payload.tipo,
        payload.descricao,
        payload.valor,
        payload.data,
        payload.oculto,
        payload.orcamentoPago,
        payload.formaPagamento,
        payload.parcelas,
        payload.orcamentoId,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lançamento não encontrado.' });
    }

    const updated = await pool.query(
      `SELECT f.id, f.tipo, f.descricao, f.valor, f.data_lancamento, f.oculto, f.orcamento_pago, f.forma_pagamento, f.parcelas, f.orcamento_id, o.numero AS orcamento_numero, o.cliente
       FROM public.financeiro f
       LEFT JOIN public.orcamentos o ON o.id = f.orcamento_id
       WHERE f.id = $1`,
      [id]
    );

    res.json(mapLancamentoFinanceiro(updated.rows[0]));
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Orçamento selecionado não existe.' });
    }

    if (error.code === '23505') {
      return res.status(409).json({ error: 'A receita deste orçamento já foi lançada.' });
    }

    console.error('Erro ao atualizar lançamento financeiro:', error);
    const dbError = resolveDatabaseError(error);
    res.status(dbError.status).json({ error: dbError.message });
  }
});

app.delete('/api/financeiro/:id', ensureDb, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query('DELETE FROM public.financeiro WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lançamento não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir lançamento financeiro:', error);
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

let whatsappClient = null;
let whatsappClientInitializing = null;
let whatsappReady = false;
let latestQr = null;
let whatsappBooting = false;
let whatsappChatsApiUnavailable = false;

function formatMessageTimestamp(unixSeconds) {
  const value = Number(unixSeconds);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

function getMessageBody(message) {
  if (typeof message.body === 'string' && message.body.trim()) {
    return message.body;
  }

  if (typeof message.caption === 'string' && message.caption.trim()) {
    return message.caption;
  }

  if (message.type) {
    return `[${message.type}]`;
  }

  return '';
}

function serializeChat(chat) {
  const id = chat?.id?._serialized || '';
  const name =
    chat?.name ||
    chat?.formattedTitle ||
    chat?.id?.user ||
    (chat?.isGroup ? 'Grupo sem nome' : 'Contato sem nome');
  const lastBody = chat?.lastMessage ? getMessageBody(chat.lastMessage) : '';
  const timestamp = formatMessageTimestamp(chat?.timestamp || chat?.lastMessage?.timestamp);

  return {
    id,
    name,
    isGroup: Boolean(chat?.isGroup),
    unreadCount: Number(chat?.unreadCount || 0),
    lastMessage: lastBody,
    timestamp,
    historyAvailable: true,
  };
}

function getErrorMessage(error) {
  if (!error) {
    return 'Erro desconhecido.';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || 'Erro sem mensagem.';
  }

  if (typeof error.message === 'string') {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch (_) {
    return 'Falha ao serializar erro.';
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function serializeMessage(message) {
  return {
    id: message?.id?._serialized || `${Date.now()}-${Math.random()}`,
    chatId: message?.fromMe ? message?.to : message?.from,
    from: message?.from || '',
    fromMe: Boolean(message?.fromMe),
    body: getMessageBody(message),
    timestamp: formatMessageTimestamp(message?.timestamp) || Math.floor(Date.now() / 1000),
  };
}

function serializeContactAsChat(contact) {
  const id = contact?.id?._serialized || '';
  if (!id) {
    return null;
  }

  const name =
    contact?.pushname ||
    contact?.name ||
    contact?.shortName ||
    contact?.number ||
    id.replace(/@.*/, '');

  return {
    id,
    name,
    isGroup: false,
    unreadCount: 0,
    lastMessage: '',
    timestamp: null,
    historyAvailable: false,
  };
}

async function listContactsFallback() {
  let contacts = null;
  let contactsError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      contacts = await whatsappClient.getContacts();
      break;
    } catch (error) {
      contactsError = error;
      const message = getErrorMessage(error);
      console.warn(`Tentativa ${attempt + 1} de listar contatos falhou:`, message);
      await delay(300 * (attempt + 1));
    }
  }

  if (!Array.isArray(contacts)) {
    throw new Error(`Falha ao listar contatos: ${getErrorMessage(contactsError)}`);
  }

  return contacts
    .map((contact) => serializeContactAsChat(contact))
    .filter(Boolean)
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
}

function bindWhatsAppEvents(client) {
  client.on('loading_screen', (percent, message) => {
    console.log('CARREGANDO WHATSAPP:', percent, message);
    io.emit('message', `Carregando: ${message}`);
  });

  client.on('qr', (qr) => {
    console.log('QR Code recebido, enviando para o frontend...');
    qrcode.generate(qr, { small: true });
    latestQr = qr;
    whatsappReady = false;
    io.emit('qr', qr);
    io.emit('status', { connected: false, waitingQr: true });
  });

  client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
    whatsappReady = true;
    whatsappBooting = false;
    latestQr = null;
    io.emit('ready', 'Cliente conectado com sucesso!');
    io.emit('status', { connected: true, waitingQr: false });
  });

  client.on('auth_failure', (msg) => {
    console.error('FALHA NA AUTENTICAÇÃO', msg);
    whatsappReady = false;
    whatsappBooting = false;
    io.emit('message', `Falha na autenticação: ${msg}`);
    io.emit('status', { connected: false, waitingQr: false });
  });

  client.on('disconnected', (reason) => {
    console.warn('Cliente WhatsApp desconectado:', reason);
    whatsappReady = false;
    whatsappBooting = false;
    latestQr = null;
    io.emit('message', `WhatsApp desconectado: ${reason}`);
    io.emit('status', { connected: false, waitingQr: false });
  });

  client.on('message', (msg) => {
    io.emit('incoming_message', serializeMessage(msg));

    msg
      .getChat()
      .then((chat) => {
        io.emit('wa:chat_upsert', serializeChat(chat));
      })
      .catch(() => {
        // Ignora falhas pontuais na atualização da lista de chats.
      });
  });

  client.on('message_create', (msg) => {
    if (!msg.fromMe) {
      return;
    }

    io.emit('incoming_message', serializeMessage(msg));

    msg
      .getChat()
      .then((chat) => {
        io.emit('wa:chat_upsert', serializeChat(chat));
      })
      .catch(() => {
        // Ignora falhas pontuais na atualização da lista de chats.
      });
  });
}

async function sendChatsToSocket(socket) {
  if (!whatsappReady || !whatsappClient) {
    socket.emit('wa:error', { code: 'NOT_READY', message: 'WhatsApp ainda não está pronto.' });
    return;
  }

  if (whatsappChatsApiUnavailable) {
    try {
      const fallbackChats = await listContactsFallback();
      socket.emit('wa:chats', fallbackChats);
      socket.emit('message', 'Modo compatibilidade ativo: exibindo contatos.');
      return;
    } catch (error) {
      socket.emit('wa:chats', []);
      socket.emit('message', `Falha ao listar contatos: ${getErrorMessage(error)}`);
      return;
    }
  }

  let chats = null;
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      chats = await whatsappClient.getChats();
      break;
    } catch (error) {
      lastError = error;
      const message = getErrorMessage(error);
      console.warn(`Tentativa ${attempt + 1} de listar chats falhou:`, message);
      await delay(350 * (attempt + 1));
    }
  }

  if (!Array.isArray(chats)) {
    // Fallback para ambientes em que getChats pode falhar mesmo após ready.
    try {
      const chatsErrorMessage = getErrorMessage(lastError);
      if (chatsErrorMessage === 'r') {
        whatsappChatsApiUnavailable = true;
      }

      const serializedFromContacts = await listContactsFallback();

      socket.emit('wa:chats', serializedFromContacts);
      socket.emit('message', 'Chats indisponíveis temporariamente; exibindo contatos como fallback.');
      return;
    } catch (error) {
      const chatsErrorMessage = getErrorMessage(lastError);
      const fallbackError = getErrorMessage(error);
      console.warn(`Falha no fallback de chats (${chatsErrorMessage}) (${fallbackError}).`);
      socket.emit('wa:chats', []);
      socket.emit('message', 'WhatsApp sincronizando. Tente atualizar chats novamente em alguns segundos.');
      return;
    }
  }

  const serialized = [];

  for (const chat of chats) {
    try {
      const mapped = serializeChat(chat);
      if (mapped.id) {
        serialized.push(mapped);
      }
    } catch (error) {
      console.warn('Chat ignorado por erro de serialização:', getErrorMessage(error));
    }
  }

  serialized.sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));

  socket.emit('wa:chats', serialized);
}

async function sendMessagesToSocket(socket, chatId, limit = 120) {
  if (!whatsappReady || !whatsappClient) {
    socket.emit('wa:error', { code: 'NOT_READY', message: 'WhatsApp ainda não está pronto.' });
    return;
  }

  if (!chatId) {
    socket.emit('wa:error', { code: 'INVALID_CHAT', message: 'Chat inválido.' });
    return;
  }

  const parsedLimit = Math.min(Math.max(Number(limit) || 120, 20), 300);
  let serialized = [];

  try {
    const chat = await whatsappClient.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: parsedLimit });
    serialized = messages.map((message) => serializeMessage(message));
  } catch (error) {
    const detail = getErrorMessage(error);
    if (detail === 'r') {
      socket.emit('message', 'Histórico indisponível no modo atual.');
      socket.emit('wa:messages', { chatId, messages: [] });
      return;
    }

    throw error;
  }

  socket.emit('wa:messages', {
    chatId,
    messages: serialized,
  });
}

function registerWhatsAppSocketEvents(socket) {
  socket.on('wa:getChats', async () => {
    try {
      await sendChatsToSocket(socket);
    } catch (error) {
      const detail = getErrorMessage(error);
      console.error('Erro ao listar chats do WhatsApp:', detail);
      socket.emit('wa:error', {
        code: 'LIST_CHATS_FAILED',
        message: 'Não foi possível listar os chats.',
        detail,
      });
    }
  });

  socket.on('wa:getMessages', async (payload = {}) => {
    try {
      await sendMessagesToSocket(socket, payload.chatId, payload.limit);
    } catch (error) {
      const detail = getErrorMessage(error);
      console.error('Erro ao carregar mensagens do WhatsApp:', detail);
      socket.emit('wa:error', {
        code: 'LIST_MESSAGES_FAILED',
        message: 'Não foi possível carregar as mensagens.',
        detail,
      });
    }
  });
}

function ensureWhatsAppClient() {
  if (!whatsappClient) {
    whatsappClient = new Client({
      authStrategy: new LocalAuth({ dataPath: WHATSAPP_AUTH_PATH }),
      webVersionCache: {
        type: 'local',
        path: WHATSAPP_CACHE_PATH,
      },
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
    bindWhatsAppEvents(whatsappClient);
  }

  if (whatsappReady) {
    return Promise.resolve();
  }

  if (whatsappBooting) {
    return Promise.resolve();
  }

  if (whatsappClientInitializing) {
    return whatsappClientInitializing;
  }

  console.log('Inicializando cliente do WhatsApp...');
  whatsappBooting = true;
  whatsappClientInitializing = whatsappClient
    .initialize()
    .catch((error) => {
      const message = getErrorMessage(error);
      if (message.includes('browser is already running for')) {
        console.warn('Sessão do WhatsApp já está em uso por inicialização ativa. Aguardando ficar pronta.');
        io.emit('message', 'Sessão do WhatsApp já está inicializando. Aguarde alguns segundos.');
        return;
      }

      whatsappBooting = false;
      console.error('Erro ao inicializar cliente do WhatsApp:', message);
      io.emit('message', `Não foi possível inicializar o WhatsApp: ${message}`);
      io.emit('status', { connected: false, waitingQr: false });
    })
    .finally(() => {
      whatsappClientInitializing = null;
    });

  return whatsappClientInitializing;
}

io.on('connection', (socket) => {
  console.log('Frontend conectado via Socket.IO');
  socket.emit('message', 'Conectado ao servidor. Aguardando inicialização do WhatsApp...');
  socket.emit('message', 'Iniciando cliente do WhatsApp no servidor...');
  socket.emit('status', { connected: whatsappReady, waitingQr: !whatsappReady });

  if (latestQr) {
    socket.emit('qr', latestQr);
  }

  if (whatsappReady) {
    socket.emit('ready', 'Cliente conectado com sucesso!');
  }

  registerWhatsAppSocketEvents(socket);

  ensureWhatsAppClient().catch((error) => {
    console.error('Falha inesperada ao garantir cliente do WhatsApp:', error);
    socket.emit('message', 'Falha inesperada ao iniciar cliente do WhatsApp.');
  });
});

server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
