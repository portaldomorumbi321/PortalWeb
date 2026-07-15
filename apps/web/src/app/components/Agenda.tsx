import { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock, User, X, Check, Trash2, Edit2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { listarClientes, type Cliente } from "../data/clientesApi";
import {
  atualizarEvento,
  criarEvento,
  listarEventos,
  removerEvento,
  type Evento,
  type EventoPayload,
  type TipoEvento,
} from "../data/eventosApi";
import { listarFuncionarios, type Funcionario } from "../data/funcionariosApi";

type FiltroPeriodo = "semana" | "mes" | "ano";

const tipoConfig: Record<TipoEvento, { cor: string; bg: string; dot: string }> = {
  "Reunião":  { cor: "text-blue-700",   bg: "bg-blue-100",   dot: "bg-blue-500" },
  "Viagem":   { cor: "text-purple-700", bg: "bg-purple-100", dot: "bg-purple-500" },
  "Tarefa":   { cor: "text-yellow-700", bg: "bg-yellow-100", dot: "bg-yellow-500" },
  "Lembrete": { cor: "text-orange-700", bg: "bg-orange-100", dot: "bg-orange-500" },
  "Outro":    { cor: "text-gray-700",   bg: "bg-gray-100",   dot: "bg-gray-400" },
};

const allTipos: TipoEvento[] = ["Reunião", "Viagem", "Tarefa", "Lembrete", "Outro"];

const hoje = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const nomeMeses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const nomeDias  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function getDiasDoMes(ano: number, mes: number) {
  return {
    primeiro: new Date(ano, mes, 1).getDay(),
    total:    new Date(ano, mes + 1, 0).getDate(),
  };
}

function fromDateStr(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function addDias(data: Date, dias: number) {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

function inicioDaSemana(data: Date) {
  const d = new Date(data);
  const diaSemana = d.getDay();
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fimDaSemana(data: Date) {
  return addDias(inicioDaSemana(data), 6);
}

const vazio: EventoPayload = { titulo: "", descricao: "", data: toDateStr(hoje), hora: "09:00", tipo: "Reunião", cliente: "", agente: "" };

function formatarData(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
export default function Agenda() {
  const [eventos, setEventos]           = useState<Evento[]>([]);
  const [clientes, setClientes]         = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [anoAtual, setAnoAtual]         = useState(hoje.getFullYear());
  const [mesAtual, setMesAtual]         = useState(hoje.getMonth());
  const [diaSelecionado, setDiaSel]     = useState<string | null>(toDateStr(hoje));
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>("mes");
  const [modalAberto, setModalAberto]   = useState(false);
  const [form, setForm]                 = useState<EventoPayload>(vazio);
  const [editandoId, setEditandoId]     = useState<number | null>(null);
  const [carregando, setCarregando]     = useState(true);
  const [salvando, setSalvando]         = useState(false);
  const [erro, setErro]                 = useState<string | null>(null);

  async function carregarEventos() {
    setErro(null);
    try {
      const lista = await listarEventos();
      setEventos(lista);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar eventos.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarRelacionamentos() {
    try {
      const [clientesLista, funcionariosLista] = await Promise.all([
        listarClientes(),
        listarFuncionarios(),
      ]);

      setClientes(clientesLista);
      setFuncionarios(funcionariosLista.filter((funcionario) => funcionario.status === "Ativo"));
    } catch {
      setClientes([]);
      setFuncionarios([]);
    }
  }

  useEffect(() => {
    carregarEventos();
    carregarRelacionamentos();
  }, []);

  const { primeiro, total } = getDiasDoMes(anoAtual, mesAtual);

  const aplicarDataBase = (data: Date) => {
    setAnoAtual(data.getFullYear());
    setMesAtual(data.getMonth());
    setDiaSel(toDateStr(data));
  };

  const navegarAnterior = () => {
    if (filtroPeriodo === "semana") {
      const base = diaSelecionado ? fromDateStr(diaSelecionado) : hoje;
      aplicarDataBase(addDias(base, -7));
      return;
    }
    if (filtroPeriodo === "mes") {
      if (mesAtual === 0) {
        setMesAtual(11);
        setAnoAtual(a => a - 1);
      } else {
        setMesAtual(m => m - 1);
      }
      return;
    }
    setAnoAtual(a => a - 1);
  };

  const navegarProximo = () => {
    if (filtroPeriodo === "semana") {
      const base = diaSelecionado ? fromDateStr(diaSelecionado) : hoje;
      aplicarDataBase(addDias(base, 7));
      return;
    }
    if (filtroPeriodo === "mes") {
      if (mesAtual === 11) {
        setMesAtual(0);
        setAnoAtual(a => a + 1);
      } else {
        setMesAtual(m => m + 1);
      }
      return;
    }
    setAnoAtual(a => a + 1);
  };

  const eventosDoDia       = (data: string) => eventos.filter(e => e.data === data);
  const eventosSelecionados = diaSelecionado ? eventosDoDia(diaSelecionado) : [];

  const baseData = diaSelecionado ? fromDateStr(diaSelecionado) : hoje;
  const inicioPeriodo =
    filtroPeriodo === "semana"
      ? inicioDaSemana(baseData)
      : filtroPeriodo === "mes"
      ? new Date(anoAtual, mesAtual, 1)
      : new Date(anoAtual, 0, 1);
  const fimPeriodo =
    filtroPeriodo === "semana"
      ? fimDaSemana(baseData)
      : filtroPeriodo === "mes"
      ? new Date(anoAtual, mesAtual + 1, 0)
      : new Date(anoAtual, 11, 31);

  const inicioStr = toDateStr(inicioPeriodo);
  const fimStr = toDateStr(fimPeriodo);

  const eventosDoPeriodo = [...eventos]
    .filter(e => e.data >= inicioStr && e.data <= fimStr)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

  const tituloPeriodo =
    filtroPeriodo === "semana"
      ? `${formatarData(inicioStr)} - ${formatarData(fimStr)}`
      : filtroPeriodo === "mes"
      ? `${nomeMeses[mesAtual]} ${anoAtual}`
      : `Ano ${anoAtual}`;

  const diasDaSemana = Array.from({ length: 7 }).map((_, i) => {
    const data = addDias(inicioDaSemana(baseData), i);
    const dataStr = toDateStr(data);
    return {
      data,
      dataStr,
      eventos: eventosDoDia(dataStr),
      isHoje: dataStr === toDateStr(hoje),
      isSel: dataStr === diaSelecionado,
    };
  });

  const abrirNovo   = () => { setErro(null); setForm({ ...vazio, data: diaSelecionado ?? toDateStr(hoje) }); setEditandoId(null); setModalAberto(true); };
  const abrirEditar = (ev: Evento) => {
    setErro(null);
    setForm({ titulo: ev.titulo, descricao: ev.descricao, data: ev.data, hora: ev.hora, tipo: ev.tipo, cliente: ev.cliente, agente: ev.agente });
    setEditandoId(ev.id);
    setModalAberto(true);
  };
  const fechar      = () => { setModalAberto(false); setForm(vazio); setEditandoId(null); };
  const salvar      = async () => {
    if (!form.titulo.trim()) return;

    setSalvando(true);
    setErro(null);

    try {
      const payload: EventoPayload = {
        ...form,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        cliente: form.cliente.trim(),
        agente: form.agente.trim(),
      };

      if (editandoId !== null) {
        await atualizarEvento(editandoId, payload);
      } else {
        await criarEvento(payload);
      }

      await carregarEventos();
      fechar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar evento.");
    } finally {
      setSalvando(false);
    }
  };
  const excluir = async (id: number) => {
    setErro(null);
    try {
      await removerEvento(id);
      await carregarEventos();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir evento.");
    }
  };

  const proximosEventos = [...eventos]
    .filter(e => e.data >= toDateStr(hoje))
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 5);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" /> Agenda
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {([
            { key: "semana", label: "Semana" },
            { key: "mes", label: "Mês" },
            { key: "ano", label: "Ano" },
          ] as { key: FiltroPeriodo; label: string }[]).map((filtro) => (
            <button
              key={filtro.key}
              type="button"
              onClick={() => setFiltroPeriodo(filtro.key)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filtroPeriodo === filtro.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
            >
              {filtro.label}
            </button>
          ))}
          <Button onClick={abrirNovo} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Evento
          </Button>
        </div>
      </div>
      {erro && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      {carregando && <p className="text-sm text-gray-500">Carregando eventos...</p>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navegação e visão do período */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <button onClick={navegarAnterior} className="p-2 rounded-md hover:bg-gray-100 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
              <CardTitle className="text-lg font-semibold">{tituloPeriodo}</CardTitle>
              <button onClick={navegarProximo} className="p-2 rounded-md hover:bg-gray-100 transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
            </div>
          </CardHeader>
          <CardContent>
            {filtroPeriodo !== "ano" && (
              <div className="grid grid-cols-7 mb-2">
                {nomeDias.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>)}
              </div>
            )}

            {filtroPeriodo === "mes" && (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: primeiro }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: total }).map((_, i) => {
                  const dia     = i + 1;
                  const dataStr = `${anoAtual}-${pad(mesAtual + 1)}-${pad(dia)}`;
                  const isHoje  = dataStr === toDateStr(hoje);
                  const isSel   = dataStr === diaSelecionado;
                  const evsDia  = eventosDoDia(dataStr);
                  return (
                    <button key={dia} onClick={() => setDiaSel(dataStr)}
                      className={`relative flex flex-col items-center justify-start pt-1 pb-1 rounded-lg min-h-[52px] text-sm font-medium transition-colors border ${
                        isSel  ? "bg-blue-600 text-white border-blue-600"
                        : isHoje ? "bg-blue-50 text-blue-700 border-blue-300"
                        : "text-gray-700 border-transparent hover:bg-gray-100"}`}
                    >
                      <span>{dia}</span>
                      {evsDia.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 px-0.5">
                          {evsDia.slice(0, 3).map(ev => <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${isSel ? "bg-white" : tipoConfig[ev.tipo].dot}`} />)}
                          {evsDia.length > 3 && <span className={`text-[9px] font-bold ${isSel ? "text-white" : "text-gray-500"}`}>+{evsDia.length - 3}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {filtroPeriodo === "semana" && (
              <div className="grid grid-cols-7 gap-2">
                {diasDaSemana.map(({ data, dataStr, eventos: evsDia, isHoje, isSel }) => (
                  <button
                    key={dataStr}
                    onClick={() => setDiaSel(dataStr)}
                    className={`rounded-lg border min-h-[88px] p-2 text-left transition-colors ${
                      isSel
                        ? "bg-blue-600 text-white border-blue-600"
                        : isHoje
                        ? "bg-blue-50 text-blue-700 border-blue-300"
                        : "text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-xs font-semibold">{nomeDias[data.getDay()]}</div>
                    <div className="text-sm font-bold">{pad(data.getDate())}</div>
                    <div className="mt-2 space-y-1">
                      {evsDia.slice(0, 2).map(ev => (
                        <div key={ev.id} className={`text-[11px] truncate rounded px-1.5 py-0.5 ${isSel ? "bg-white/20" : "bg-gray-100 text-gray-700"}`}>
                          {ev.hora} {ev.titulo}
                        </div>
                      ))}
                      {evsDia.length > 2 && (
                        <div className={`text-[11px] font-semibold ${isSel ? "text-white" : "text-gray-500"}`}>
                          +{evsDia.length - 2} eventos
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filtroPeriodo === "ano" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.from({ length: 12 }).map((_, indiceMes) => {
                  const totalMes = eventos.filter(e => e.data.startsWith(`${anoAtual}-${pad(indiceMes + 1)}-`)).length;
                  const isMesAtual = indiceMes === mesAtual;
                  return (
                    <button
                      key={indiceMes}
                      type="button"
                      onClick={() => {
                        setMesAtual(indiceMes);
                        setDiaSel(`${anoAtual}-${pad(indiceMes + 1)}-01`);
                        setFiltroPeriodo("mes");
                      }}
                      className={`rounded-lg border p-3 text-left transition-colors ${isMesAtual ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                    >
                      <div className="text-sm font-semibold text-gray-800">{nomeMeses[indiceMes]}</div>
                      <div className="text-xs text-gray-500 mt-1">{totalMes} evento(s)</div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Painel lateral */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {diaSelecionado ? formatarData(diaSelecionado) : "Selecione um dia"}
                </CardTitle>
                <button onClick={abrirNovo} className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Adicionar evento"><Plus className="w-4 h-4" /></button>
              </div>
            </CardHeader>
            <CardContent>
              {eventosSelecionados.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum evento neste dia.</p>
              ) : (
                <div className="space-y-2">
                  {eventosSelecionados.map(ev => {
                    const cfg = tipoConfig[ev.tipo];
                    return (
                      <div key={ev.id} className={`rounded-lg p-3 ${cfg.bg} flex items-start justify-between gap-2`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                            <span className={`text-xs font-semibold ${cfg.cor}`}>{ev.tipo}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 truncate">{ev.titulo}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" />{ev.hora}</span>
                            {ev.cliente && <span className="flex items-center gap-1 text-xs text-gray-500"><User className="w-3 h-3" />{ev.cliente}</span>}
                            {ev.agente && <span className="flex items-center gap-1 text-xs text-gray-500"><User className="w-3 h-3" />{ev.agente}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => abrirEditar(ev)} className="p-1 rounded hover:bg-white/60 text-gray-500 hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => excluir(ev.id)} className="p-1 rounded hover:bg-white/60 text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Eventos do Período</CardTitle>
              <p className="text-xs text-gray-500 mt-1">{tituloPeriodo}</p>
            </CardHeader>
            <CardContent>
              {eventosDoPeriodo.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sem eventos no período selecionado.</p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {eventosDoPeriodo.map(ev => {
                    const cfg = tipoConfig[ev.tipo];
                    return (
                      <div key={ev.id} onClick={() => setDiaSel(ev.data)} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{ev.titulo}</p>
                          <p className="text-xs text-gray-400">{formatarData(ev.data)} • {ev.hora}</p>
                        </div>
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${cfg.bg} ${cfg.cor} border-0`}>{ev.tipo}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Próximos Eventos</CardTitle></CardHeader>
            <CardContent>
              {proximosEventos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sem próximos eventos.</p>
              ) : (
                <div className="space-y-2">
                  {proximosEventos.map(ev => {
                    const cfg = tipoConfig[ev.tipo];
                    return (
                      <div key={ev.id} onClick={() => setDiaSel(ev.data)} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{ev.titulo}</p>
                          <p className="text-xs text-gray-400">{formatarData(ev.data)} • {ev.hora}</p>
                        </div>
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${cfg.bg} ${cfg.cor} border-0`}>{ev.tipo}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">{editandoId !== null ? "Editar Evento" : "Novo Evento"}</h3>
              <button onClick={fechar} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input id="titulo" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título do evento" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <textarea id="descricao" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Detalhes do evento..." rows={2} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="data">Data</Label><Input id="data" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="mt-1" /></div>
                <div><Label htmlFor="hora">Hora</Label><Input id="hora" type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <select
                    id="cliente"
                    value={form.cliente}
                    onChange={e => setForm({ ...form, cliente: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="">Selecione...</option>
                    {clientes.filter((cliente) => cliente.status === "Ativo").map((cliente) => (
                      <option key={cliente.id} value={cliente.nome}>{cliente.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="agente">Agente</Label>
                  <select
                    id="agente"
                    value={form.agente}
                    onChange={e => setForm({ ...form, agente: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="">Selecione...</option>
                    {funcionarios.map((funcionario) => (
                      <option key={funcionario.id} value={funcionario.name}>{funcionario.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Tipo</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {allTipos.map(t => {
                    const cfg  = tipoConfig[t];
                    const ativo = form.tipo === t;
                    return (
                      <button key={t} type="button" onClick={() => setForm({ ...form, tipo: t })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${ativo ? `${cfg.bg} ${cfg.cor} border-current` : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />{t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={fechar}>Cancelar</Button>
              <Button onClick={salvar} disabled={salvando || !form.titulo.trim()} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Check className="w-4 h-4" />{editandoId !== null ? "Salvar" : "Criar Evento"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
