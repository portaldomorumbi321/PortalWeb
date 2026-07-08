import { Users, UserPlus, Package, MapPin, CheckSquare } from "lucide-react";
import { Card } from "./ui/card";
import { useNavigate } from "react-router";
import ResumoOrcamentos from "./ResumoOrcamentos";

const cadastroOptions = [
  {
    icon: Users,
    title: "Clientes",
    description: "Gerenciar cadastro de clientes",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    route: "/cadastros/clientes",
  },
  {
    icon: UserPlus,
    title: "Fornecedores",
    description: "Gerenciar fornecedores",
    color: "text-green-600",
    bgColor: "bg-green-100",
    route: "/cadastros/fornecedores",
  },
  {
    icon: Package,
    title: "Produtos",
    description: "Cadastro de produtos e serviços",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    route: "/cadastros/produtos",
  },
  {
    icon: MapPin,
    title: "Endereços",
    description: "Gerenciar localizações",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    route: "/cadastros/enderecos",
  },
  {
    icon: CheckSquare,
    title: "Tarefas",
    description: "Gerenciar tarefas e atividades",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    route: "/cadastros/tarefas",
  },
];

export default function Cadastros() {
  const navigate = useNavigate();

  return (
    <div>
      <ResumoOrcamentos />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Cadastros</h1>
      <p className="text-gray-500 mb-8">Gerencie todos os cadastros do sistema</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cadastroOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.title}
              onClick={() => navigate(option.route)}
              className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
            >
              <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${option.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-500">{option.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
