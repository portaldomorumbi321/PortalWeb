import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Phone, Mail, Globe, X, Check, Building } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

interface Fornecedor {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  status: "Ativo" | "Inativo";
  categoria: string;
}

const dados: Fornecedor[] = [
  { id: 1, razaoSocial: "Distribuidora Alpha Ltda", nomeFantasia: "Alpha Dist.", cnpj: "12.345.678/0001-90", email: "contato@alpha.com.br", telefone: "(11) 3456-7890", cidade: "São Paulo", estado: "SP", status: "Ativo", categoria: "Distribuição" },
  { id: 2, razaoSocial: "Tecnologia Beta S.A.", nomeFantasia: "Beta Tech", cnpj: "98.765.432/0001-10", email: "vendas@betatech.com", telefone: "(21) 2345-6789", cidade: "Rio de Janeiro", estado: "RJ", status: "Ativo", categoria: "Tecnologia" },
  { id: 3, razaoSocial: "Logística Gama ME", nomeFantasia: "Gama Log", cnpj: "45.678.901/0001-23", email: "gama@gamalog.com", telefone: "(31) 3456-1234", cidade: "Belo Horizonte", estado: "MG", status: "Inativo", categoria: "Logística" },
  { id: 4, razaoSocial: "Indústria Delta Eireli", nomeFantasia: "Delta Ind.", cnpj: "67.890.123/0001-45", email: "delta@deltaindustria.com", telefone: "(41) 4567-8901", cidade: "Curitiba", estado: "PR", status: "Ativo", categoria: "Indústria" },
];

const vazio = { razaoSocial: "", nomeFantasia: "", cnpj: "", email: "", telefone: "", cidade: "", estado: "", status: "Ativo" as const, categoria: "" };

export default function CadastroFornecedores() {
  const [itens, setItens] = useState<Fornecedor[]>(dados);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState(vazio);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  const filtrados = itens.filter((f) => {
    const t = busca.toLowerCase();
    const match =
      f.razaoSocial.toLowerCase().includes(t) ||
      f.nomeFantasia.toLowerCase().includes(t) ||
      f.cnpj.includes(t) ||
      f.email.toLowerCase().includes(t) ||
      f.categoria.toLowerCase().includes(t);
    return match && (filtroStatus === "Todos" || f.status === filtroStatus);
  });

  function abrirNovo() { setEditando(null); setForm(vazio); setModalAberto(true); }
  function abrirEdicao(item: Fornecedor) { setEditando(item); setForm({ razaoSocial: item.razaoSocial, nomeFantasia: item.nomeFantasia, cnpj: item.cnpj, email: item.email, telefone: item.telefone, cidade: item.cidade, estado: item.estado, status: item.status, categoria: item.categoria }); setModalAberto(true); }
  function fechar() { setModalAberto(false); setEditando(null); }

  function salvar() {
    if (!form.razaoSocial.trim()) return;
    if (editando) {
      setItens((prev) => prev.map((f) => (f.id === editando.id ? { ...editando, ...form } : f)));
    } else {
      const id = itens.length > 0 ? Math.max(...itens.map((f) => f.id)) + 1 : 1;
      setItens((prev) => [...prev, { id, ...form }]);
    }
    fechar();
  }

  function excluir(id: number) { setItens((prev) => prev.filter((f) => f.id !== id)); setConfirmarExclusao(null); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cadastro de Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-1">{itens.length} fornecedores cadastrados</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4" /> Novo Fornecedor
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Pesquisar por razão social, CNPJ, categoria..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 pr-9" />
            {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex gap-2">
            {(["Todos", "Ativo", "Inativo"] as const).map((f) => (
              <button key={f} onClick={() => setFiltroStatus(f)} className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${filtroStatus === f ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{f}</button>
            ))}
          </div>
        </div>
        {busca && <p className="text-xs text-gray-500 mt-2">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</p>}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Razão Social / Fantasia</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">CNPJ</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Contato</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden xl:table-cell">Localização</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400"><Search className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Nenhum fornecedor encontrado</p></td></tr>
              ) : filtrados.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs flex-shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.razaoSocial}</p>
                        <p className="text-xs text-gray-400">{item.nomeFantasia}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.cnpj}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-gray-600"><Mail className="w-3 h-3" />{item.email}</span>
                      <span className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3" />{item.telefone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-gray-600">{item.cidade} — {item.estado}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                      <Globe className="w-3 h-3" />{item.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={item.status === "Ativo" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-600 hover:bg-red-100"}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmarExclusao === item.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-gray-500 mr-1">Excluir?</span>
                        <button onClick={() => excluir(item.id)} className="p-1.5 rounded text-green-600 hover:bg-green-50"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmarExclusao(null)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => abrirEdicao(item)} className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmarExclusao(item.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={fechar} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? "Editar Fornecedor" : "Novo Fornecedor"}</h2>
              <button onClick={fechar} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input id="razaoSocial" value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} placeholder="Razão social da empresa" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input id="nomeFantasia" value={form.nomeFantasia} onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })} placeholder="Nome fantasia" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 0000-0000" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="estado">UF</Label>
                  <Input id="estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} placeholder="SP" maxLength={2} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input id="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Distribuição" className="mt-1" />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex gap-2 mt-1">
                    {(["Ativo", "Inativo"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${form.status === s ? s === "Ativo" ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={fechar}>Cancelar</Button>
              <Button onClick={salvar} disabled={!form.razaoSocial.trim()} className="bg-green-600 hover:bg-green-700 text-white">{editando ? "Salvar alterações" : "Cadastrar"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
