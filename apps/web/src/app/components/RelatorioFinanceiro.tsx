import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { exportPDF } from "../utils/pdfExport";
import { listarLancamentosFinanceiros, type LancamentoFinanceiro } from "../data/financeiroApi";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function mesKey(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export default function RelatorioFinanceiro() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("ultimos-90");
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setErro(null);
      try {
        const lista = await listarLancamentosFinanceiros();
        if (ativo) {
          setLancamentos(lista);
        }
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar relatório financeiro.");
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

    const visiveis = lancamentos.filter((item) => !item.oculto);
    const periodoAtual = visiveis.filter((item) => {
      const data = parseData(item.data);
      return data ? data >= inicio : false;
    });

    const receitas = periodoAtual
      .filter((item) => item.tipo === "receita")
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const despesas = periodoAtual
      .filter((item) => item.tipo === "despesa")
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const lucro = receitas - despesas;
    const margem = receitas > 0 ? (lucro / receitas) * 100 : 0;

    const fluxoMap = new Map<string, { mes: string; receita: number; despesa: number; lucro: number }>();
    periodoAtual.forEach((item) => {
      const data = parseData(item.data);
      if (!data) return;

      const chave = mesKey(data);
      const atual = fluxoMap.get(chave) || {
        mes: data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        receita: 0,
        despesa: 0,
        lucro: 0,
      };

      if (item.tipo === "receita") {
        atual.receita += Number(item.valor || 0);
      } else {
        atual.despesa += Number(item.valor || 0);
      }
      atual.lucro = atual.receita - atual.despesa;
      fluxoMap.set(chave, atual);
    });

    const fluxoCaixa = Array.from(fluxoMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);

    const despesasCategoriaMap = new Map<string, number>();
    periodoAtual
      .filter((item) => item.tipo === "despesa")
      .forEach((item) => {
        const categoria = item.descricao?.trim() || "Sem descrição";
        despesasCategoriaMap.set(categoria, (despesasCategoriaMap.get(categoria) || 0) + Number(item.valor || 0));
      });

    const despesasPorCategoria = Array.from(despesasCategoriaMap.entries())
      .map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: despesas > 0 ? (valor / despesas) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);

    const receitasFonteMap = new Map<string, number>();
    periodoAtual
      .filter((item) => item.tipo === "receita")
      .forEach((item) => {
        const fonte = item.orcamentoId ? "Orçamento" : "Avulso";
        receitasFonteMap.set(fonte, (receitasFonteMap.get(fonte) || 0) + Number(item.valor || 0));
      });

    const receitasPorFonte = Array.from(receitasFonteMap.entries())
      .map(([fonte, valor]) => ({
        fonte,
        valor,
        percentual: receitas > 0 ? (valor / receitas) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor);

    const hoje = new Date();
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

    const mesAtual = visiveis.filter((item) => {
      const data = parseData(item.data);
      return data ? data >= inicioMesAtual : false;
    });

    const mesAnterior = visiveis.filter((item) => {
      const data = parseData(item.data);
      return data ? data >= inicioMesAnterior && data <= fimMesAnterior : false;
    });

    const receitaAtual = mesAtual.filter((item) => item.tipo === "receita").reduce((acc, item) => acc + item.valor, 0);
    const despesaAtual = mesAtual.filter((item) => item.tipo === "despesa").reduce((acc, item) => acc + item.valor, 0);
    const lucroAtual = receitaAtual - despesaAtual;

    const receitaAnterior = mesAnterior.filter((item) => item.tipo === "receita").reduce((acc, item) => acc + item.valor, 0);
    const despesaAnterior = mesAnterior.filter((item) => item.tipo === "despesa").reduce((acc, item) => acc + item.valor, 0);
    const lucroAnterior = receitaAnterior - despesaAnterior;

    return {
      receitas,
      despesas,
      lucro,
      margem,
      fluxoCaixa,
      despesasPorCategoria,
      receitasPorFonte,
      comparativo: {
        receitaAtual,
        receitaAnterior,
        despesaAtual,
        despesaAnterior,
        lucroAtual,
        lucroAnterior,
      },
    };
  }, [lancamentos, periodo]);

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
            <h1 className="text-2xl sm:text-3xl font-bold">Relatório Financeiro</h1>
            <p className="text-xs sm:text-sm text-gray-600">Receitas e despesas reais registradas na tabela financeira</p>
          </div>
        </div>
        <Button
          className="gap-2 text-sm sm:text-base py-2 h-9 sm:h-10 w-full sm:w-auto"
          onClick={() => exportPDF("relatorio-financeiro-container", "Relatorio-Financeiro.pdf")}
        >
          <Download className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      <div id="relatorio-financeiro-container">
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
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Total de Receitas</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{formatarMoeda(dados.receitas)}</h3>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs sm:text-sm">entrada no período</span>
            </div>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Total de Despesas</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{formatarMoeda(dados.despesas)}</h3>
            <div className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs sm:text-sm">saída no período</span>
            </div>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Lucro Líquido</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{formatarMoeda(dados.lucro)}</h3>
            <p className="text-xs sm:text-sm text-gray-600">receitas - despesas</p>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Margem</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{dados.margem.toFixed(1)}%</h3>
            <p className="text-xs sm:text-sm text-gray-600">sobre as receitas</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Fluxo de Caixa</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dados.fluxoCaixa}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#d1fae5" name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke="#ef4444" fill="#fee2e2" name="Despesa" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Lucro por Mês</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dados.fluxoCaixa}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Despesas por Categoria</h3>
            <div className="space-y-3">
              {dados.despesasPorCategoria.map((item) => (
                <div key={item.categoria}>
                  <div className="flex justify-between items-center mb-1 text-xs sm:text-sm">
                    <span className="text-gray-700">{item.categoria}</span>
                    <span className="font-semibold">{formatarMoeda(item.valor)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${item.percentual.toFixed(1)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Receitas por Fonte</h3>
            <div className="space-y-3">
              {dados.receitasPorFonte.map((item) => (
                <div key={item.fonte}>
                  <div className="flex justify-between items-center mb-1 text-xs sm:text-sm">
                    <span className="text-gray-700">{item.fonte}</span>
                    <span className="font-semibold">{formatarMoeda(item.valor)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${item.percentual.toFixed(1)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-3 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-lg mb-4">Comparativo Mensal</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Item</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Mês Atual</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Mês Anterior</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4">Receita</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{formatarMoeda(dados.comparativo.receitaAtual)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{formatarMoeda(dados.comparativo.receitaAnterior)}</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4">Despesa</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{formatarMoeda(dados.comparativo.despesaAtual)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{formatarMoeda(dados.comparativo.despesaAnterior)}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold">Lucro</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold">{formatarMoeda(dados.comparativo.lucroAtual)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold">{formatarMoeda(dados.comparativo.lucroAnterior)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {carregando && <p className="text-sm text-gray-500 mt-4">Carregando dados...</p>}
    </div>
  );
}
