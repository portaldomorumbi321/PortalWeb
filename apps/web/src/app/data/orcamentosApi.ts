export type StatusOrc = 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado' | 'Cancelado';

export interface DocumentoVenda {
  id: number;
  nome: string;
  tipo: string;
  arquivo: string;
}

export interface ItemOrc {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
  link?: string;
  documentos?: DocumentoVenda[];
}

export interface Orcamento {
  id: number;
  numero: string;
  cliente: string;
  email: string;
  agenteViagem?: string;
  status: StatusOrc;
  dataCriacao: string;
  dataValidade: string;
  observacoes: string;
  itens: ItemOrc[];
  voos?: any[];
  hospedagem?: any[];
  roteiro?: string;
  dayByDay?: any[];
  transporte?: any[];
  restaurante?: any[];
  experiencias?: any[];
  seguro?: any[];
}

export type OrcamentoPayload = Omit<Orcamento, 'id'>;

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error('Não foi possível conectar ao backend. Verifique se o servidor está rodando e se a URL da API está correta.');
  }

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();
  const isLikelyHtml = responseText.trimStart().startsWith('<!DOCTYPE') || responseText.trimStart().startsWith('<html');

  let parsedBody: any = null;
  if (responseText) {
    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    if (isLikelyHtml) {
      throw new Error('A rota da API retornou HTML. No Vercel, configure VITE_API_URL para o backend e exclua /api do rewrite para index.html.');
    }

    throw new Error(parsedBody?.error || `Erro ao comunicar com o servidor (${response.status}).`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (isLikelyHtml || !contentType.includes('application/json')) {
    throw new Error('Resposta inválida da API: esperado JSON. Verifique a configuração de deploy do backend.');
  }

  return parsedBody as T;
}

export function listarOrcamentos() {
  return request<Orcamento[]>('/api/orcamentos');
}

export function criarOrcamento(payload: OrcamentoPayload) {
  return request<Orcamento>('/api/orcamentos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function atualizarOrcamento(id: number, payload: OrcamentoPayload) {
  return request<Orcamento>(`/api/orcamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removerOrcamento(id: number) {
  return request<void>(`/api/orcamentos/${id}`, {
    method: 'DELETE',
  });
}
