import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Search, Plus, Edit2, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";

type StatusLead = "Novo" | "Em Contato" | "Qualificado" | "Perdido" | "Vendido";
type StatusCrm = "Novo Lead" | "Qualificação" | "Reunião" | "Follow-ups" | "Pagos" | "Nutrição" | "Finalizados";

interface Lead {
  id: number;
  nome: string;
  email: string;
  whatsapp: string;
  status: StatusLead;
  statusCrm: StatusCrm;
  viagens: number;
  criadoEm: string;
  atendente: string;
}

const dadosIniciais: Lead[] = [
  { id: 1, nome: "Juliana Martins", email: "juliana.m@email.com", whatsapp: "(11) 98877-6655", status: "Novo", statusCrm: "Novo Lead", viagens: 0, criadoEm: "2024-07-28", atendente: "Ana Paula" },
  { id: 2, nome: "Marcos Andrade", email: "marcos.a@corp.com", whatsapp: "(21) 97766-5544", status: "Em Contato", statusCrm: "Qualificação", viagens: 1, criadoEm: "2024-07-27", atendente: "Carlos Mendes" },
  { id: 3, nome: "Beatriz Costa", email: "bia.costa@email.com", whatsapp: "(31) 96655-4433", status: "Qualificado", statusCrm: "Reunião", viagens: 3, criadoEm: "2024-07-25", atendente: "Ana Paula" },
  { id: 4, nome: "Lucas Pereira", email: "lucas.p@mail.com", whatsapp: "(41) 95544-3322", status: "Vendido", statusCrm: "Pagos", viagens: 1, criadoEm: "2024-07-22", atendente: "Carlos Mendes" },
  { id: 5, nome: "Sofia Ribeiro", email: "sofia.r@email.com", whatsapp: "(51) 94433-2211", status: "Perdido", statusCrm: "Finalizados", viagens: 0, criadoEm: "2024-07-20", atendente: "Ana Paula" },
  { id: 6, nome: "Fernanda Lima", email: "fernanda.l@email.com", whatsapp: "(31) 97654-3210", status: "Em Contato", statusCrm: "Follow-ups", viagens: 2, criadoEm: "2024-07-18", atendente: "Carlos Mendes" },
];

const leadVazio: Omit<Lead, 'id'> = { nome: "", email: "", whatsapp: "", status: "Novo", statusCrm: "Novo Lead", viagens: 0, criadoEm: new Date().toISOString().split("T")[0], atendente: "" };

const statusConfig: Record<StatusLead, { bg: string; cor: string }> = {
  "Novo": { bg: "bg-blue-100", cor: "text-blue-700" },
  "Em Contato": { bg: "bg-yellow-100", cor: "text-yellow-700" },
  "Qualificado": { bg: "bg-purple-100", cor: "text-purple-700" },
  "Perdido": { bg: "bg-red-100", cor: "text-red-600" },
  "Vendido": { bg: "bg-green-100", cor: "text-green-700" },
};

const allStatus: StatusLead[] = ["Novo", "Em Contato", "Qualificado", "Perdido", "Vendido"];
const allCrmStatus: StatusCrm[] = ["Novo Lead", "Qualificação", "Reunião", "Follow-ups", "Pagos", "Nutrição", "Finalizados"];
const allAtendentes = ["Ana Paula", "Carlos Mendes", "Fernanda Lima"];

