import { useState } from "react";
import {
  Search, Plus, Edit2, Trash2, X, Check, FileText, ChevronDown, ChevronUp,
  User, Calendar, DollarSign, Send, Eye, Copy
} from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

type StatusOrc = "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado" | "Cancelado";

interface ItemOrc {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
}

interface Orcamento {
  id: number;
  numero: string;
  cliente: string;
  email: string;
  status: StatusOrc;
  dataCriacao: string;
  dataValidade: string;
  observacoes: string;
  itens: ItemOrc[];
}

const itemVazio = (): ItemOrc => ({ id: Date.now(), descricao: "", quantidade: 1, unidade: "un", valorUnitario: 0, desconto: 0 });

const dados: Orcamento[] = [
  {
    id: 1, numero: "25060101", cliente: "Ana Paula Souza", email: "ana@email.com",
    status: "Aprovado", dataCriacao: "2025-06-01", dataValidade: "2025-07-01", observacoes: "Entrega em até 5 dias úteis.",
    itens: [
      { id: 1, descricao: "Notebook Pro 15\"", quantidade: 2, unidade: "un", valorUnitario: 4599.90, desconto: 5 },
      { id: 2, descricao: "Mouse Sem Fio", quantidade: 2, unidade: "un", valorUnitario: 89.90, desconto: 0 },
    ],
  },
  {
    id: 2, numero: "25061501", cliente: "Carlos Mendes", email: "carlos@empresa.com",
    status: "Enviado", dataCriacao: "2025-06-15", dataValidade: "2025-07-15", observacoes: "",
    itens: [
      { id: 1, descricao: "Cadeira Ergonômica", quantidade: 5, unidade: "un", valorUnitario: 1299.00, desconto: 10 },
    ],
  },
  {
    id: 3, numero: "25070101", cliente: "Fernanda Lima", email: "fernanda@loja.com",
    status: "Rascunho", dataCriacao: "2025-07-01", dataValidade: "2025-08-01", observacoes: "Aguardando confirmação de modelo.",
    itens: [
      { id: 1, descricao: "Serviço de Consultoria", quantidade: 10, unidade: "h", valorUnitario: 250.00, desconto: 0 },
      { id: 2, descricao: "Relatório Técnico", quantidade: 1, unidade: "un", valorUnitario: 800.00, desconto: 0 },
    ],
  },
  {
    id: 4, numero: "25052001", cliente: "João Victor Reis", email: "joao@mail.com",
    status: "Rejeitado", dataCriacao: "2025-05-20", dataValidade: "2025-06-20", observacoes: "",
    itens: [
      { id: 1, descricao: "Licença Software Anual", quantidade: 1, unidade: "un", valorUnitario: 3500.00, desconto: 0 },
    ],
  },
];

const statusConfig: Record<StatusOrc, { bg: string; cor: string }> = {
  Rascunho:  { bg: "bg-gray-100",   cor: "text-gray-600" },
  Enviado:   { bg: "bg-blue-100",   cor: "text-blue-700" },
  Aprovado:  { bg: "bg-green-100",  cor: "text-green-700" },
  Rejeitado: { bg: "bg-red-100",    cor: "text-red-600" },
  Cancelado: { bg: "bg-orange-100", cor: "text-orange-600" },
};

const allStatus: StatusOrc[] = ["Rascunho", "Enviado", "Aprovado", "Rejeitado", "Cancelado"];

function calcItem(item: ItemOrc) {
  const bruto = item.quantidade * item.valorUnitario;
  const desc = bruto * (item.desconto / 100);
  return bruto - desc;
}

