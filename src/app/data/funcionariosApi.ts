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

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Erro ao comunicar com o servidor.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listarFuncionarios() {
  return request<Funcionario[]>('/api/funcionarios');
}

export function criarFuncionario(payload: FuncionarioPayload) {
  return request<Funcionario>('/api/funcionarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function atualizarFuncionario(id: number, payload: FuncionarioPayload) {
  return request<Funcionario>(`/api/funcionarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removerFuncionario(id: number) {
  return request<void>(`/api/funcionarios/${id}`, {
    method: 'DELETE',
  });
}

export function loginFuncionario(email: string, password: string) {
  return request<LoginFuncionarioResponse>('/api/auth/funcionarios/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
