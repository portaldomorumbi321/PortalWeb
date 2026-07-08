import { useState } from "react";
import { Search, Plus, Edit2, Trash2, X, Check, CheckSquare, Calendar, User, Flag, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

type Status = "Pendente" | "Em andamento" | "Concluída" | "Cancelada";
type Prioridade = "Alta" | "Média" | "Baixa";

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  responsavel: string;
  prioridade: Prioridade;
  status: Status;
  prazo: string;
  categoria: string;
}

const dados: Tarefa[] = [
  { id: 1, titulo: "Revisar contratos de fornecedores", descricao: "Analisar e atualizar todos os contratos vencidos ou próximos do vencimento.", responsavel: "Ana Paula", prioridade: "Alta", status: "Em andamento", prazo: "2025-07-15", categoria: "Jurídico" },
  { id: 2, titulo: "Atualizar cadastro de clientes inativos", descricao: "Verificar e ativar clientes com mais de 6 meses sem movimentação.", responsavel: "Carlos Mendes", prioridade: "Média", status: "Pendente", prazo: "2025-07-20", categoria: "Comercial" },
  { id: 3, titulo: "Levantamento de estoque mensal", descricao: "Realizar contagem física e reconciliar com sistema.", responsavel: "Fernanda Lima", prioridade: "Alta", status: "Concluída", prazo: "2025-06-30", categoria: "Estoque" },
  { id: 4, titulo: "Preparar relatório financeiro", descricao: "Consolidar dados do trimestre e enviar para diretoria.", responsavel: "João Victor", prioridade: "Alta", status: "Pendente", prazo: "2025-07-10", categoria: "Financeiro" },
  { id: 5, titulo: "Treinamento de novos funcionários", descricao: "Planejar e executar onboarding da nova turma.", responsavel: "Mariana Costa", prioridade: "Média", status: "Em andamento", prazo: "2025-07-25", categoria: "RH" },
  { id: 6, titulo: "Atualizar site institucional", descricao: "Revisar textos e imagens desatualizados.", responsavel: "Ricardo Alves", prioridade: "Baixa", status: "Cancelada", prazo: "2025-06-15", categoria: "Marketing" },
];

const vazio: Omit<Tarefa, "id"> = { titulo: "", descricao: "", responsavel: "", prioridade: "Média", status: "Pendente", prazo: "", categoria: "" };

const statusConfig: Record<Status, { cor: string; bg: string }> = {
  "Pendente":      { cor: "text-yellow-700", bg: "bg-yellow-100" },
  "Em andamento":  { cor: "text-blue-700",   bg: "bg-blue-100" },
  "Concluída":     { cor: "text-green-700",  bg: "bg-green-100" },
  "Cancelada":     { cor: "text-red-600",    bg: "bg-red-100" },
};

const prioridadeConfig: Record<Prioridade, { cor: string; dot: string }> = {
  Alta:  { cor: "text-red-600",    dot: "bg-red-500" },
  Média: { cor: "text-yellow-600", dot: "bg-yellow-400" },
  Baixa: { cor: "text-green-600",  dot: "bg-green-500" },
};

