import { useNavigate } from "react-router";
import { ArrowLeft, Download, Filter, Users, TrendingUp, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { exportPDF } from "../utils/pdfExport";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const clientesPorSegmento = [
  { segmento: "Premium", quantidade: 45, vendas: 125000 },
  { segmento: "Gold", quantidade: 120, vendas: 95000 },
  { segmento: "Silver", quantidade: 280, vendas: 62000 },
  { segmento: "Bronze", quantidade: 450, vendas: 35000 },
];

const segmentacaoClientes = [
  { name: "Premium", value: 45, percentual: 5 },
  { name: "Gold", value: 120, percentual: 13 },
  { name: "Silver", value: 280, percentual: 31 },
  { name: "Bronze", value: 450, percentual: 51 },
];

const clientesPorRegiao = [
  { regiao: "Sudeste", quantidade: 350, valor: 185000 },
  { regiao: "Sul", quantidade: 220, valor: 98000 },
  { regiao: "Nordeste", quantidade: 180, valor: 72000 },
  { regiao: "Norte", quantidade: 95, valor: 38000 },
  { regiao: "Centro-Oeste", quantidade: 50, valor: 24000 },
];

const topClientesValor = [
  { id: 1, nome: "Empresa ABC", valor: 45000, pedidos: 24, status: "Ativo" },
  { id: 2, nome: "Empresa XYZ", valor: 38000, pedidos: 19, status: "Ativo" },
  { id: 3, nome: "Empresa DEF", valor: 32000, pedidos: 16, status: "Ativo" },
  { id: 4, nome: "Empresa GHI", valor: 28000, pedidos: 14, status: "Inativo" },
  { id: 5, nome: "Empresa JKL", valor: 25000, pedidos: 12, status: "Ativo" },
];

const clientesNovos = [
  { mes: "Jan", novos: 12, ativos: 895, inativos: 105 },
  { mes: "Fev", novos: 18, ativos: 913, inativos: 98 },
  { mes: "Mar", novos: 24, ativos: 937, inativos: 85 },
  { mes: "Abr", novos: 19, ativos: 956, inativos: 78 },
  { mes: "Mai", novos: 31, ativos: 987, inativos: 72 },
  { mes: "Jun", novos: 28, ativos: 1015, inativos: 68 },
  { mes: "Jul", novos: 35, ativos: 1050, inativos: 65 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function RelatorioClientes() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("ultimos-30");
  const [regiao, setRegiao] = useState("todas");

  const totalClientes = "895";
  const clientesAtivos = "1.050";
  const novosMes = "35";
  const taxaRetencao = "92%";

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
            <h1 className="text-3xl font-bold">Relatório de Clientes</h1>
            <p className="text-gray-600">Análise da carteira e comportamento de clientes</p>
          </div>
        </div>
        <Button
          className="gap-2"
          onClick={() => exportPDF("relatorio-clientes-container", "Relatorio-Clientes.pdf")}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div id="relatorio-clientes-container">
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
          <label className="text-sm font-medium text-gray-700 block mb-2">Região</label>
          <Select value={regiao} onValueChange={setRegiao}>
            <SelectTrigger>
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
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Mais Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total de Clientes</p>
              <h3 className="text-2xl font-bold">{clientesAtivos}</h3>
            </div>
            <Users className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
          <p className="text-sm text-gray-600 mt-2">ativos e cadastrados</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Novos Clientes</p>
              <h3 className="text-2xl font-bold">{novosMes}</h3>
            </div>
            <UserCheck className="h-8 w-8 text-green-600 opacity-20" />
          </div>
          <p className="text-sm text-green-600 mt-2">este mês</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Taxa de Retenção</p>
          <h3 className="text-2xl font-bold">{taxaRetencao}</h3>
          <div className="flex items-center gap-2 text-green-600 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+2.3%</span>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Ticket Médio</p>
          <h3 className="text-2xl font-bold">R$ 8.500</h3>
          <p className="text-sm text-gray-600 mt-2">por cliente/ano</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Segmentação de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentacaoClientes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {segmentacaoClientes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Clientes por Região</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientesPorRegiao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="regiao" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#3b82f6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Evolução de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientesNovos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="novos" fill="#10b981" name="Novos Clientes" />
              <Bar dataKey="ativos" fill="#3b82f6" name="Clientes Ativos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Top 5 Clientes por Valor</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Pedidos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {topClientesValor.map((cliente, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{cliente.nome}</td>
                    <td className="text-right py-3 px-4 font-semibold">
                      R$ {cliente.valor.toLocaleString("pt-BR")}
                    </td>
                    <td className="text-right py-3 px-4">{cliente.pedidos}</td>
                    <td className="text-right py-3 px-4">
                      <Badge
                        variant={cliente.status === "Ativo" ? "default" : "secondary"}
                        className={
                          cliente.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {cliente.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Análise por Segmento</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Segmento</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantidade</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">% do Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                {clientesPorSegmento.map((seg, idx) => {
                  const ticketMedio = Math.round(seg.vendas / seg.quantidade);
                  const totalVendas = clientesPorSegmento.reduce((acc, s) => acc + s.vendas, 0);
                  const percentual = Math.round((seg.vendas / totalVendas) * 100);

                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{seg.segmento}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="outline">{seg.quantidade}</Badge>
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">
                        R$ {seg.vendas.toLocaleString("pt-BR")}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {percentual}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        R$ {ticketMedio.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
}