export default function LeadList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>(dadosIniciais);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroWhatsapp, setFiltroWhatsapp] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | StatusLead>("Todos");
  const [filtroAtendente, setFiltroAtendente] = useState<"Todos" | string>("Todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'asc' | 'desc' } | null>({ key: 'criadoEm', direction: 'desc' });
  const [editando, setEditando] = useState<Lead | null>(null);
  const [form, setForm] = useState(leadVazio);

  useEffect(() => {
    const state = location.state as { editLeadId?: number };
    if (state?.editLeadId) {
      const leadToEdit = leads.find(l => l.id === state.editLeadId);
      if (leadToEdit) {
        abrirEdicao(leadToEdit);
        // Limpa o state da navegação para não reabrir o modal ao atualizar a página
        navigate(location.pathname, { replace: true });
      }
    }
  // Adicionamos 'leads' como dependência para garantir que a busca funcione mesmo se os leads carregarem depois
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, leads]);

  const leadsFiltrados = leads.filter((lead) => {
    const matchNome = filtroNome ? lead.nome.toLowerCase().includes(filtroNome.toLowerCase()) : true;
    const matchEmail = filtroEmail ? lead.email.toLowerCase().includes(filtroEmail.toLowerCase()) : true;
    const matchWhatsapp = filtroWhatsapp ? lead.whatsapp.includes(filtroWhatsapp) : true;
    const matchStatus = filtroStatus === "Todos" || lead.status === filtroStatus;
    const matchAtendente = filtroAtendente === "Todos" || lead.atendente === filtroAtendente;
    return matchNome && matchEmail && matchWhatsapp && matchStatus && matchAtendente;
  });

  const sortedLeads = useMemo(() => {
    let sortableItems = [...leadsFiltrados];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [leadsFiltrados, sortConfig]);

  const requestSort = (key: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  function abrirNovo() {
    setEditando(null);
    setForm(leadVazio);
    setModalAberto(true);
  }

  function abrirEdicao(lead: Lead) {
    setEditando(lead);
    setForm(lead);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  function salvar() {
    if (!form.nome.trim()) return;
    if (editando) {
      setLeads((prev) => prev.map((l) => (l.id === editando.id ? { ...editando, ...form } : l)));
    } else {
      const novoId = leads.length > 0 ? Math.max(...leads.map((l) => l.id)) + 1 : 1;
      setLeads((prev) => [{ id: novoId, ...form }, ...prev]);
    }
    fecharModal();
  }

  function excluir(id: number) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lista de Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{leads.length} leads no total</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input placeholder="Nome..." value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
          <Input placeholder="Email..." value={filtroEmail} onChange={(e) => setFiltroEmail(e.target.value)} />
          <Input placeholder="Whatsapp..." value={filtroWhatsapp} onChange={(e) => setFiltroWhatsapp(e.target.value)} />
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as any)} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
            <option value="Todos">Todos Status</option>
            {allStatus.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filtroAtendente} onChange={(e) => setFiltroAtendente(e.target.value)} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
            <option value="Todos">Todos Atendentes</option>
            {allAtendentes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </Card>

      {/* Tabela de Leads */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-600 font-semibold">
                <th className="px-4 py-3"><button onClick={() => requestSort('nome')} className="flex items-center gap-1">Nome {sortConfig?.key === 'nome' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>
                <th className="px-4 py-3 hidden lg:table-cell"><button onClick={() => requestSort('email')} className="flex items-center gap-1">Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>
                <th className="px-4 py-3"><button onClick={() => requestSort('status')} className="flex items-center gap-1">Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>
                <th className="px-4 py-3 hidden md:table-cell text-center"><button onClick={() => requestSort('viagens')} className="flex items-center gap-1 mx-auto">Viagens {sortConfig?.key === 'viagens' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>
                <th className="px-4 py-3 hidden md:table-cell"><button onClick={() => requestSort('criadoEm')} className="flex items-center gap-1">Criado em {sortConfig?.key === 'criadoEm' && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.nome}</div>
                    <div className="text-gray-500 lg:hidden">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{lead.email}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${statusConfig[lead.status].bg} ${statusConfig[lead.status].cor} hover:${statusConfig[lead.status].bg}`}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 hidden md:table-cell">{lead.viagens}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{new Date(lead.criadoEm).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEdicao(lead)} className="h-8 w-8 text-blue-600 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => excluir(lead.id)} className="h-8 w-8 text-red-500 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editando ? "Editar Lead" : "Novo Lead"}</h2>
              <Button variant="ghost" size="icon" onClick={fecharModal} className="h-8 w-8 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do lead" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="lead@email.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="whatsapp">Whatsapp</Label>
                  <div className="relative mt-1">
                    <Input
                      id="whatsapp"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="pr-10"
                    />
                    {form.whatsapp && (
                      <a href={`https://wa.me/${form.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="Abrir no WhatsApp" className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-600 hover:text-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusLead })} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    {allStatus.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="statusCrm">Status CRM</Label>
                  <select id="statusCrm" value={form.statusCrm} onChange={(e) => setForm({ ...form, statusCrm: e.target.value as StatusCrm })} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    {allCrmStatus.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="atendente">Atendente</Label>
                  <select id="atendente" value={form.atendente} onChange={(e) => setForm({ ...form, atendente: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    <option value="">Nenhum</option>
                    {allAtendentes.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="viagens">Nº de Viagens</Label>
                  <Input id="viagens" type="number" min="0" value={form.viagens} onChange={(e) => setForm({ ...form, viagens: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="criadoEm">Criado em</Label>
                  <Input id="criadoEm" type="date" value={form.criadoEm} onChange={(e) => setForm({ ...form, criadoEm: e.target.value })} className="mt-1" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={fecharModal}>Cancelar</Button>
              <Button onClick={salvar} disabled={!form.nome.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                {editando ? "Salvar Alterações" : "Criar Lead"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}