CREATE TABLE IF NOT EXISTS public.funcionarios (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash TEXT,
  cargo VARCHAR(120),
  departamento VARCHAR(120),
  status VARCHAR(10) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  nivel_acesso VARCHAR(20) NOT NULL DEFAULT 'Agente' CHECK (nivel_acesso IN ('Administrador', 'Agente')),
  foto_url TEXT,
  iniciais VARCHAR(8),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funcionarios_nome ON public.funcionarios (nome);
CREATE INDEX IF NOT EXISTS idx_funcionarios_departamento ON public.funcionarios (departamento);
CREATE INDEX IF NOT EXISTS idx_funcionarios_status ON public.funcionarios (status);
