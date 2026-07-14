CREATE TABLE IF NOT EXISTS public.eventos (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  data_evento DATE NOT NULL,
  hora VARCHAR(10),
  tipo VARCHAR(20) NOT NULL DEFAULT 'Reunião' CHECK (tipo IN ('Reunião', 'Viagem', 'Tarefa', 'Lembrete', 'Outro')),
  cliente VARCHAR(150),
  agente VARCHAR(150),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_data_evento ON public.eventos (data_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON public.eventos (tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_cliente ON public.eventos (cliente);
CREATE INDEX IF NOT EXISTS idx_eventos_agente ON public.eventos (agente);
