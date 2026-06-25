import { FileText, BarChart3, PieChart, FileSpreadsheet } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export default function Relatorios() {
  const reports = [
    {
      icon: BarChart3,
      title: "Relatório de Vendas",
      description: "Análise completa de vendas por período",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: PieChart,
      title: "Relatório Financeiro",
      description: "Demonstrativo de receitas e despesas",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: FileText,
      title: "Relatório de Clientes",
      description: "Listagem e análise de clientes",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: FileSpreadsheet,
      title: "Relatório de Produtos",
      description: "Estoque e movimentação de produtos",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div>
      <h1 className="mb-6">Relatórios</h1>
      <p className="text-gray-600 mb-8">Gere e visualize relatórios do sistema</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      Exportar PDF
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
