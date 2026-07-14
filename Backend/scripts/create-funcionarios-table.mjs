import { readFile } from 'node:fs/promises';
import pg from 'pg';

const { Client } = pg;

async function run() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('A variável DATABASE_URL não foi definida.');
  }

  const sql = await readFile(new URL('../sql/create_funcionarios_table.sql', import.meta.url), 'utf8');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(sql);

  const tableCheck = await client.query(
    "SELECT to_regclass('public.funcionarios') AS tabela, COUNT(*)::int AS total FROM public.funcionarios"
  );

  console.log('Tabela criada/verificada com sucesso:', tableCheck.rows[0]);

  await client.end();
}

run().catch((error) => {
  console.error('Erro ao criar tabela funcionarios:', error.message);
  process.exitCode = 1;
});
