import { Mail, Share2, Target, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";

export default function Marketing() {
  const campaigns = [
    {
      name: "Campanha de Verão 2026",
      status: "Ativa",
      reach: "12.5K",
      engagement: "8.2%",
      statusColor: "bg-green-500",
    },
    {
      name: "Promoção Dia dos Pais",
      status: "Agendada",
      reach: "-",
      engagement: "-",
      statusColor: "bg-blue-500",
    },
    {
      name: "Newsletter Mensal",
      status: "Ativa",
      reach: "8.3K",
      engagement: "12.5%",
      statusColor: "bg-green-500",
    },
  ];

  const marketingTools = [
    {
      icon: Mail,
      title: "E-mail Marketing",
      description: "Envie campanhas por e-mail",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Share2,
      title: "Redes Sociais",
      description: "Gerencie suas redes sociais",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Target,
      title: "Campanhas",
      description: "Crie e gerencie campanhas",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: TrendingUp,
      title: "Análise",
      description: "Métricas e desempenho",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div>
      <h1 className="mb-6">Marketing</h1>
      <p className="text-gray-600 mb-8">Gerencie suas campanhas e estratégias de marketing</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {marketingTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.title}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-lg ${tool.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${tool.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Campanhas Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Campanha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Alcance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Engajamento</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-3 px-4 font-medium text-gray-900">{campaign.name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${campaign.statusColor}`}></span>
                      <span className="text-sm text-gray-600">{campaign.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{campaign.reach}</td>
                  <td className="py-3 px-4 text-gray-600">{campaign.engagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
