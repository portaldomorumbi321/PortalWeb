CREATE TABLE IF NOT EXISTS public.produtos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(180) NOT NULL,
  codigo VARCHAR(40),
  categoria VARCHAR(120),
  preco NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (preco >= 0),
  estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  fornecedor VARCHAR(180),
  operadora VARCHAR(60),
  unidade VARCHAR(20) NOT NULL DEFAULT 'un',
  status VARCHAR(10) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_codigo_unico
  ON public.produtos (codigo)
  WHERE codigo IS NOT NULL AND codigo <> '';

CREATE INDEX IF NOT EXISTS idx_produtos_nome ON public.produtos (nome);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos (categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_status ON public.produtos (status);

ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS fornecedor VARCHAR(180);
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS operadora VARCHAR(60);
