import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Users,
  UserPlus,
  DollarSign,
  UserX,
  ClipboardList,
  Plane,
  PhoneOff,
  CheckCircle2,
} from "lucide-react";

const cardData = [
  { title: "Total de Leads", value: "1,250", icon: <Users className="h-4 w-4 text-blue-500" /> },
  { title: "Lead no Período", value: "150", icon: <UserPlus className="h-4 w-4 text-green-500" /> },
  { title: "Fechamentos", value: "35", icon: <DollarSign className="h-4 w-4 text-emerald-500" /> },
  { title: "Churn Inativos", value: "12", icon: <UserX className="h-4 w-4 text-red-500" /> },
  { title: "Receita Roteiros", value: "R$ 45,800", icon: <ClipboardList className="h-4 w-4 text-purple-500" /> },
  { title: "Viagens em Andamento", value: "8", icon: <Plane className="h-4 w-4 text-sky-500" /> },
  { title: "Sem Follow-up", value: "42", icon: <PhoneOff className="h-4 w-4 text-orange-500" /> },
  { title: "Viagens Finalizadas", value: "120", icon: <CheckCircle2 className="h-4 w-4 text-teal-500" /> },
];

const periodFilters = ["Mês", "3m", "6m", "12m", "Tudo"];

// Dados mocados para os gráficos
const leadsPorPeriodoData = [
  { name: 'Jan', leads: 65 }, { name: 'Fev', leads: 59 }, { name: 'Mar', leads: 80 },
  { name: 'Abr', leads: 81 }, { name: 'Mai', leads: 56 }, { name: 'Jun', leads: 55 },
  { name: 'Jul', leads: 40 }, { name: 'Ago', leads: 62 }, { name: 'Set', leads: 78 },
  { name: 'Out', leads: 90 }, { name: 'Nov', leads: 110 }, { name: 'Dez', leads: 150 },
];

const statusLeadsData = [
  { name: 'Novo', value: 400 },
  { name: 'Em Contato', value: 300 },
  { name: 'Qualificado', value: 300 },
  { name: 'Perdido', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function LeadDashboard() {
  const [activeFilter, setActiveFilter] = useState("Mês");

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
        <div className="flex items-center space-x-2">
          {periodFilters.map((filter) => (
            <Button 
              key={filter} 
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Gráfico de Leads por Período</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={leadsPorPeriodoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#3b82f6" name="Novos Leads" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Gráfico de Status dos Leads</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={statusLeadsData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusLeadsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}