import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Users,
  UserPlus,
  DollarSign,
  UserX,
  ClipboardList,
  Plane,
  PhoneOff,
  CheckCircle2,
} from "lucide-react";
import { listarLeads, type Lead } from "../data/leadsApi";
import { listarLancamentosFinanceiros, type LancamentoFinanceiro } from "../data/financeiroApi";
import { listarEventos, type Evento } from "../data/eventosApi";

const periodFilters = ["Mês", "3m", "6m", "12m", "Tudo"];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MESES_LABEL = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type CardKey =
  | "totalLeads"
  | "leadsPeriodo"
  | "fechamentos"
  | "churnInativos"
  | "receitaRoteiros"
  | "viagensAndamento"
  | "semFollowUp"
  | "viagensFinalizadas";

type BarPoint = { name: string; value: number };
type PiePoint = { name: string; value: number };

interface CardChartConfig {
  key: CardKey;
  title: string;
  value: string;
  icon: JSX.Element;
  barTitle: string;
  pieTitle: string;
  barData: BarPoint[];
  barName: string;
  pieData: PiePoint[];
}

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function resolverDataInicialPorFiltro(activeFilter: string, hoje: Date) {
  const dataBase = new Date(hoje);

  if (activeFilter === "Mês") {
    dataBase.setDate(1);
    dataBase.setHours(0, 0, 0, 0);
    return dataBase;
  }

  if (activeFilter === "3m") {
    dataBase.setMonth(dataBase.getMonth() - 2);
  } else if (activeFilter === "6m") {
    dataBase.setMonth(dataBase.getMonth() - 5);
  } else if (activeFilter === "12m") {
    dataBase.setMonth(dataBase.getMonth() - 11);
  } else {
    return null;
  }

  dataBase.setDate(1);
  dataBase.setHours(0, 0, 0, 0);
  return dataBase;
}

function montarSerieMeses(startDate: Date, endDate: Date, leads: Lead[]) {
  const months: { key: string; name: string; leads: number }[] = [];
  const map = new Map<string, number>();

  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const limite = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (cursor <= limite) {
    const ano = cursor.getFullYear();
    const mes = cursor.getMonth();
    const key = `${ano}-${String(mes + 1).padStart(2, "0")}`;
    months.push({ key, name: MESES_LABEL[mes], leads: 0 });
    map.set(key, 0);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  leads.forEach((lead) => {
    const date = parseDate(lead.criadoEm);
    if (!date) return;
    if (date < startDate || date > endDate) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) return;
    map.set(key, (map.get(key) || 0) + 1);
  });

  return months.map((month) => ({
    name: month.name,
    leads: map.get(month.key) || 0,
  }));
}

function montarSerieMesesContagem(startDate: Date, endDate: Date, datas: Date[]) {
  const months: { key: string; name: string }[] = [];
  const map = new Map<string, number>();

  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const limite = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (cursor <= limite) {
    const ano = cursor.getFullYear();
    const mes = cursor.getMonth();
    const key = `${ano}-${String(mes + 1).padStart(2, "0")}`;
    months.push({ key, name: MESES_LABEL[mes] });
    map.set(key, 0);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  datas.forEach((date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) return;
    map.set(key, (map.get(key) || 0) + 1);
  });

  return months.map((month) => ({
    name: month.name,
    value: map.get(month.key) || 0,
  }));
}

