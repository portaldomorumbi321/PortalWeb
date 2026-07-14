import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Phone, Mail, MapPin, X, Check } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

interface Cliente {
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

type ClienteForm = Omit<Cliente, "id">;

const clientesIniciais: Cliente[] = [
  { id: 1, nome: "Ana Paula Souza", email: "ana.souza@email.com", telefone: "(11) 99876-5432", cidade: "São Paulo", estado: "SP", status: "Ativo", cpfCnpj: "123.456.789-00", dataNascimento: "", documentoNome: "" },
  { id: 2, nome: "Carlos Mendes", email: "carlos.mendes@empresa.com", telefone: "(21) 98765-4321", cidade: "Rio de Janeiro", estado: "RJ", status: "Ativo", cpfCnpj: "987.654.321-00", dataNascimento: "", documentoNome: "" },
  { id: 3, nome: "Fernanda Lima", email: "fernanda@loja.com.br", telefone: "(31) 97654-3210", cidade: "Belo Horizonte", estado: "MG", status: "Inativo", cpfCnpj: "456.789.123-00", dataNascimento: "", documentoNome: "" },
  { id: 4, nome: "João Victor Reis", email: "joao.reis@mail.com", telefone: "(41) 96543-2109", cidade: "Curitiba", estado: "PR", status: "Ativo", cpfCnpj: "321.654.987-00", dataNascimento: "", documentoNome: "" },
  { id: 5, nome: "Mariana Costa", email: "mariana.costa@email.com", telefone: "(51) 95432-1098", cidade: "Porto Alegre", estado: "RS", status: "Ativo", cpfCnpj: "654.321.098-00", dataNascimento: "", documentoNome: "" },
  { id: 6, nome: "Ricardo Alves", email: "r.alves@negocio.com", telefone: "(85) 94321-0987", cidade: "Fortaleza", estado: "CE", status: "Inativo", cpfCnpj: "789.012.345-00", dataNascimento: "", documentoNome: "" },
];

const clienteVazio: ClienteForm = {
  nome: "",
  email: "",
  telefone: "",
  cidade: "",
  estado: "",
  status: "Ativo",
  cpfCnpj: "",
  dataNascimento: "",
  documentoNome: "",
};

export default function CadastroClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState<ClienteForm>(clienteVazio);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  const clientesFiltrados = clientes.filter((c) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      c.nome.toLowerCase().includes(termo) ||
      c.email.toLowerCase().includes(termo) ||
      c.telefone.includes(termo) ||
      c.cidade.toLowerCase().includes(termo) ||
      c.cpfCnpj.includes(termo);
    const matchStatus = filtroStatus === "Todos" || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  function abrirNovo() {
    setEditando(null);
    setForm(clienteVazio);
    setModalAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setEditando(cliente);
    setForm({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cidade: cliente.cidade,
      estado: cliente.estado,
      status: cliente.status,
      cpfCnpj: cliente.cpfCnpj,
      dataNascimento: cliente.dataNascimento,
      documentoNome: cliente.documentoNome,
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  function salvar() {
    if (!form.nome.trim()) return;
    if (editando) {
      setClientes((prev) => prev.map((c) => (c.id === editando.id ? { ...editando, ...form } : c)));
    } else {
      const novoId = clientes.length > 0 ? Math.max(...clientes.map((c) => c.id)) + 1 : 1;
      setClientes((prev) => [...prev, { id: novoId, ...form }]);
    }
    fecharModal();
  }

  function excluir(id: number) {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    setConfirmarExclusao(null);
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cadastro de Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">{clientes.length} clientes cadastrados</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Barra de pesquisa + filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome, e-mail, CPF/CNPJ, cidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-9"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {(["Todos", "Ativo", "Inativo"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltroStatus(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                  filtroStatus === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {busca && (
          <p className="text-xs text-gray-500 mt-2">
            {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? "s" : ""} encontrado{clientesFiltrados.length !== 1 ? "s" : ""}
          </p>
        )}
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nome</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">CPF / CNPJ</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Contato</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden xl:table-cell">Localização</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Nenhum cliente encontrado</p>
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente, idx) => (
                  <tr
                    key={cliente.id}
                    className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{cliente.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{cliente.cpfCnpj}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-3 h-3" />
                          {cliente.email}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-3 h-3" />
                          {cliente.telefone}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {cliente.cidade} — {cliente.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          cliente.status === "Ativo"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-red-100 text-red-600 hover:bg-red-100"
                        }
                      >
                        {cliente.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {confirmarExclusao === cliente.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs text-gray-500 mr-1">Excluir?</span>
                          <button
                            onClick={() => excluir(cliente.id)}
                            className="p-1.5 rounded text-green-600 hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmarExclusao(null)}
                            className="p-1.5 rounded text-gray-400 hover:bg-gray-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => abrirEdicao(cliente)}
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmarExclusao(cliente.id)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de cadastro/edição — sem Portal/Radix Dialog */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={fecharModal}
          />
          {/* Painel */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10">
            {/* Título */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editando ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button onClick={fecharModal} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Nome do cliente"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpfCnpj">CPF / CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    value={form.cpfCnpj}
                    onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
                    placeholder="000.000.000-00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="cliente@email.com"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={form.dataNascimento}
                    onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="documento">Documento (RG/CPF)</Label>
                  <Input
                    id="documento"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];
                      setForm({ ...form, documentoNome: arquivo ? arquivo.name : "" });
                    }}
                    className="mt-1"
                  />
                  {form.documentoNome && (
                    <p className="text-xs text-gray-500 mt-1">Arquivo selecionado: {form.documentoNome}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    placeholder="Cidade"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex gap-2 mt-1">
                  {(["Ativo", "Inativo"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                        form.status === s
                          ? s === "Ativo"
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-red-500 text-white border-red-500"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button
                onClick={salvar}
                disabled={!form.nome.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editando ? "Salvar alterações" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
