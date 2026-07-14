import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Package, X, Tag } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  atualizarProduto,
  criarProduto,
  listarProdutos,
  type Produto,
  type ProdutoPayload,
} from "../data/produtosApi";

const vazio: ProdutoPayload = {
  nome: "",
  codigo: "",
  categoria: "",
  preco: 0,
  fornecedor: "",
  operadora: "",
  unidade: "un",
  status: "Ativo",
};

const operadorasPadrao = ["Vivo", "Claro", "TIM", "Oi"];

function formatarPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CadastroProdutos() {
  const [itens, setItens] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState(vazio);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarProdutos() {
    setErro(null);
    try {
      const lista = await listarProdutos();
      setItens(lista);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar produtos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const filtrados = itens.filter((p) => {
    const t = busca.toLowerCase();
    const match =
      p.nome.toLowerCase().includes(t) ||
      p.codigo.toLowerCase().includes(t) ||
      p.categoria.toLowerCase().includes(t) ||
      p.fornecedor.toLowerCase().includes(t) ||
      p.operadora.toLowerCase().includes(t);
    return match && (filtroStatus === "Todos" || p.status === filtroStatus);
  });

  const fornecedores = Array.from(
    new Set(itens.map((item) => item.fornecedor.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const operadoras = Array.from(new Set([...operadorasPadrao, ...itens.map((item) => item.operadora.trim()).filter(Boolean)]));

  function abrirNovo() { setErro(null); setEditando(null); setForm(vazio); setModalAberto(true); }
  function abrirEdicao(p: Produto) {
    setErro(null);
    setEditando(p);
    setForm({
      nome: p.nome,
      codigo: p.codigo,
      categoria: p.categoria,
      preco: p.preco,
      fornecedor: p.fornecedor,
      operadora: p.operadora,
      unidade: p.unidade,
      status: p.status,
    });
    setModalAberto(true);
  }
  function fechar() { setModalAberto(false); setEditando(null); }

  async function salvar() {
    if (!form.nome.trim()) return;

    setSalvando(true);
    setErro(null);

    try {
      const payload: ProdutoPayload = {
        ...form,
        nome: form.nome.trim(),
        codigo: form.codigo.trim().toUpperCase(),
        categoria: form.categoria.trim(),
        fornecedor: form.fornecedor.trim(),
        operadora: form.operadora.trim(),
        unidade: form.unidade.trim() || "un",
        preco: Number(form.preco) || 0,
      };

      if (editando) {
        await atualizarProduto(editando.id, payload);
      } else {
        await criarProduto(payload);
      }

      await carregarProdutos();
      fechar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar produto.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cadastro de Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">{itens.length} produtos cadastrados</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Pesquisar por nome, código, categoria..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 pr-9" />
            {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex gap-2">
            {(["Todos", "Ativo", "Inativo"] as const).map((f) => (
              <button key={f} onClick={() => setFiltroStatus(f)} className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${filtroStatus === f ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{f}</button>
            ))}
          </div>
        </div>
        {busca && <p className="text-xs text-gray-500 mt-2">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</p>}
      </Card>

      <Card className="overflow-hidden">
        {erro && <p className="m-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
        {carregando && <p className="m-4 text-sm text-gray-500">Carregando produtos...</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Produto</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Código</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Categoria</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Preço</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Fornecedor</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Operadora</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {!carregando && filtrados.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400"><Package className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Nenhum produto encontrado</p></td></tr>
              ) : filtrados.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{item.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{item.codigo}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium">
                      <Tag className="w-3 h-3" />{item.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell font-semibold text-gray-800">{formatarPreco(item.preco)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-700">{item.fornecedor || "-"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-700">{item.operadora || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge className={item.status === "Ativo" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-600 hover:bg-red-100"}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirEdicao(item)} className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    </div>
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
              <h2 className="text-lg font-semibold text-gray-900">{editando ? "Editar Produto" : "Novo Produto"}</h2>
              <button onClick={fechar} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do produto" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input id="codigo" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ex: PRD-001" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input id="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Informática" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input id="preco" type="number" min="0" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Input id="unidade" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} placeholder="un" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fornecedor">Fornecedor</Label>
                  <Input
                    id="fornecedor"
                    list="lista-fornecedores"
                    value={form.fornecedor}
                    onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                    placeholder="Selecione ou digite"
                    className="mt-1"
                  />
                  <datalist id="lista-fornecedores">
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor} value={fornecedor} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="operadora">Operadora</Label>
                  <Input
                    id="operadora"
                    list="lista-operadoras"
                    value={form.operadora}
                    onChange={(e) => setForm({ ...form, operadora: e.target.value })}
                    placeholder="Vivo, Claro, TIM, Oi ou outra"
                    className="mt-1"
                  />
                  <datalist id="lista-operadoras">
                    {operadoras.map((operadora) => (
                      <option key={operadora} value={operadora} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <Button onClick={salvar} disabled={salvando || !form.nome.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">{salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
