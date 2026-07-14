CREATE TABLE IF NOT EXISTS public.clientes (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(40),
  cidade VARCHAR(120),
  estado VARCHAR(2),
  status VARCHAR(10) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  cpf_cnpj VARCHAR(32),
  data_nascimento DATE,
  documento_nome VARCHAR(255),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj_unico
  ON public.clientes (cpf_cnpj)
  WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj <> '';

CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes (nome);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON public.clientes (status);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes (email);