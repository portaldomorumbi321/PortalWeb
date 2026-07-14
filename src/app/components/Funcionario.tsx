import { useState, type ChangeEvent } from "react";
import { User, Calendar, Clock, Award, Plus, Edit2, Trash2, X, Check, Camera } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { obterFuncionarios, salvarFuncionarios } from "../data/funcionarios";

interface Funcionario {
  id: number;
  name: string;
  role: string;
  department: string;
  status: "Ativo" | "Inativo";
  initials: string;
  accessLevel: "Administrador" | "Agente";
  email: string;
  password?: string;
  photo?: string;
}

const dadosIniciais: Funcionario[] = [
  { id: 1, name: "Carol", role: "Gerente de Vendas", department: "Comercial", status: "Ativo", initials: "MS", accessLevel: "Administrador", email: "carol@321go.com" },
  { id: 2, name: "Ricardo", role: "Analista Financeiro", department: "Financeiro", status: "Ativo", initials: "JS", accessLevel: "Agente", email: "ricardo@321go.com" },
  { id: 3, name: "Miguel", role: "Designer", department: "Marketing", status: "Ativo", initials: "AC", accessLevel: "Agente", email: "miguel@321go.com" },
  { id: 4, name: "João Pedro", role: "Desenvolvedor", department: "TI", status: "Inativo", initials: "PO", accessLevel: "Administrador", email: "jp@321go.com" },
];

const funcionarioVazio: Omit<Funcionario, 'id' | 'initials'> = { name: "", role: "", department: "", status: "Ativo", accessLevel: "Agente", email: "", password: "" };

export default function Funcionario() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(obterFuncionarios);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [form, setForm] = useState<Omit<Funcionario, 'id' | 'initials'>>(funcionarioVazio);

  function abrirNovo() { setEditando(null); setForm(funcionarioVazio); setModalAberto(true); }
  function abrirEdicao(func: Funcionario) { setEditando(func); setForm(func); setModalAberto(true); }
  function fecharModal() { setModalAberto(false); setEditando(null); }

  function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo || !arquivo.type.startsWith("image/")) return;

    const leitor = new FileReader();
    leitor.onload = () => setForm((atual) => ({ ...atual, photo: String(leitor.result) }));
    leitor.readAsDataURL(arquivo);
  }

  function salvar() {
    if (!form.name.trim()) return;
    const iniciais = form.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    if (editando) {
      setFuncionarios(prev => {
        const atualizados = prev.map(f => f.id === editando.id ? { ...editando, ...form, initials: iniciais } : f);
        salvarFuncionarios(atualizados);
        return atualizados;
      });
    } else {
      const novoId = funcionarios.length > 0 ? Math.max(...funcionarios.map(f => f.id)) + 1 : 1;
      setFuncionarios(prev => {
        const atualizados = [...prev, { id: novoId, ...form, initials: iniciais }];
        salvarFuncionarios(atualizados);
        return atualizados;
      });
    }
    fecharModal();
  }

  function excluir(id: number) {
    setFuncionarios(prev => {
      const atualizados = prev.filter(f => f.id !== id);
      salvarFuncionarios(atualizados);
      return atualizados;
    });
  }

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie informações dos colaboradores</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4" /> Novo Funcionário</Button>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funcionarios.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar>
                {employee.photo && <AvatarImage src={employee.photo} alt={`Foto de ${employee.name}`} />}
                <AvatarFallback className="bg-blue-600 text-white">
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-600">{employee.role}</p>
                <p className="text-xs text-gray-500">{employee.department}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${employee.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${employee.status === 'Ativo' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {employee.status}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => abrirEdicao(employee)} className="h-7 w-7 text-blue-600 hover:text-blue-600"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => excluir(employee.id)} className="h-7 w-7 text-red-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? "Editar Funcionário" : "Novo Funcionário"}</h2>
              <Button variant="ghost" size="icon" onClick={fecharModal} className="h-8 w-8 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div>
                <Label>Foto do Funcionário</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Avatar className="size-16">
                    {form.photo && <AvatarImage src={form.photo} alt="Prévia da foto do funcionário" />}
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg">
                      {form.name ? form.name.split(" ").map((nome) => nome[0]).slice(0, 2).join("").toUpperCase() : <Camera className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-wrap gap-2">
                    <label htmlFor="foto-funcionario" className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-white px-3 text-sm font-medium hover:bg-gray-50">
                      <Camera className="w-4 h-4" /> Anexar foto
                    </label>
                    <input id="foto-funcionario" type="file" accept="image/*" onChange={selecionarFoto} className="hidden" />
                    {form.photo && <Button type="button" variant="ghost" onClick={() => setForm({ ...form, photo: undefined })} className="h-9 text-red-600 hover:text-red-700">Remover</Button>}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do funcionário" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail de Acesso *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@321go.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editando ? "Deixe em branco para não alterar" : "Senha de acesso"} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Cargo</Label>
                  <Input id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Gerente de Vendas" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Ex: Comercial" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex gap-2 mt-1">
                  {(["Ativo", "Inativo"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                        form.status === s
                          ? s === "Ativo"
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-red-500 text-white border-red-500"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Nível de Acesso</Label>
                <div className="flex gap-2 mt-1">
                  {(["Administrador", "Agente"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, accessLevel: level })}
                      className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                        form.accessLevel === level ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={fecharModal}>Cancelar</Button>
              <Button onClick={salvar} disabled={!form.name.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                {editando ? "Salvar Alterações" : "Cadastrar Funcionário"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
