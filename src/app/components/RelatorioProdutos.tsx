import { useNavigate } from "react-router";
import { ArrowLeft, Download, Filter, Package, TrendingUp, AlertCircle, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { exportPDF } from "../utils/pdfExport";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

const produtosMaisVendidos = [
  { mes: "Jan", produto1: 1200, produto2: 980, produto3: 750, produto4: 620 },
  { mes: "Fev", produto1: 1400, produto2: 1100, produto3: 820, produto4: 680 },
  { mes: "Mar", produto1: 1600, produto2: 1250, produto3: 900, produto4: 750 },
  { mes: "Abr", produto1: 1800, produto2: 1400, produto3: 1050, produto4: 880 },
  { mes: "Mai", produto1: 2000, produto2: 1550, produto3: 1150, produto4: 950 },
  { mes: "Jun", produto1: 2200, produto2: 1700, produto3: 1300, produto4: 1100 },
  { mes: "Jul", produto1: 2400, produto2: 1850, produto3: 1450, produto4: 1250 },
];

const categoriasProdutos = [
  { categoria: "Eletrônicos", quantidade: 125, valor: 85000, percentual: 35 },
  { categoria: "Vestuário", quantidade: 340, valor: 62000, percentual: 26 },
  { categoria: "Alimentos", quantidade: 280, valor: 48000, percentual: 20 },
  { categoria: "Acessórios", quantidade: 215, valor: 39000, percentual: 16 },
  { categoria: "Outros", quantidade: 40, valor: 16000, percentual: 7 },
];

const estoquePorCategoria = [
  { name: "Em Estoque", value: 680, percentual: 70 },
  { name: "Baixo Estoque", value: 210, percentual: 22 },
  { name: "Fora de Estoque", value: 60, percentual: 6 },
  { name: "Descontinuado", value: 30, percentual: 2 },
];

const topProdutos = [
  {
    id: 1,
    nome: "Produto Premium A",
    categoria: "Eletrônicos",
    vendas: 2400,
    estoque: 150,
    lucro: "R$ 48.000",
    status: "Alto desempenho",
  },
  {
    id: 2,
    nome: "Produto B",
    categoria: "Vestuário",
    vendas: 1850,
    estoque: 320,
    lucro: "R$ 35.700",
    status: "Em crescimento",
  },
  {
    id: 3,
    nome: "Produto Premium C",
    categoria: "Eletrônicos",
    vendas: 1450,
    estoque: 85,
    lucro: "R$ 28.950",
    status: "Alto desempenho",
  },
  {
    id: 4,
    nome: "Produto D",
    categoria: "Alimentos",
    vendas: 1250,
    estoque: 420,
    lucro: "R$ 12.500",
    status: "Estável",
  },
  {
    id: 5,
    nome: "Produto E",
    categoria: "Acessórios",
    vendas: 980,
    estoque: 45,
    lucro: "R$ 9.800",
    status: "Atenção",
  },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function RelatorioProdutos() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("ultimos-30");
  const [categoria, setCategoria] = useState("todas");

  const totalProdutos = "1.000";
  const estoqueMedio = "R$ 425.500";
  const lucroBruto = "R$ 250.000";
  const rotacaoMedia = "12.5x/ano";

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
            <h1 className="text-3xl font-bold">Relatório de Produtos</h1>
            <p className="text-gray-600">Estoque, movimentação e análise de desempenho</p>
          </div>
        </div>
        <Button
          className="gap-2"
          onClick={() => exportPDF("relatorio-produtos-container", "Relatorio-Produtos.pdf")}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div id="relatorio-produtos-container">
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
          <label className="text-sm font-medium text-gray-700 block mb-2">Categoria</label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="eletronicos">Eletrônicos</SelectItem>
              <SelectItem value="vestuario">Vestuário</SelectItem>
              <SelectItem value="alimentos">Alimentos</SelectItem>
              <SelectItem value="acessorios">Acessórios</SelectItem>
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
              <p className="text-sm text-gray-600 mb-2">Total de Produtos</p>
              <h3 className="text-2xl font-bold">{totalProdutos}</h3>
            </div>
            <Package className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
          <p className="text-sm text-gray-600 mt-2">em catálogo</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Valor do Estoque</p>
              <h3 className="text-2xl font-bold">{estoqueMedio}</h3>
            </div>
            <Zap className="h-8 w-8 text-amber-600 opacity-20" />
          </div>
          <p className="text-sm text-amber-600 mt-2">+5.2% vs. mês anterior</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Lucro Bruto</p>
          <h3 className="text-2xl font-bold">{lucroBruto}</h3>
          <div className="flex items-center gap-2 text-green-600 mt-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">+8.7%</span>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Rotação Média</p>
          <h3 className="text-2xl font-bold">{rotacaoMedia}</h3>
          <p className="text-sm text-gray-600 mt-2">velocidade média</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={produtosMaisVendidos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="produto1"
                stroke="#3b82f6"
                name="Produto A"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="produto2"
                stroke="#10b981"
                name="Produto B"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="produto3"
                stroke="#f59e0b"
                name="Produto C"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Status do Estoque</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estoquePorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {estoquePorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Vendas por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoriasProdutos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="quantidade" fill="#3b82f6" name="Quantidade de SKUs" />
              <Bar yAxisId="right" dataKey="valor" fill="#10b981" name="Valor de Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Top 5 Produtos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Produto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Vendas</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Estoque</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Lucro</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {topProdutos.map((produto, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{produto.nome}</td>
                    <td className="py-3 px-4 text-gray-600">{produto.categoria}</td>
                    <td className="text-right py-3 px-4 font-semibold">{produto.vendas.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <Badge variant={produto.estoque > 100 ? "default" : "secondary"}>
                        {produto.estoque} un.
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-green-600">{produto.lucro}</td>
                    <td className="text-right py-3 px-4">
                      <Badge
                        className={
                          produto.status === "Alto desempenho"
                            ? "bg-green-100 text-green-800"
                            : produto.status === "Em crescimento"
                              ? "bg-blue-100 text-blue-800"
                              : produto.status === "Atenção"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }
                      >
                        {produto.status}
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
          <h3 className="font-semibold text-lg mb-4">Análise por Categoria</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">SKUs</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">% do Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Médio/SKU</th>
                </tr>
              </thead>
              <tbody>
                {categoriasProdutos.map((cat, idx) => {
                  const valorMedio = Math.round(cat.valor / cat.quantidade);

                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{cat.categoria}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="outline">{cat.quantidade}</Badge>
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">
                        R$ {cat.valor.toLocaleString("pt-BR")}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {cat.percentual}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        R$ {valorMedio.toLocaleString("pt-BR")}
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
