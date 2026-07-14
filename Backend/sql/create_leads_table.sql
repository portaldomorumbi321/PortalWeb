CREATE TABLE IF NOT EXISTS public.leads (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  whatsapp VARCHAR(40),
  status VARCHAR(20) NOT NULL DEFAULT 'Novo'
    CHECK (status IN ('Novo', 'Em Contato', 'Qualificado', 'Perdido', 'Vendido')),
  status_crm VARCHAR(20) NOT NULL DEFAULT 'Novo Lead'
    CHECK (status_crm IN ('Novo Lead', 'Qualificação', 'Reunião', 'Follow-ups', 'Pagos', 'Nutrição', 'Finalizados')),
  viagens INTEGER NOT NULL DEFAULT 0 CHECK (viagens >= 0),
  criado_em DATE NOT NULL DEFAULT CURRENT_DATE,
  atendente VARCHAR(150),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_nome ON public.leads (nome);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_status_crm ON public.leads (status_crm);
CREATE INDEX IF NOT EXISTS idx_leads_atendente ON public.leads (atendente);
CREATE INDEX IF NOT EXISTS idx_leads_criado_em ON public.leads (criado_em);
