CREATE TABLE IF NOT EXISTS public.fornecedores (
  id BIGSERIAL PRIMARY KEY,
  razao_social VARCHAR(180) NOT NULL,
  nome_fantasia VARCHAR(180),
  cnpj VARCHAR(32),
  email VARCHAR(255),
  telefone VARCHAR(40),
  cep VARCHAR(16),
  endereco VARCHAR(255),
  complemento VARCHAR(120),
  cidade VARCHAR(120),
  estado VARCHAR(2),
  status VARCHAR(10) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  categoria VARCHAR(120),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fornecedores_cnpj_unico
  ON public.fornecedores (cnpj)
  WHERE cnpj IS NOT NULL AND cnpj <> '';

CREATE INDEX IF NOT EXISTS idx_fornecedores_razao_social ON public.fornecedores (razao_social);
CREATE INDEX IF NOT EXISTS idx_fornecedores_categoria ON public.fornecedores (categoria);
CREATE INDEX IF NOT EXISTS idx_fornecedores_status ON public.fornecedores (status);
