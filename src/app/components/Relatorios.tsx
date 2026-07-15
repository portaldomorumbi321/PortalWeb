import { FileText, BarChart3, PieChart, FileSpreadsheet } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

interface ReportItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  path: string;
}

export default function Relatorios() {
  const navigate = useNavigate();
  const reports: ReportItem[] = [
    {
      icon: BarChart3,
      title: "Relatório de Vendas",
      description: "Análise completa de vendas por período",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      path: "/relatorios/vendas",
    },
    {
      icon: PieChart,
      title: "Relatório Financeiro",
      description: "Demonstrativo de receitas e despesas",
      color: "text-green-600",
      bgColor: "bg-green-100",
      path: "/relatorios/financeiro",
    },
    {
      icon: FileText,
      title: "Relatório de Clientes",
      description: "Listagem e análise de clientes",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      path: "/relatorios/clientes",
    },
    {
      icon: FileSpreadsheet,
      title: "Relatório de Orçamentos",
      description: "Análise de volume, aprovação e valor dos orçamentos",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      path: "/relatorios/orcamentos",
    },
  ];

  return (
    <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Gere e visualize relatórios do sistema</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{report.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">{report.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs sm:text-sm py-2 sm:py-2 h-8 sm:h-9"
                      onClick={() => navigate(report.path)}
                    >
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs sm:text-sm py-2 sm:py-2 h-8 sm:h-9">
                      PDF
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