function montarSerieMesesValor(startDate: Date, endDate: Date, itens: Array<{ data: Date; valor: number }>) {
  const months: { key: string; name: string }[] = [];
  const map = new Map<string, number>();

  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const limite = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (cursor <= limite) {
    const ano = cursor.getFullYear();
    const mes = cursor.getMonth();
    const key = `${ano}-${String(mes + 1).padStart(2, "0")}`;
    months.push({ key, name: MESES_LABEL[mes] });
    map.set(key, 0);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  itens.forEach((item) => {
    const key = `${item.data.getFullYear()}-${String(item.data.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) return;
    map.set(key, (map.get(key) || 0) + item.valor);
  });

  return months.map((month) => ({
    name: month.name,
    value: map.get(month.key) || 0,
  }));
}

export default function LeadDashboard() {
  const [activeFilter, setActiveFilter] = useState("Mês");
  const [activeCard, setActiveCard] = useState<CardKey>("totalLeads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDashboard() {
      setError(null);
      try {
        const [listaLeads, listaLancamentos, listaEventos] = await Promise.all([
          listarLeads(),
          listarLancamentosFinanceiros(),
          listarEventos(),
        ]);

        setLeads(listaLeads);
        setLancamentos(listaLancamentos);
        setEventos(listaEventos);
      } catch (erroCarregamento) {
        setError(erroCarregamento instanceof Error ? erroCarregamento.message : "Erro ao carregar dados da visão geral.");
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  const dadosDashboard = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const inicioFiltro = resolverDataInicialPorFiltro(activeFilter, hoje);

    const leadsNoPeriodo = leads.filter((lead) => {
      const dataLead = parseDate(lead.criadoEm);
      if (!dataLead) return false;
      if (!inicioFiltro) return true;
      return dataLead >= inicioFiltro && dataLead <= hoje;
    });

    const inicioGrafico = inicioFiltro || (() => {
      if (!leads.length) {
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      }

      const datasValidas = leads
        .map((lead) => parseDate(lead.criadoEm))
        .filter((data): data is Date => data !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      if (!datasValidas.length) {
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      }

      const menorData = datasValidas[0];
      return new Date(menorData.getFullYear(), menorData.getMonth(), 1);
    })();

    const leadsPorPeriodoData = montarSerieMeses(inicioGrafico, hoje, leads);

    const leadsValidos = leads
      .map((lead) => ({
        ...lead,
        criadoDate: parseDate(lead.criadoEm),
      }))
      .filter((lead): lead is Lead & { criadoDate: Date } => lead.criadoDate !== null);

    const lancamentosValidos = lancamentos
      .map((item) => ({
        ...item,
        dataDate: parseDate(item.data),
      }))
      .filter((item): item is LancamentoFinanceiro & { dataDate: Date } => item.dataDate !== null);

    const eventosValidos = eventos
      .map((evento) => ({
        ...evento,
        dataDate: parseDate(evento.data),
      }))
      .filter((evento): evento is Evento & { dataDate: Date } => evento.dataDate !== null);

    const statusLeadsMap = new Map<string, number>();
    leads.forEach((lead) => {
      statusLeadsMap.set(lead.status, (statusLeadsMap.get(lead.status) || 0) + 1);
    });

    const statusLeadsData = Array.from(statusLeadsMap.entries()).map(([name, value]) => ({ name, value }));

    const fechamentos = leads.filter((lead) => lead.status === "Vendido").length;
    const churnInativos = leads.filter((lead) => lead.status === "Perdido").length;
    const semFollowUp = leads.filter((lead) => lead.status === "Novo").length;

    const receitaRoteiros = lancamentos
      .filter((item) => item.tipo === "receita" && !item.oculto)
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const viagens = eventos.filter((evento) => evento.tipo === "Viagem");
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);
    const viagensEmAndamento = viagens.filter((evento) => {
      const dataEvento = parseDate(evento.data);
      return !!dataEvento && dataEvento >= hojeInicio;
    }).length;
    const viagensFinalizadas = viagens.length - viagensEmAndamento;

    const statusNoPeriodoMap = new Map<string, number>();
    leadsNoPeriodo.forEach((lead) => {
      statusNoPeriodoMap.set(lead.status, (statusNoPeriodoMap.get(lead.status) || 0) + 1);
    });

    const fechamentosLeads = leadsValidos.filter((lead) => lead.status === "Vendido");
    const churnLeads = leadsValidos.filter((lead) => lead.status === "Perdido");
    const followUpPendenteLeads = leadsValidos.filter((lead) => lead.status === "Novo");

    const receitasVisiveis = lancamentosValidos.filter((item) => item.tipo === "receita" && !item.oculto);
    const despesasVisiveis = lancamentosValidos.filter((item) => item.tipo === "despesa" && !item.oculto);

    const viagensEventos = eventosValidos.filter((evento) => evento.tipo === "Viagem");
    const viagensFuturas = viagensEventos.filter((evento) => evento.dataDate >= hojeInicio);
    const viagensPassadas = viagensEventos.filter((evento) => evento.dataDate < hojeInicio);

    const chartByCard: Record<CardKey, Omit<CardChartConfig, "key" | "title" | "value" | "icon">> = {
      totalLeads: {
        barTitle: "Leads por Período",
        pieTitle: "Status dos Leads",
        barData: leadsPorPeriodoData.map((item) => ({ name: item.name, value: item.leads })),
        barName: "Leads",
        pieData: statusLeadsData,
      },
      leadsPeriodo: {
        barTitle: "Leads no Filtro por Mês",
        pieTitle: "Status no Período Selecionado",
        barData: montarSerieMesesContagem(
          inicioFiltro || inicioGrafico,
          hoje,
          leadsNoPeriodo
            .map((lead) => parseDate(lead.criadoEm))
            .filter((data): data is Date => data !== null)
        ),
        barName: "Leads no período",
        pieData: Array.from(statusNoPeriodoMap.entries()).map(([name, value]) => ({ name, value })),
      },
      fechamentos: {
        barTitle: "Fechamentos por Mês",
        pieTitle: "Fechamentos por Atendente",
        barData: montarSerieMesesContagem(
          inicioGrafico,
          hoje,
          fechamentosLeads.map((lead) => lead.criadoDate)
        ),
        barName: "Fechamentos",
        pieData: (() => {
          const map = new Map<string, number>();
          fechamentosLeads.forEach((lead) => {
            const nome = lead.atendente || "Sem atendente";
            map.set(nome, (map.get(nome) || 0) + 1);
          });
          return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
        })(),
      },
      churnInativos: {
        barTitle: "Churn por Mês",
        pieTitle: "Churn por Atendente",
        barData: montarSerieMesesContagem(
          inicioGrafico,
          hoje,
          churnLeads.map((lead) => lead.criadoDate)
        ),
        barName: "Churn",
        pieData: (() => {
          const map = new Map<string, number>();
          churnLeads.forEach((lead) => {
            const nome = lead.atendente || "Sem atendente";
            map.set(nome, (map.get(nome) || 0) + 1);
          });
          return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
        })(),
      },
      receitaRoteiros: {
        barTitle: "Receita de Roteiros por Mês",
        pieTitle: "Composição Financeira",
        barData: montarSerieMesesValor(
          inicioGrafico,
          hoje,
          receitasVisiveis.map((item) => ({ data: item.dataDate, valor: Number(item.valor || 0) }))
        ),
        barName: "Receita (R$)",
        pieData: [
          {
            name: "Receitas",
            value: receitasVisiveis.reduce((acc, item) => acc + Number(item.valor || 0), 0),
          },
          {
            name: "Despesas",
            value: despesasVisiveis.reduce((acc, item) => acc + Number(item.valor || 0), 0),
          },
        ],
      },
      viagensAndamento: {
        barTitle: "Viagens em Andamento por Mês",
        pieTitle: "Situação das Viagens",
        barData: montarSerieMesesContagem(
          inicioGrafico,
          hoje,
          viagensFuturas.map((evento) => evento.dataDate)
        ),
        barName: "Em andamento",
        pieData: [
          { name: "Em andamento", value: viagensFuturas.length },
          { name: "Finalizadas", value: viagensPassadas.length },
        ],
      },
      semFollowUp: {
        barTitle: "Leads Sem Follow-up por Mês",
        pieTitle: "Follow-up dos Leads",
        barData: montarSerieMesesContagem(
          inicioGrafico,
          hoje,
          followUpPendenteLeads.map((lead) => lead.criadoDate)
        ),
        barName: "Sem follow-up",
        pieData: [
          { name: "Sem follow-up", value: followUpPendenteLeads.length },
          { name: "Com follow-up", value: Math.max(leads.length - followUpPendenteLeads.length, 0) },
        ],
      },
      viagensFinalizadas: {
        barTitle: "Viagens Finalizadas por Mês",
        pieTitle: "Situação das Viagens",
        barData: montarSerieMesesContagem(
          inicioGrafico,
          hoje,
          viagensPassadas.map((evento) => evento.dataDate)
        ),
        barName: "Finalizadas",
        pieData: [
          { name: "Finalizadas", value: viagensPassadas.length },
          { name: "Em andamento", value: viagensFuturas.length },
        ],
      },
    };

    return {
      cardData: [
        { key: "totalLeads" as const, title: "Total de Leads", value: String(leads.length), icon: <Users className="h-4 w-4 text-blue-500" /> },
        { key: "leadsPeriodo" as const, title: "Lead no Período", value: String(leadsNoPeriodo.length), icon: <UserPlus className="h-4 w-4 text-green-500" /> },
        { key: "fechamentos" as const, title: "Fechamentos", value: String(fechamentos), icon: <DollarSign className="h-4 w-4 text-emerald-500" /> },
        { key: "churnInativos" as const, title: "Churn Inativos", value: String(churnInativos), icon: <UserX className="h-4 w-4 text-red-500" /> },
        { key: "receitaRoteiros" as const, title: "Receita Roteiros", value: formatarMoeda(receitaRoteiros), icon: <ClipboardList className="h-4 w-4 text-purple-500" /> },
        { key: "viagensAndamento" as const, title: "Viagens em Andamento", value: String(viagensEmAndamento), icon: <Plane className="h-4 w-4 text-sky-500" /> },
        { key: "semFollowUp" as const, title: "Sem Follow-up", value: String(semFollowUp), icon: <PhoneOff className="h-4 w-4 text-orange-500" /> },
        { key: "viagensFinalizadas" as const, title: "Viagens Finalizadas", value: String(viagensFinalizadas), icon: <CheckCircle2 className="h-4 w-4 text-teal-500" /> },
      ],
      chartByCard,
    };
  }, [activeFilter, leads, lancamentos, eventos]);

  const activeChart = useMemo(() => {
    return dadosDashboard.chartByCard[activeCard];
  }, [dadosDashboard.chartByCard, activeCard]);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
        <div className="flex items-center space-x-2">
          {periodFilters.map((filter) => (
            <Button 
              key={filter} 
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dadosDashboard.cardData.map((card) => (
          <Card
            key={card.title}
            className={`cursor-pointer transition-all ${activeCard === card.key ? "ring-2 ring-blue-500 bg-blue-50/50" : "hover:shadow-md"}`}
            onClick={() => setActiveCard(card.key)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Seção de Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{activeChart.barTitle}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={activeChart.barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name={activeChart.barName} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{activeChart.pieTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={activeChart.pieData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {activeChart.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}