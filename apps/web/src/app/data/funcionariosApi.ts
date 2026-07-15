export interface Funcionario {
  id: number;
  name: string;
  role: string;
  department: string;
  status: 'Ativo' | 'Inativo';
  initials: string;
  accessLevel: 'Administrador' | 'Agente';
  email: string;
  password?: string;
  photo?: string;
}

export interface LoginFuncionarioResponse {
  message: string;
  accessToken: string;
  funcionario: Funcionario;
}

export type FuncionarioPayload = Omit<Funcionario, 'id' | 'initials'>;

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

export function listarFuncionarios() {
  return request<Funcionario[]>('/funcionarios');
}

export function criarFuncionario(payload: FuncionarioPayload) {
  return request<Funcionario>('/funcionarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function atualizarFuncionario(id: number, payload: FuncionarioPayload) {
  return request<Funcionario>(`/funcionarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removerFuncionario(id: number) {
  return request<void>(`/funcionarios/${id}`, {
    method: 'DELETE',
  });
}

export function loginFuncionario(email: string, password: string) {
  return (async () => {
    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/auth/funcionarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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
        throw new Error('A rota da API retornou HTML. Verifique a configuração do backend de autenticação.');
      }

      const apiMessage = Array.isArray(parsedBody?.message)
        ? parsedBody.message.join(', ')
        : parsedBody?.message;

      throw new Error(apiMessage || parsedBody?.error || `Erro ao comunicar com o servidor (${response.status}).`);
    }

    if (isLikelyHtml || !contentType.includes('application/json')) {
      throw new Error('Resposta inválida da API: esperado JSON. Verifique a configuração de deploy do backend.');
    }

    return parsedBody as LoginFuncionarioResponse;
  })();
}
