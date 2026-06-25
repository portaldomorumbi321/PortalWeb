import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card } from "./ui/card";

export default function Financeiro() {
  const financialData = [
    {
      icon: DollarSign,
      title: "Receitas",
      value: "R$ 125.430,00",
      change: "+12.5%",
      positive: true,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: TrendingDown,
      title: "Despesas",
      value: "R$ 78.250,00",
      change: "-5.2%",
      positive: true,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      icon: TrendingUp,
      title: "Lucro",
      value: "R$ 47.180,00",
      change: "+18.3%",
      positive: true,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Wallet,
      title: "Saldo",
      value: "R$ 234.560,00",
      change: "+8.1%",
      positive: true,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div>
      <h1 className="mb-6">Financeiro</h1>
      <p className="text-gray-600 mb-8">Visão geral das finanças</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {financialData.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <span className={`text-sm font-medium ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{item.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Últimas Transações</h3>
        <div className="space-y-4">
          {[
            { desc: "Pagamento Cliente #1234", value: "+ R$ 5.400,00", date: "Hoje, 14:30" },
            { desc: "Fornecedor ABC Ltda", value: "- R$ 2.100,00", date: "Hoje, 10:15" },
            { desc: "Pagamento Cliente #1235", value: "+ R$ 3.200,00", date: "Ontem, 16:45" },
          ].map((transaction, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{transaction.desc}</p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
              <p className={`font-semibold ${transaction.value.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.value}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
