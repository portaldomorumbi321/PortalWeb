export interface FuncionarioCadastro {
  id: number;
  name: string;
  role: string;
  department: string;
  status: "Ativo" | "Inativo";
  initials: string;
  accessLevel: "Administrador" | "Agente";
  email: string;
  password?: string;
  photo?: string;
}

export const funcionariosIniciais: FuncionarioCadastro[] = [];

const CHAVE_FUNCIONARIOS = "funcionarios";

export function obterFuncionarios(): FuncionarioCadastro[] {
  const armazenados = localStorage.getItem(CHAVE_FUNCIONARIOS);
  if (!armazenados) return funcionariosIniciais;

  try {
    return JSON.parse(armazenados);
  } catch {
    return funcionariosIniciais;
  }
}

export function salvarFuncionarios(funcionarios: FuncionarioCadastro[]) {
  localStorage.setItem(CHAVE_FUNCIONARIOS, JSON.stringify(funcionarios));
}
