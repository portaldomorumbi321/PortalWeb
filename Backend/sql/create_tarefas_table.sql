CREATE TABLE IF NOT EXISTS public.tarefas (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  responsavel VARCHAR(150),
  prioridade VARCHAR(10) NOT NULL DEFAULT 'Média' CHECK (prioridade IN ('Alta', 'Média', 'Baixa')),
  status VARCHAR(20) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em andamento', 'Concluída', 'Cancelada')),
  prazo DATE,
  categoria VARCHAR(120),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas (status);
CREATE INDEX IF NOT EXISTS idx_tarefas_prioridade ON public.tarefas (prioridade);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON public.tarefas (responsavel);
CREATE INDEX IF NOT EXISTS idx_tarefas_prazo ON public.tarefas (prazo);
