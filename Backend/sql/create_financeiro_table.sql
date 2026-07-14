CREATE TABLE IF NOT EXISTS public.financeiro (
  id BIGSERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  descricao VARCHAR(255) NOT NULL,
  valor NUMERIC(14, 2) NOT NULL CHECK (valor > 0),
  data_lancamento DATE NOT NULL,
  oculto BOOLEAN NOT NULL DEFAULT FALSE,
  orcamento_id BIGINT REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.financeiro
  ADD COLUMN IF NOT EXISTS oculto BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_financeiro_tipo ON public.financeiro (tipo);
CREATE INDEX IF NOT EXISTS idx_financeiro_data ON public.financeiro (data_lancamento DESC);
CREATE INDEX IF NOT EXISTS idx_financeiro_orcamento_id ON public.financeiro (orcamento_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_financeiro_receita_orcamento
  ON public.financeiro (orcamento_id)
  WHERE tipo = 'receita' AND orcamento_id IS NOT NULL;
