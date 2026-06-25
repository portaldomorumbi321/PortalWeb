import { User, Calendar, Clock, Award } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function Funcionario() {
  const employees = [
    {
      name: "Maria Silva",
      role: "Gerente de Vendas",
      department: "Comercial",
      status: "Ativo",
      initials: "MS",
    },
    {
      name: "João Santos",
      role: "Analista Financeiro",
      department: "Financeiro",
      status: "Ativo",
      initials: "JS",
    },
    {
      name: "Ana Costa",
      role: "Designer",
      department: "Marketing",
      status: "Ativo",
      initials: "AC",
    },
    {
      name: "Pedro Oliveira",
      role: "Desenvolvedor",
      department: "TI",
      status: "Ativo",
      initials: "PO",
    },
  ];

  const stats = [
    {
      icon: User,
      title: "Total de Funcionários",
      value: "47",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Calendar,
      title: "Aniversariantes do Mês",
      value: "3",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Clock,
      title: "Em Férias",
      value: "5",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      icon: Award,
      title: "Destaques do Mês",
      value: "2",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div>
      <h1 className="mb-6">Funcionários</h1>
      <p className="text-gray-600 mb-8">Gerencie informações dos colaboradores</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Equipe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((employee, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-600">{employee.role}</p>
                <p className="text-xs text-gray-500">{employee.department}</p>
              </div>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600">{employee.status}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
