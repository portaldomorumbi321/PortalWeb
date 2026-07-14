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

export const funcionariosIniciais: FuncionarioCadastro[] = [
  { id: 1, name: "Carol", role: "Gerente de Vendas", department: "Comercial", status: "Ativo", initials: "MS", accessLevel: "Administrador", email: "carol@321go.com" },
  { id: 2, name: "Ricardo", role: "Analista Financeiro", department: "Financeiro", status: "Ativo", initials: "JS", accessLevel: "Agente", email: "ricardo@321go.com" },
  { id: 3, name: "Miguel", role: "Designer", department: "Marketing", status: "Ativo", initials: "AC", accessLevel: "Agente", email: "miguel@321go.com" },
  { id: 4, name: "João Pedro", role: "Desenvolvedor", department: "TI", status: "Inativo", initials: "PO", accessLevel: "Administrador", email: "jp@321go.com" },
];

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
