import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Phone, Edit2, GripVertical, X } from "lucide-react";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  atualizarLead,
  listarLeads,
  type Lead,
  type LeadPayload,
  type StatusCrm,
  type StatusLead,
} from "../data/leadsApi";
import { listarFuncionarios, type Funcionario } from "../data/funcionariosApi";

interface LeadCardData {
  id: number;
  nome: string;
  whatsapp: string;
  statusCrm: StatusCrm;
  email: string;
  status: StatusLead;
  atendente: string;
  criadoEm: string;
  statusVisual: "Atendido" | "Agendado" | "Qualificado" | "Pago Concluído" | "Novo" | "Negociando";
  viagens: number;
}

interface Columns {
  [key: string]: {
    title: string;
    status: StatusCrm;
    items: LeadCardData[];
  };
}

const initialColumns: Columns = {
  'novo-lead': {
    title: 'Novo Lead',
    status: 'Novo Lead',
    items: [],
  },
  'qualificacao': {
    title: 'Qualificação',
    status: 'Qualificação',
    items: [],
  },
  'reuniao': {
    title: 'Reunião',
    status: 'Reunião',
    items: [],
  },
  'follow-ups': {
    title: 'Follow-ups',
    status: 'Follow-ups',
    items: [],
  },
  'pagos': {
    title: 'Pagos',
    status: 'Pagos',
    items: [],
  },
  'nutricao': {
    title: 'Nutrição',
    status: 'Nutrição',
    items: [],
  },
  'finalizados': {
    title: 'Finalizados',
    status: 'Finalizados',
    items: [],
  },
};

function mapStatusVisual(status: StatusLead): LeadCardData["statusVisual"] {
  if (status === "Em Contato") return "Negociando";
  if (status === "Qualificado") return "Qualificado";
  if (status === "Vendido") return "Pago Concluído";
  if (status === "Perdido") return "Atendido";
  return "Novo";
}

function toLeadCard(lead: Lead): LeadCardData {
  return {
    id: lead.id,
    nome: lead.nome,
    whatsapp: lead.whatsapp,
    statusCrm: lead.statusCrm,
    email: lead.email,
    status: lead.status,
    atendente: lead.atendente,
    criadoEm: lead.criadoEm,
    statusVisual: mapStatusVisual(lead.status),
    viagens: lead.viagens,
  };
}

function buildColumnsFromLeads(leads: Lead[]): Columns {
  const columnsWithLeads: Columns = JSON.parse(JSON.stringify(initialColumns));
  leads.forEach((lead) => {
    const card = toLeadCard(lead);
    const columnKey = Object.keys(columnsWithLeads).find((key) => columnsWithLeads[key].status === card.statusCrm);
    if (columnKey) {
      columnsWithLeads[columnKey].items.push(card);
    }
  });
  return columnsWithLeads;
}

const statusColors: Record<LeadCardData['statusVisual'], string> = {
  'Novo': 'bg-blue-100 text-blue-800',
  'Qualificado': 'bg-purple-100 text-purple-800',
  'Agendado': 'bg-yellow-100 text-yellow-800',
  'Negociando': 'bg-orange-100 text-orange-800',
  'Pago Concluído': 'bg-green-100 text-green-800',
  'Atendido': 'bg-gray-100 text-gray-800',
};

function LeadCard({
  card,
  onEdit,
  onDragStart,
  onDragEnd,
}: {
  card: LeadCardData;
  onEdit: (cardId: number) => void;
  onDragStart: (cardId: number) => void;
  onDragEnd: () => void;
}) {

  return (
    <Card
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", String(card.id));
        event.dataTransfer.effectAllowed = "move";
        onDragStart(card.id);
      }}
      onDragEnd={onDragEnd}
      className="p-2 mb-2 bg-white cursor-move"
      onDoubleClick={() => onEdit(card.id)}
      title="Clique duplo para editar"
    >
      <div className="flex items-start">
        <div className="cursor-grab p-0.5 mr-1.5 text-gray-400 hover:text-gray-600">
          <GripVertical size={14} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-xs text-gray-800 leading-tight">{card.nome}</p>
          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
            <Phone size={12} /> {card.whatsapp || "Sem telefone"}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block ${statusColors[card.statusVisual]}`}>
              {card.statusVisual}
            </div>
            <button onClick={() => onEdit(card.id)} title="Editar Lead" className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Column({
  id,
  title,
  items,
  onEdit,
  onCardDragStart,
  onCardDragEnd,
  onColumnDragOver,
  onColumnDrop,
  isOver,
}: {
  id: string;
  title: string;
  items: LeadCardData[];
  onEdit: (cardId: number) => void;
  onCardDragStart: (cardId: number) => void;
  onCardDragEnd: () => void;
  onColumnDragOver: (columnId: string) => void;
  onColumnDrop: (columnId: string) => void;
  isOver: boolean;
}) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onColumnDragOver(id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onColumnDrop(id);
      }}
      className={`rounded-lg p-1.5 flex-1 min-w-0 border-2 transition-colors ${isOver ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-transparent'}`}
    >
      <h3 className="font-bold text-gray-700 text-sm px-2 mb-2">{title} <span className="text-xs text-gray-400 font-normal">{items.length}</span></h3>
      <div className="min-h-[100px] space-y-2">
        {items.map((card) => (
          <LeadCard
            key={card.id}
            card={card}
            onEdit={onEdit}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
          />
        ))}
      </div>
    </div>
  );
}

const allStatus: StatusLead[] = ["Novo", "Em Contato", "Qualificado", "Perdido", "Vendido"];
const allCrmStatus: StatusCrm[] = ["Novo Lead", "Qualificação", "Reunião", "Follow-ups", "Pagos", "Nutrição", "Finalizados"];

