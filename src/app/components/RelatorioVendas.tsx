import { useNavigate } from "react-router";
import { ArrowLeft, Download, Filter, TrendingUp } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const vendasPorMes = [
  { mes: "Jan", vendas: 4000, meta: 5000 },
  { mes: "Fev", vendas: 3000, meta: 5000 },
  { mes: "Mar", vendas: 2000, meta: 5000 },
  { mes: "Abr", vendas: 2780, meta: 5000 },
  { mes: "Mai", vendas: 1890, meta: 5000 },
  { mes: "Jun", vendas: 2390, meta: 5000 },
  { mes: "Jul", vendas: 3490, meta: 5000 },
];

const produtosMaisVendidos = [
  { nome: "Produto A", vendas: 8500, valor: "R$ 42.500" },
  { nome: "Produto B", vendas: 6200, valor: "R$ 31.000" },
  { nome: "Produto C", vendas: 4300, valor: "R$ 21.500" },
  { nome: "Produto D", vendas: 3100, valor: "R$ 15.500" },
];

const distribuicaoVendas = [
  { name: "Vendas Diretas", value: 45 },
  { name: "Vendas B2B", value: 30 },
  { name: "Marketplace", value: 25 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function RelatorioVendas() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("ultimos-30");
  const [regiao, setRegiao] = useState("todas");

  const totalVendas = "R$ 145.890";
  const crescimento = "+12.5%";
  const ticketMedio = "R$ 1.250";
  const contagemVendas = "457";

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
            <h1 className="text-xl sm:text-3xl font-bold">Relatório de Vendas</h1>
            <p className="text-xs sm:text-sm text-gray-600">Análise detalhada de vendas do período</p>
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
          <div className="flex-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-2">Período</label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="h-9 sm:h-10 text-sm">
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
          <div className="flex-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-2">Região</label>
            <Select value={regiao} onValueChange={setRegiao}>
              <SelectTrigger className="h-9 sm:h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="norte">Norte</SelectItem>
                <SelectItem value="nordeste">Nordeste</SelectItem>
                <SelectItem value="centro-oeste">Centro-Oeste</SelectItem>
                <SelectItem value="sudeste">Sudeste</SelectItem>
                <SelectItem value="sul">Sul</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="gap-2 text-xs sm:text-sm py-2 h-9 sm:h-10 w-full sm:w-auto">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Mais Filtros</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Total de Vendas</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{totalVendas}</h3>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{crescimento}</span>
            </div>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Quantidade de Vendas</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{contagemVendas}</h3>
            <p className="text-xs sm:text-sm text-gray-600">pedidos realizados</p>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Ticket Médio</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">{ticketMedio}</h3>
            <p className="text-xs sm:text-sm text-gray-600">por transação</p>
          </Card>

          <Card className="p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Taxa de Conversão</p>
            <h3 className="text-lg sm:text-2xl font-bold mb-2">3.2%</h3>
            <p className="text-xs sm:text-sm text-gray-600">do período</p>
        </Card>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Vendas por Mês</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="vendas"
                  stroke="#3b82f6"
                  name="Vendas Realizadas"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="meta"
                  stroke="#10b981"
                  name="Meta"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Distribuição de Vendas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distribuicaoVendas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoVendas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Produtos Mais Vendidos</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={produtosMaisVendidos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="vendas" fill="#3b82f6" name="Quantidade Vendida" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-4">Ranking de Produtos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Produto</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Qtd</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 hidden sm:table-cell">Valor Total</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">%</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosMaisVendidos.map((produto, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{produto.nome}</td>
                      <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{produto.vendas.toLocaleString()}</td>
                      <td className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold hidden sm:table-cell">{produto.valor}</td>
                      <td className="text-right py-2 sm:py-3 px-2 sm:px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {Math.round((produto.vendas / 22100) * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </Card>
      </div>
      </div>
    </div>
  );
}
