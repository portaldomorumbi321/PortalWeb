import { useNavigate } from "react-router";
import { ArrowLeft, Download, Filter, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { exportPDF } from "../utils/pdfExport";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const fluxoCaixa = [
  { mes: "Jan", receita: 45000, despesa: 32000, lucro: 13000 },
  { mes: "Fev", receita: 52000, despesa: 38000, lucro: 14000 },
  { mes: "Mar", receita: 48000, despesa: 35000, lucro: 13000 },
  { mes: "Abr", receita: 61000, despesa: 42000, lucro: 19000 },
  { mes: "Mai", receita: 55000, despesa: 39000, lucro: 16000 },
  { mes: "Jun", receita: 67000, despesa: 45000, lucro: 22000 },
  { mes: "Jul", receita: 72000, despesa: 48000, lucro: 24000 },
];

const despesasPorCategoria = [
  { categoria: "Pessoal", valor: 45000, percentual: 35 },
  { categoria: "Operacional", valor: 22000, percentual: 17 },
  { categoria: "Marketing", valor: 18000, percentual: 14 },
  { categoria: "Infraestrutura", valor: 25000, percentual: 19 },
  { categoria: "Outros", valor: 19000, percentual: 15 },
];

const receitasPorFonte = [
  { fonte: "Vendas Diretas", valor: 145000, percentual: 48 },
  { fonte: "Serviços", valor: 95000, percentual: 31 },
  { fonte: "Parcerias", valor: 55000, percentual: 18 },
  { fonte: "Investimentos", valor: 5000, percentual: 3 },
];

export default function RelatorioFinanceiro() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("ultimos-30");
  const [departamento, setDepartamento] = useState("todos");

  const totalReceitas = "R$ 300.000";
  const totalDespesas = "R$ 129.000";
  const lucroLiquido = "R$ 171.000";
  const margemLucro = "57%";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/relatorios")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Relatório Financeiro</h1>
            <p className="text-gray-600">Demonstrativo de receitas, despesas e lucratividade</p>
          </div>
        </div>
        <Button
          className="gap-2"
          onClick={() => exportPDF("relatorio-financeiro-container", "Relatorio-Financeiro.pdf")}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div id="relatorio-financeiro-container">
        <div className="mb-6 flex gap-4">
          <div className="flex-1 max-w-xs">
          <label className="text-sm font-medium text-gray-700 block mb-2">Período</label>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ultimos-7">Últimos 7 dias</SelectItem>
              <SelectItem value="ultimos-30">Últimos 30 dias</SelectItem>
              <SelectItem value="ultimos-90">Últimos 90 dias</SelectItem>
              <SelectItem value="ultimo-ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 max-w-xs">
          <label className="text-sm font-medium text-gray-700 block mb-2">Departamento</label>
          <Select value={departamento} onValueChange={setDepartamento}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="operacoes">Operações</SelectItem>
              <SelectItem value="ti">TI</SelectItem>
              <SelectItem value="rh">RH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Mais Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Total de Receitas</p>
          <h3 className="text-2xl font-bold mb-2">{totalReceitas}</h3>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+8.5%</span>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Total de Despesas</p>
          <h3 className="text-2xl font-bold mb-2">{totalDespesas}</h3>
          <div className="flex items-center gap-2 text-orange-600">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm font-medium">-3.2%</span>
          </div>
        </Card>

        <Card className="p-6 bg-green-50">
          <p className="text-sm text-gray-600 mb-2">Lucro Líquido</p>
          <h3 className="text-2xl font-bold mb-2 text-green-600">{lucroLiquido}</h3>
          <p className="text-sm text-gray-600">período atual</p>
        </Card>

        <Card className="p-6 bg-blue-50">
          <p className="text-sm text-gray-600 mb-2">Margem de Lucro</p>
          <h3 className="text-2xl font-bold mb-2 text-blue-600">{margemLucro}</h3>
          <p className="text-sm text-gray-600">do faturamento</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Fluxo de Caixa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fluxoCaixa}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorReceita)"
                name="Receita"
              />
              <Area
                type="monotone"
                dataKey="despesa"
                stroke="#ef4444"
                fillOpacity={0.3}
                fill="#ef4444"
                name="Despesa"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Lucro por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fluxoCaixa}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Despesas por Categoria</h3>
          <div className="space-y-4">
            {despesasPorCategoria.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.categoria}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentual}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.percentual}% do total</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Receitas por Fonte</h3>
          <div className="space-y-4">
            {receitasPorFonte.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.fonte}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${item.percentual}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.percentual}% do total</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Demonstrativo Financeiro</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Mês Atual</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Mês Anterior</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Variação</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50 bg-green-50">
                <td className="py-3 px-4 font-semibold text-green-900">Receita Total</td>
                <td className="text-right py-3 px-4 font-semibold text-green-700">R$ 300.000</td>
                <td className="text-right py-3 px-4 text-gray-700">R$ 276.000</td>
                <td className="text-right py-3 px-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    +8.7%
                  </span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50 bg-red-50">
                <td className="py-3 px-4 font-semibold text-red-900">Despesa Total</td>
                <td className="text-right py-3 px-4 font-semibold text-red-700">R$ 129.000</td>
                <td className="text-right py-3 px-4 text-gray-700">R$ 125.400</td>
                <td className="text-right py-3 px-4">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    +2.9%
                  </span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50 bg-blue-50">
                <td className="py-3 px-4 font-semibold text-blue-900">Lucro Bruto</td>
                <td className="text-right py-3 px-4 font-semibold text-blue-700">R$ 171.000</td>
                <td className="text-right py-3 px-4 text-gray-700">R$ 150.600</td>
                <td className="text-right py-3 px-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    +13.5%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Margem de Lucro</td>
                <td className="text-right py-3 px-4 font-semibold">57%</td>
                <td className="text-right py-3 px-4">54.6%</td>
                <td className="text-right py-3 px-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    +2.4pp
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}
