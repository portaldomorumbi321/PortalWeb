import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Download, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { exportPDF } from "../utils/pdfExport";
import { listarLancamentosFinanceiros, type LancamentoFinanceiro } from "../data/financeiroApi";
import { listarOrcamentos, type Orcamento } from "../data/orcamentosApi";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

type PeriodoFiltro = "ultimos-30" | "ultimos-90" | "ultimo-ano";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function parseData(data: string) {
  if (!data) return null;
  const parsed = new Date(`${data}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function inicioPeriodo(periodo: PeriodoFiltro) {
  const hoje = new Date();
  const inicio = new Date(hoje);

  if (periodo === "ultimos-30") {
    inicio.setDate(hoje.getDate() - 30);
  } else if (periodo === "ultimos-90") {
    inicio.setDate(hoje.getDate() - 90);
  } else {
    inicio.setFullYear(hoje.getFullYear() - 1);
  }

  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

function calcularValorOrcamento(orcamento: Orcamento) {
  const totalItens = (orcamento.itens || []).reduce((acc, item) => {
    const subtotal = Number(item.quantidade || 0) * Number(item.valorUnitario || 0);
    const desconto = subtotal * (Number(item.desconto || 0) / 100);
    return acc + (subtotal - desconto);
  }, 0);

  const totalHospedagem = (orcamento.hospedagem || []).reduce((acc, item: any) => acc + (Number(item?.preco) || 0), 0);
  const totalTransporte = (orcamento.transporte || []).reduce((acc, item: any) => acc + (Number(item?.valor) || 0), 0);
  const totalRestaurante = (orcamento.restaurante || []).reduce((acc, item: any) => acc + (Number(item?.preco) || 0), 0);
  const totalExperiencias = (orcamento.experiencias || []).reduce((acc, item: any) => acc + (Number(item?.preco) || 0), 0);
  const totalSeguro = (orcamento.seguro || []).reduce((acc, item: any) => acc + (Number(item?.valor) || 0), 0);

  return totalItens + totalHospedagem + totalTransporte + totalRestaurante + totalExperiencias + totalSeguro;
}

export default function RelatorioVendas() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("ultimos-90");
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setErro(null);
      try {
        const [listaLancamentos, listaOrcamentos] = await Promise.all([listarLancamentosFinanceiros(), listarOrcamentos()]);
        if (ativo) {
          setLancamentos(listaLancamentos);
          setOrcamentos(listaOrcamentos);
        }
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar relatório de vendas.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const dados = useMemo(() => {
    const inicio = inicioPeriodo(periodo);

    const receitasPeriodo = lancamentos.filter((item) => {
      if (item.tipo !== "receita" || item.oculto) return false;
      const data = parseData(item.data);
      return data ? data >= inicio : false;
    });

    const totalReceita = receitasPeriodo.reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const orcamentosPeriodo = orcamentos.filter((item) => {
      const data = parseData(item.dataCriacao);
      return data ? data >= inicio : false;
    });

    const orcamentosAprovados = orcamentosPeriodo.filter((item) => item.status === "Aprovado");
    const valorAprovado = orcamentosAprovados.reduce((acc, item) => acc + calcularValorOrcamento(item), 0);
    const ticketMedio = receitasPeriodo.length ? totalReceita / receitasPeriodo.length : 0;

    const receitasPorMesMap = new Map<string, { mes: string; valor: number }>();
    receitasPeriodo.forEach((item) => {
      const data = parseData(item.data);
      if (!data) return;
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      const atual = receitasPorMesMap.get(chave) || {
        mes: data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        valor: 0,
      };
      atual.valor += Number(item.valor || 0);
      receitasPorMesMap.set(chave, atual);
    });

    const receitasPorMes = Array.from(receitasPorMesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);

    const distribuicaoStatus = ["Rascunho", "Enviado", "Aprovado", "Rejeitado", "Cancelado"]
      .map((status) => ({
        name: status,
        value: orcamentosPeriodo.filter((item) => item.status === status).length,
      }))
      .filter((item) => item.value > 0);

    const rankingClientesMap = new Map<string, { cliente: string; quantidade: number; valor: number }>();
    orcamentosAprovados.forEach((item) => {
      const atual = rankingClientesMap.get(item.cliente) || { cliente: item.cliente, quantidade: 0, valor: 0 };
      atual.quantidade += 1;
      atual.valor += calcularValorOrcamento(item);
      rankingClientesMap.set(item.cliente, atual);
    });

    const rankingClientes = Array.from(rankingClientesMap.values())
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);

    return {
      totalReceita,
      quantidadeVendas: receitasPeriodo.length,
      ticketMedio,
      orcamentosAprovados: orcamentosAprovados.length,
      valorAprovado,
      receitasPorMes,
      distribuicaoStatus,
      rankingClientes,
    };
  }, [lancamentos, orcamentos, periodo]);

  return (
    <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/relatorios")}
            className="h-9 sm:h-10 w-9 sm:w-10 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Relatório de Vendas</h1>
            <p className="text-xs sm:text-sm text-gray-600">Dados reais de receitas e orçamentos aprovados</p>
          </div>
        </div>
        <Button
          className="gap-2 text-sm sm:text-base py-2 h-9 sm:h-10 w-full sm:w-auto"
          onClick={() => exportPDF("relatorio-vendas-container", "Relatorio-Vendas.pdf")}
        >
          <Download className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      <div id="relatorio-vendas-container">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1 sm:max-w-xs">
            <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-2">Período</label>
            <Select value={periodo} onValueChange={(value) => setPeriodo(value as PeriodoFiltro)}>
              <SelectTrigger className="h-9 sm:h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ultimos-30">Últimos 30 dias</SelectItem>
                <SelectItem value="ultimos-90">Últimos 90 dias</SelectItem>
                <SelectItem value="ultimo-ano">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {erro && (
          <Card className="p-4 mb-4 sm:mb-6 border-red-200 bg-red-50 text-red-700 text-sm">
            {erro}
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Receita Realizada</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{formatarMoeda(dados.totalReceita)}</h3>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">receitas registradas</span>
            </div>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Quantidade de Vendas</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{dados.quantidadeVendas}</h3>
            <p className="text-xs sm:text-sm text-gray-600">lançamentos de receita</p>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Ticket Médio</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{formatarMoeda(dados.ticketMedio)}</h3>
            <p className="text-xs sm:text-sm text-gray-600">por venda realizada</p>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Valor de Aprovados</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{formatarMoeda(dados.valorAprovado)}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{dados.orcamentosAprovados} orçamento(s) aprovado(s)</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Receita por Mês</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dados.receitasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                <Bar dataKey="valor" fill="#3b82f6" name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Status dos Orçamentos</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={dados.distribuicaoStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {dados.distribuicaoStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-3 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-lg mb-4">Ranking de Clientes Aprovados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Cliente</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Qtd</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Valor</th>
                </tr>
              </thead>
              <tbody>
                {dados.rankingClientes.map((cliente) => (
                  <tr key={cliente.cliente} className="border-b hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4">{cliente.cliente}</td>
                    <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{cliente.quantidade}</td>
                    <td className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold">{formatarMoeda(cliente.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {carregando && <p className="text-sm text-gray-500 mt-4">Carregando dados...</p>}
    </div>
  );
}
