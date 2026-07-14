import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

loadEnvFile(path.resolve(__dirname, '../../.env'));
loadEnvFile(path.resolve(__dirname, '../../.env.local'));

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

async function run() {
  const connectionString = resolveConnectionString();

  if (!connectionString) {
    throw new Error('Variável de conexão não definida. Use DATABASE_URL (ou POSTGRES_URL/POSTGRES_PRISMA_URL/POSTGRES_URL_NON_POOLING/NEON_DATABASE_URL).');
  }

  const sql = await readFile(new URL('../sql/create_clientes_table.sql', import.meta.url), 'utf8');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(sql);

  const tableCheck = await client.query(
    "SELECT to_regclass('public.clientes') AS tabela, COUNT(*)::int AS total FROM public.clientes"
  );

  console.log('Tabela criada/verificada com sucesso:', tableCheck.rows[0]);

  await client.end();
}

run().catch((error) => {
  console.error('Erro ao criar tabela clientes:', error.message);
  process.exitCode = 1;
});