function calcTotal(itens: ItemOrc[]) {
  return itens.reduce((acc, i) => acc + calcItem(i), 0);
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function gerarNumero(lista: Orcamento[]) {
  // New format: <aammdd><NN> where NN is incremental starting at 01 per day
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePart = `${yy}${mm}${dd}`;

  // Look for existing numbers that match the new pattern for today and extract their sequence
  const regex = new RegExp(`^${datePart}(\\d{2})$`);
  const seqNums = lista
    .map((o) => {
      const m = String(o.numero).match(regex);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  const next = seqNums.length > 0 ? Math.max(...seqNums) + 1 : 1;
  const seq = String(next).padStart(2, "0");
  return `${datePart}${seq}`;
}

type Tela = "lista" | "form" | "preview";

const orcVazio = (): Omit<Orcamento, "id"> => ({
  numero: "", cliente: "", email: "", status: "Rascunho",
  dataCriacao: new Date().toISOString().split("T")[0],
  dataValidade: "", observacoes: "", itens: [itemVazio()],
});

export default function Orcamentos() {
  const [lista, setLista] = useState<Orcamento[]>(dados);
  const [tela, setTela] = useState<Tela>("lista");
  const [editando, setEditando] = useState<Orcamento | null>(null);
  const [form, setForm] = useState<Omit<Orcamento, "id">>(orcVazio());
  const [preview, setPreview] = useState<Orcamento | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOrc | "Todos">("Todos");
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  // --- lista helpers ---
  const filtrados = lista.filter((o) => {
    const q = busca.toLowerCase();
    const match = o.numero.toLowerCase().includes(q) || o.cliente.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    return match && (filtroStatus === "Todos" || o.status === filtroStatus);
  });

  const totais = {
    total: lista.reduce((a, o) => a + calcTotal(o.itens), 0),
    aprovados: lista.filter((o) => o.status === "Aprovado").reduce((a, o) => a + calcTotal(o.itens), 0),
    pendentes: lista.filter((o) => o.status === "Enviado").length,
  };

  function toggleExpandir(id: number) {
    setExpandidos((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function abrirNovo() {
    setEditando(null);
    setForm({ ...orcVazio(), numero: gerarNumero(lista) });
    setTela("form");
  }

  function abrirEdicao(o: Orcamento) {
    setEditando(o);
    setForm({ numero: o.numero, cliente: o.cliente, email: o.email, status: o.status, dataCriacao: o.dataCriacao, dataValidade: o.dataValidade, observacoes: o.observacoes, itens: o.itens.map((i) => ({ ...i })) });
    setTela("form");
  }

  function abrirPreview(o: Orcamento) { setPreview(o); setTela("preview"); }

  function voltar() { setTela("lista"); setEditando(null); setPreview(null); }

  function salvar() {
    if (!form.cliente.trim()) return null;
    if (editando) {
      setLista((prev) => prev.map((o) => (o.id === editando.id ? { ...editando, ...form } : o)));
      voltar();
      return editando.id;
    } else {
      const id = lista.length > 0 ? Math.max(...lista.map((o) => o.id)) + 1 : 1;
      const novo = { id, ...form };
      setLista((prev) => [...prev, novo]);
      voltar();
      return id;
    }
  }

  function duplicar(o: Orcamento) {
    const id = lista.length > 0 ? Math.max(...lista.map((x) => x.id)) + 1 : 1;
    const novo: Orcamento = { ...o, id, numero: gerarNumero([...lista, o]), status: "Rascunho", dataCriacao: new Date().toISOString().split("T")[0] };
    setLista((prev) => [...prev, novo]);
  }

  function gerarRoteiro() {
    // Save first (if valid) and navigate to roteiro page passing orc in state
    if (!form.cliente.trim()) return;
    let id: number | null = null;
    if (editando) {
      // update
      setLista((prev) => prev.map((o) => {
        if (o.id === editando.id) {
          id = editando.id;
          return { ...editando, ...form } as Orcamento;
        }
        return o;
      }));
    } else {
      // create
      id = lista.length > 0 ? Math.max(...lista.map((o) => o.id)) + 1 : 1;
      const novo = { id, ...form } as Orcamento;
      setLista((prev) => [...prev, novo]);
    }

    // prepare orc data to pass
    const orcSalvo = { id, ...form } as Orcamento;
    // navigate to roteiro route with state
    // use setTimeout to ensure state was applied before navigating
    setTimeout(() => {
      navigate(`/financeiro/orcamentos/${id}/roteiro`, { state: { orc: orcSalvo } });
    }, 150);
  }

  function excluir(id: number) { setLista((prev) => prev.filter((o) => o.id !== id)); setConfirmarExclusao(null); }

  // --- itens do form ---
  function addItem() { setForm((f) => ({ ...f, itens: [...f.itens, itemVazio()] })); }
  function removeItem(id: number) { setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) })); }
  function updateItem(id: number, field: keyof ItemOrc, value: string | number) {
    setForm((f) => ({ ...f, itens: f.itens.map((i) => i.id === id ? { ...i, [field]: value } : i) }));
  }

  // ============ TELA PREVIEW ============
  if (tela === "preview" && preview) {
    const total = calcTotal(preview.itens);
    const totalBruto = preview.itens.reduce((a, i) => a + i.quantidade * i.valorUnitario, 0);
    const totalDesc = totalBruto - total;
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={voltar} className="flex items-center gap-2"><X className="w-4 h-4" /> Fechar</Button>
          <h2 className="text-xl font-bold text-gray-900">Visualização do Orçamento</h2>
        </div>
        <Card className="max-w-3xl mx-auto p-8">
          {/* Cabeçalho do orçamento */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-indigo-700">{preview.numero}</h1>
              <p className="text-gray-500 text-sm mt-1">Emitido em {fmtData(preview.dataCriacao)} · Válido até {fmtData(preview.dataValidade)}</p>
            </div>
            <Badge className={`${statusConfig[preview.status].bg} ${statusConfig[preview.status].cor} text-sm px-3 py-1`}>{preview.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Cliente</p>
              <p className="font-semibold text-gray-900">{preview.cliente}</p>
              <p className="text-sm text-gray-500">{preview.email}</p>
            </div>
          </div>

          {/* Itens */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-indigo-200">
                <th className="text-left py-2 text-gray-600 font-semibold">Descrição</th>
                <th className="text-center py-2 text-gray-600 font-semibold w-16">Qtd</th>
                <th className="text-center py-2 text-gray-600 font-semibold w-12">Un</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">Unit.</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-16">Desc.</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {preview.itens.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  <td className="py-2.5 text-gray-800">{item.descricao}</td>
                  <td className="py-2.5 text-center text-gray-600">{item.quantidade}</td>
                  <td className="py-2.5 text-center text-gray-500">{item.unidade}</td>
                  <td className="py-2.5 text-right text-gray-600">{moeda(item.valorUnitario)}</td>
                  <td className="py-2.5 text-right text-orange-500">{item.desconto > 0 ? `${item.desconto}%` : "—"}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">{moeda(calcItem(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totais */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{moeda(totalBruto)}</span></div>
              {totalDesc > 0 && <div className="flex justify-between text-sm text-orange-500"><span>Descontos</span><span>- {moeda(totalDesc)}</span></div>}
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2"><span>Total</span><span className="text-indigo-700">{moeda(total)}</span></div>
            </div>
          </div>

          {preview.observacoes && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Observações</p>
              <p className="text-sm text-yellow-800">{preview.observacoes}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ============ TELA FORMULÁRIO ============
  if (tela === "form") {
    const totalForm = calcTotal(form.itens);
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={voltar} className="flex items-center gap-2"><X className="w-4 h-4" /> Cancelar</Button>
          <h2 className="text-xl font-bold text-gray-900">{editando ? `Editar ${editando.numero}` : "Novo Orçamento"}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do cliente */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-indigo-500" /> Dados do Cliente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Input id="cliente" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Nome do cliente" className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@cliente.com" className="mt-1" />
                </div>
              </div>
            </Card>

            {/* Itens */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" /> Itens do Orçamento</h3>

              <div className="space-y-3">
                {form.itens.map((item, idx) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Item {idx + 1}</span>
                      {form.itens.length > 1 && (
                        <button onClick={() => removeItem(item.id)} className="p-1 rounded text-red-400 hover:bg-red-50"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-6">
                        <Input value={item.descricao} onChange={(e) => updateItem(item.id, "descricao", e.target.value)} placeholder="Descrição do item / serviço" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min="1" value={item.quantidade} onChange={(e) => updateItem(item.id, "quantidade", parseFloat(e.target.value) || 1)} placeholder="Qtd" />
                      </div>
                      <div className="col-span-1">
                        <Input value={item.unidade} onChange={(e) => updateItem(item.id, "unidade", e.target.value)} placeholder="Un" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min="0" step="0.01" value={item.valorUnitario} onChange={(e) => updateItem(item.id, "valorUnitario", parseFloat(e.target.value) || 0)} placeholder="Valor unit." />
                      </div>
                      <div className="col-span-1">
                        <Input type="number" min="0" max="100" value={item.desconto} onChange={(e) => updateItem(item.id, "desconto", parseFloat(e.target.value) || 0)} placeholder="% desc" />
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold text-indigo-700 mt-2">
                      {moeda(calcItem(item))}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addItem} className="mt-3 w-full border-2 border-dashed border-indigo-200 rounded-lg py-2.5 text-sm text-indigo-600 font-medium hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar item
              </button>
            </Card>

            {/* Observações */}
            <Card className="p-5">
              <Label htmlFor="obs">Observações</Label>
              <textarea id="obs" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Condições de pagamento, prazo de entrega, garantias..." rows={3} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none" />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" /> Detalhes</h3>
              <div className="space-y-4">
                <div>
                  <Label>Número</Label>
                  <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="mt-1 font-mono" />
                </div>
                <div>
                  <Label htmlFor="dataCriacao">Data de emissão</Label>
                  <Input id="dataCriacao" type="date" value={form.dataCriacao} onChange={(e) => setForm({ ...form, dataCriacao: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="dataValidade">Válido até</Label>
                  <Input id="dataValidade" type="date" value={form.dataValidade} onChange={(e) => setForm({ ...form, dataValidade: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="grid grid-cols-1 gap-1.5 mt-1">
                    {allStatus.map((s) => {
                      const cfg = statusConfig[s];
                      return (
                        <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={`px-3 py-1.5 rounded-md text-sm font-medium border text-left transition-colors ${form.status === s ? `${cfg.bg} ${cfg.cor} border-current` : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{s}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Resumo de valores */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-indigo-500" /> Resumo</h3>
              <div className="space-y-2 text-sm">
                {form.itens.map((item, idx) => item.descricao && (
                  <div key={item.id} className="flex justify-between text-gray-500">
                    <span className="truncate flex-1 mr-2">Item {idx + 1}</span>
                    <span>{moeda(calcItem(item))}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-bold text-base text-gray-900">
                  <span>Total</span>
                  <span className="text-indigo-700">{moeda(totalForm)}</span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <Button onClick={salvar} disabled={!form.cliente.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                <Check className="w-4 h-4 mr-1" />{editando ? "Salvar alterações" : "Criar orçamento"}
              </Button>
              <Button variant="outline" onClick={voltar} className="w-full">Cancelar</Button>
              <Button variant="ghost" onClick={() => gerarRoteiro()} className="w-full text-sm">
                Gerar Roteiro
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ TELA LISTA ============
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-sm text-gray-500 mt-1">{lista.length} orçamentos cadastrados</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4" /> Novo Orçamento
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-indigo-600" /></div>
          <div><p className="text-xs text-gray-500">Volume Total</p><p className="text-xl font-bold text-gray-900">{moeda(totais.total)}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Check className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Aprovados</p><p className="text-xl font-bold text-gray-900">{moeda(totais.aprovados)}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Send className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Aguardando retorno</p><p className="text-xl font-bold text-gray-900">{totais.pendentes} orçamento{totais.pendentes !== 1 ? "s" : ""}</p></div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Pesquisar por número, cliente, e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 pr-9" />
            {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Todos", ...allStatus] as const).map((s) => (
              <button key={s} onClick={() => setFiltroStatus(s as StatusOrc | "Todos")} className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${filtroStatus === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{s}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Lista de orçamentos */}
      <div className="space-y-3">
        {filtrados.length === 0 && (
          <Card className="py-12 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Nenhum orçamento encontrado</p>
          </Card>
        )}
        {filtrados.map((orc) => {
          const total = calcTotal(orc.itens);
          const cfg = statusConfig[orc.status];
          const expandido = expandidos.has(orc.id);
          const vencido = orc.dataValidade && new Date(orc.dataValidade) < new Date() && orc.status !== "Aprovado" && orc.status !== "Cancelado" && orc.status !== "Rejeitado";
          return (
            <Card key={orc.id} className="overflow-hidden">
              {/* Linha principal */}
              <div className="p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-indigo-700">{orc.numero}</span>
                    <Badge className={`${cfg.bg} ${cfg.cor} hover:${cfg.bg}`}>{orc.status}</Badge>
                    {vencido && <span className="text-xs text-red-500 font-semibold">⚠ Vencido</span>}
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{orc.cliente}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" />Emissão: {fmtData(orc.dataCriacao)}</span>
                    {orc.dataValidade && <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" />Validade: {fmtData(orc.dataValidade)}</span>}
                    <span className="text-xs text-gray-400">{orc.itens.length} item{orc.itens.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg text-indigo-700">{moeda(total)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => abrirPreview(orc)} title="Visualizar" className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => abrirEdicao(orc)} title="Editar" className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => duplicar(orc)} title="Duplicar" className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"><Copy className="w-4 h-4" /></button>
                  {confirmarExclusao === orc.id ? (
                    <>
                      <span className="text-xs text-gray-500">Excluir?</span>
                      <button onClick={() => excluir(orc.id)} className="p-1.5 rounded text-green-600 hover:bg-green-50"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmarExclusao(null)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmarExclusao(orc.id)} title="Excluir" className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => toggleExpandir(orc.id)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100 transition-colors">
                    {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Itens expandidos */}
              {expandido && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 font-semibold">
                        <th className="text-left pb-2">Descrição</th>
                        <th className="text-center pb-2 w-12">Qtd</th>
                        <th className="text-center pb-2 w-10">Un</th>
                        <th className="text-right pb-2 w-24">Unit.</th>
                        <th className="text-right pb-2 w-16">Desc.</th>
                        <th className="text-right pb-2 w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orc.itens.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200">
                          <td className="py-1.5 text-gray-700">{item.descricao}</td>
                          <td className="py-1.5 text-center text-gray-500">{item.quantidade}</td>
                          <td className="py-1.5 text-center text-gray-400">{item.unidade}</td>
                          <td className="py-1.5 text-right text-gray-500">{moeda(item.valorUnitario)}</td>
                          <td className="py-1.5 text-right text-orange-500">{item.desconto > 0 ? `${item.desconto}%` : "—"}</td>
                          <td className="py-1.5 text-right font-semibold text-gray-800">{moeda(calcItem(item))}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-indigo-200">
                        <td colSpan={5} className="py-2 font-bold text-gray-700">Total</td>
                        <td className="py-2 text-right font-bold text-indigo-700">{moeda(total)}</td>
                      </tr>
                    </tbody>
                  </table>
                  {orc.observacoes && <p className="text-xs text-gray-500 mt-2 italic">Obs: {orc.observacoes}</p>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