export default function CRM() {
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Lead | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [funcionariosAtivos, setFuncionariosAtivos] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function carregarDados() {
      try {
        setErro(null);
        const [listaLeads, funcionarios] = await Promise.all([listarLeads(), listarFuncionarios()]);
        if (!mounted) return;
        setLeads(listaLeads);
        setFuncionariosAtivos(funcionarios.filter((funcionario) => funcionario.status === "Ativo"));
      } catch (error) {
        if (!mounted) return;
        setErro(error instanceof Error ? error.message : "Erro ao carregar leads do CRM.");
        setLeads([]);
      } finally {
        if (mounted) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      mounted = false;
    };
  }, []);

  const columns = useMemo(() => buildColumnsFromLeads(leads), [leads]);

  const atendentesDisponiveis = useMemo(() => {
    const nomesFuncionarios = funcionariosAtivos.map((funcionario) => funcionario.name).filter(Boolean);
    const nomesLeads = leads.map((lead) => lead.atendente).filter(Boolean);
    return Array.from(new Set([...nomesFuncionarios, ...nomesLeads])).sort((a, b) => a.localeCompare(b));
  }, [funcionariosAtivos, leads]);

  function abrirEdicao(cardId: number) {
    const lead = leads.find((item) => item.id === cardId);
    if (!lead) {
      toast.error("Lead não encontrado.");
      return;
    }
    setEditando(lead);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  async function salvarEdicao(form: LeadPayload) {
    if (!editando) return;
    setSalvando(true);

    try {
      const atualizado = await atualizarLead(editando.id, form);
      setLeads((prev) => prev.map((lead) => (lead.id === atualizado.id ? atualizado : lead)));
      toast.success("Lead atualizado com sucesso.");
      fecharModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar edição do lead.");
    } finally {
      setSalvando(false);
    }
  }

  async function moveCardToColumn(cardId: number, targetColumnId: string) {
    const lead = leads.find((item) => item.id === cardId);
    const destinationColumn = columns[targetColumnId];

    if (!lead || !destinationColumn || lead.statusCrm === destinationColumn.status) {
      return;
    }

    const payload: LeadPayload = {
      nome: lead.nome,
      email: lead.email,
      whatsapp: lead.whatsapp,
      status: lead.status,
      statusCrm: destinationColumn.status,
      viagens: lead.viagens,
      criadoEm: lead.criadoEm,
      atendente: lead.atendente,
    };

    try {
      const atualizado = await atualizarLead(lead.id, payload);
      setLeads((prev) => prev.map((item) => (item.id === atualizado.id ? atualizado : item)));
      toast.success(`${atualizado.nome} movido para ${destinationColumn.title}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao mover lead no CRM.");
    }
  }

  function handleCardDragStart(cardId: number) {
    setDraggedCardId(cardId);
  }

  function handleCardDragEnd() {
    setDraggedCardId(null);
    setOverColumnId(null);
  }

  function handleColumnDragOver(columnId: string) {
    setOverColumnId(columnId);
  }

  function handleColumnDrop(columnId: string) {
    if (!draggedCardId) {
      return;
    }
    void moveCardToColumn(draggedCardId, columnId);
    setDraggedCardId(null);
    setOverColumnId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Funil de Vendas e Oportunidades {carregando ? "(carregando...)" : `(${leads.length} leads)`}</p>
        </div>
      </div>

      {erro && (
        <Card className="mb-4 border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {Object.entries(columns).map(([id, column]) => (
          <Column
            key={id}
            id={id}
            title={column.title}
            items={column.items}
            onEdit={abrirEdicao}
            onCardDragStart={handleCardDragStart}
            onCardDragEnd={handleCardDragEnd}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
            isOver={overColumnId === id}
          />
        ))}
      </div>

      {/* Modal de Edição */}
      {modalAberto && editando && (
        <EditModal
          lead={editando}
          atendentesDisponiveis={atendentesDisponiveis}
          salvando={salvando}
          onClose={fecharModal}
          onSave={salvarEdicao}
        />
      )}
    </div>
  );
}

interface EditModalProps {
  lead: Lead;
  atendentesDisponiveis: string[];
  salvando: boolean;
  onClose: () => void;
  onSave: (form: LeadPayload) => Promise<void>;
}

function EditModal({ lead, atendentesDisponiveis, salvando, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState<LeadPayload>({
    nome: lead.nome,
    email: lead.email,
    whatsapp: lead.whatsapp,
    status: lead.status,
    statusCrm: lead.statusCrm,
    viagens: lead.viagens,
    criadoEm: lead.criadoEm,
    atendente: lead.atendente,
  });

  const handleSave = () => onSave(form);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Editar Lead</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-gray-600">
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
              <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(00) 00000-0000" className="mt-1" />
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
              <Input
                id="atendente"
                value={form.atendente}
                onChange={(e) => setForm({ ...form, atendente: e.target.value })}
                placeholder="Selecione ou digite um atendente"
                className="mt-1"
                list="crm-atendentes-list"
              />
              <datalist id="crm-atendentes-list">
                {atendentesDisponiveis.map((atendente) => (
                  <option key={atendente} value={atendente} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viagens">Nº de Viagens</Label>
              <Input
                id="viagens"
                type="number"
                min="0"
                value={form.viagens}
                onChange={(e) => setForm({ ...form, viagens: parseInt(e.target.value, 10) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="criadoEm">Criado em</Label>
              <Input
                id="criadoEm"
                type="date"
                value={form.criadoEm}
                onChange={(e) => setForm({ ...form, criadoEm: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={salvando}>Cancelar</Button>
          <Button onClick={handleSave} disabled={salvando || !form.nome.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}