function formatarData(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function prazoVencido(d: string) {
  if (!d) return false;
  return new Date(d) < new Date() ;
}

const allStatus: Status[] = ["Pendente", "Em andamento", "Concluída", "Cancelada"];
const allPrioridades: Prioridade[] = ["Alta", "Média", "Baixa"];

export default function CadastroTarefas() {
  const [itens, setItens] = useState<Tarefa[]>(dados);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<Status | "Todos">("Todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<Prioridade | "Todos">("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [form, setForm] = useState<Omit<Tarefa, "id">>(vazio);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"lista" | "kanban">("lista");

  const filtrados = itens.filter((t) => {
    const q = busca.toLowerCase();
    const match = t.titulo.toLowerCase().includes(q) || t.responsavel.toLowerCase().includes(q) || t.categoria.toLowerCase().includes(q) || t.descricao.toLowerCase().includes(q);
    return match && (filtroStatus === "Todos" || t.status === filtroStatus) && (filtroPrioridade === "Todos" || t.prioridade === filtroPrioridade);
  });

  function abrirNovo() { setEditando(null); setForm(vazio); setModalAberto(true); }
  function abrirEdicao(t: Tarefa) { setEditando(t); setForm({ titulo: t.titulo, descricao: t.descricao, responsavel: t.responsavel, prioridade: t.prioridade, status: t.status, prazo: t.prazo, categoria: t.categoria }); setModalAberto(true); }
  function fechar() { setModalAberto(false); setEditando(null); }

  function salvar() {
    if (!form.titulo.trim()) return;
    if (editando) {
      setItens((prev) => prev.map((t) => (t.id === editando.id ? { ...editando, ...form } : t)));
    } else {
      const id = itens.length > 0 ? Math.max(...itens.map((t) => t.id)) + 1 : 1;
      setItens((prev) => [...prev, { id, ...form }]);
    }
    fechar();
  }

  function excluir(id: number) { setItens((prev) => prev.filter((t) => t.id !== id)); setConfirmarExclusao(null); }

  function moverStatus(id: number, status: Status) {
    setItens((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  // Contadores por status
  const counts = allStatus.reduce((acc, s) => ({ ...acc, [s]: itens.filter((t) => t.status === s).length }), {} as Record<Status, number>);

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastro de Tarefas</h1>
          <p className="text-sm text-gray-500 mt-1">{itens.length} tarefas cadastradas</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Alternador de visualização */}
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            <button onClick={() => setViewMode("lista")} className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "lista" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Lista</button>
            <button onClick={() => setViewMode("kanban")} className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "kanban" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Kanban</button>
          </div>
          <Button onClick={abrirNovo} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {allStatus.map((s) => {
          const cfg = statusConfig[s];
          return (
            <button key={s} onClick={() => setFiltroStatus(filtroStatus === s ? "Todos" : s)} className={`rounded-lg border p-3 text-left transition-all hover:shadow-md ${filtroStatus === s ? "border-indigo-400 ring-2 ring-indigo-200" : "border-gray-200 bg-white"}`}>
              <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.cor}`}>{s}</span>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Pesquisar por título, responsável, categoria..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 pr-9" />
            {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-400 self-center">Prioridade:</span>
          {(["Todos", ...allPrioridades] as const).map((p) => (
            <button key={p} onClick={() => setFiltroPrioridade(p as Prioridade | "Todos")} className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${filtroPrioridade === p ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{p}</button>
          ))}
        </div>
      </Card>

      {/* VIEW: Lista */}
      {viewMode === "lista" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Tarefa</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell">Responsável</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Prioridade</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold hidden lg:table-cell">Prazo</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400"><CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>Nenhuma tarefa encontrada</p></td></tr>
                ) : filtrados.map((item, idx) => {
                  const pcfg = prioridadeConfig[item.prioridade];
                  const scfg = statusConfig[item.status];
                  const vencida = prazoVencido(item.prazo) && item.status !== "Concluída" && item.status !== "Cancelada";
                  return (
                    <tr key={item.id} className={`border-b border-gray-100 hover:bg-indigo-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${pcfg.dot}`} />
                          <div>
                            <p className={`font-medium ${item.status === "Concluída" ? "line-through text-gray-400" : "text-gray-900"}`}>{item.titulo}</p>
                            {item.descricao && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.descricao}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="flex items-center gap-1 text-gray-600"><User className="w-3 h-3" />{item.responsavel || "—"}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {item.categoria && <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">{item.categoria}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${pcfg.cor}`}>
                          <Flag className="w-3 h-3" />{item.prioridade}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`flex items-center gap-1 text-xs ${vencida ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                          <Clock className="w-3 h-3" />{formatarData(item.prazo)}{vencida && " ⚠"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${scfg.bg} ${scfg.cor} hover:${scfg.bg}`}>{item.status}</Badge>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VIEW: Kanban */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {allStatus.map((col) => {
            const scfg = statusConfig[col];
            const colItens = filtrados.filter((t) => t.status === col);
            return (
              <div key={col} className="flex flex-col gap-3">
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${scfg.bg}`}>
                  <span className={`text-sm font-semibold ${scfg.cor}`}>{col}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${scfg.cor}`}>{colItens.length}</span>
                </div>
                {colItens.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-center text-gray-300 text-xs">Nenhuma tarefa</div>
                )}
                {colItens.map((item) => {
                  const pcfg = prioridadeConfig[item.prioridade];
                  const vencida = prazoVencido(item.prazo) && item.status !== "Concluída" && item.status !== "Cancelada";
                  return (
                    <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className={`text-sm font-medium leading-snug ${item.status === "Concluída" ? "line-through text-gray-400" : "text-gray-900"}`}>{item.titulo}</p>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${pcfg.dot}`} title={item.prioridade} />
                      </div>
                      {item.descricao && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.descricao}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col gap-1">
                          {item.responsavel && <span className="flex items-center gap-1 text-xs text-gray-500"><User className="w-3 h-3" />{item.responsavel}</span>}
                          {item.prazo && <span className={`flex items-center gap-1 text-xs ${vencida ? "text-red-600 font-semibold" : "text-gray-400"}`}><Calendar className="w-3 h-3" />{formatarData(item.prazo)}</span>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => abrirEdicao(item)} className="p-1 rounded text-blue-500 hover:bg-blue-50"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => excluir(item.id)} className="p-1 rounded text-red-400 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      {/* Mover rápido de status */}
                      <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100 flex-wrap">
                        {allStatus.filter((s) => s !== item.status).map((s) => (
                          <button key={s} onClick={() => moverStatus(item.id, s)} className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${statusConfig[s].bg} ${statusConfig[s].cor} hover:opacity-80`}>{s}</button>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={fechar} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? "Editar Tarefa" : "Nova Tarefa"}</h2>
              <button onClick={fechar} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input id="titulo" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título da tarefa" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <textarea id="descricao" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva a tarefa..." rows={3} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input id="responsavel" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Nome do responsável" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input id="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Financeiro" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="prazo">Prazo</Label>
                <Input id="prazo" type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Prioridade</Label>
                <div className="flex gap-2 mt-1">
                  {allPrioridades.map((p) => {
                    const cfg = prioridadeConfig[p];
                    return (
                      <button key={p} type="button" onClick={() => setForm({ ...form, prioridade: p })} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${form.prioridade === p ? `${p === "Alta" ? "bg-red-500 border-red-500" : p === "Média" ? "bg-yellow-400 border-yellow-400" : "bg-green-500 border-green-500"} text-white` : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                        <span className={`w-2 h-2 rounded-full ${form.prioridade === p ? "bg-white" : cfg.dot}`} />{p}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {allStatus.map((s) => {
                    const cfg = statusConfig[s];
                    return (
                      <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors text-left ${form.status === s ? `${cfg.bg} ${cfg.cor} border-current` : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{s}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={fechar}>Cancelar</Button>
              <Button onClick={salvar} disabled={!form.titulo.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">{editando ? "Salvar alterações" : "Cadastrar"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
