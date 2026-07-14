export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  status: "Ativo" | "Inativo";
  cpfCnpj: string;
  dataNascimento: string;
  documentoNome: string;
}

export type ClienteForm = Omit<Cliente, "id">;

export const clientesIniciais: Cliente[] = [
  { id: 1, nome: "Ana Paula Souza", email: "ana.souza@email.com", telefone: "(11) 99876-5432", cidade: "São Paulo", estado: "SP", status: "Ativo", cpfCnpj: "123.456.789-00", dataNascimento: "", documentoNome: "" },
  { id: 2, nome: "Carlos Mendes", email: "carlos.mendes@empresa.com", telefone: "(21) 98765-4321", cidade: "Rio de Janeiro", estado: "RJ", status: "Ativo", cpfCnpj: "987.654.321-00", dataNascimento: "", documentoNome: "" },
  { id: 3, nome: "Fernanda Lima", email: "fernanda@loja.com.br", telefone: "(31) 97654-3210", cidade: "Belo Horizonte", estado: "MG", status: "Inativo", cpfCnpj: "456.789.123-00", dataNascimento: "", documentoNome: "" },
  { id: 4, nome: "João Victor Reis", email: "joao.reis@mail.com", telefone: "(41) 96543-2109", cidade: "Curitiba", estado: "PR", status: "Ativo", cpfCnpj: "321.654.987-00", dataNascimento: "", documentoNome: "" },
  { id: 5, nome: "Mariana Costa", email: "mariana.costa@email.com", telefone: "(51) 95432-1098", cidade: "Porto Alegre", estado: "RS", status: "Ativo", cpfCnpj: "654.321.098-00", dataNascimento: "", documentoNome: "" },
  { id: 6, nome: "Ricardo Alves", email: "r.alves@negocio.com", telefone: "(85) 94321-0987", cidade: "Fortaleza", estado: "CE", status: "Inativo", cpfCnpj: "789.012.345-00", dataNascimento: "", documentoNome: "" },
];

const CHAVE_CLIENTES = "clientes";

export function obterClientes(): Cliente[] {
  const armazenados = localStorage.getItem(CHAVE_CLIENTES);
  if (!armazenados) return clientesIniciais;

  try {
    return JSON.parse(armazenados);
  } catch {
    return clientesIniciais;
  }
}

export function salvarClientes(clientes: Cliente[]) {
  localStorage.setItem(CHAVE_CLIENTES, JSON.stringify(clientes));
}
