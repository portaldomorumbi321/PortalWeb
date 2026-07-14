import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Phone, Edit2, GripVertical, X } from "lucide-react";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";

// Tipos e dados agora são importados ou simulados da lista de Leads
// Em um app real, isso viria de uma API ou estado global (Context/Redux)
type StatusCrm = "Novo Lead" | "Qualificação" | "Reunião" | "Follow-ups" | "Pagos" | "Nutrição" | "Finalizados";
interface LeadCardData {
  id: string;
  name: string;
  phone: string;
  statusCrm: StatusCrm;
  // Campos adicionais para o formulário de edição
  email: string;
  status: "Novo" | "Em Contato" | "Qualificado" | "Perdido" | "Vendido";
  atendente: string;
  criadoEm: string;
  // Adicionei um status visual para o card, que pode ser diferente do status do CRM
  statusVisual: "Atendido" | "Agendado" | "Qualificado" | "Pago Concluído" | "Novo" | "Negociando";
}

interface Columns {
  [key: string]: {
    title: string;
    status: StatusCrm;
    items: LeadCardData[];
  };
}

const CRM_STORAGE_KEY = "crm-columns-v2";

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

function buildColumnsFromLeads(leads: LeadCardData[]): Columns {
  const columnsWithLeads: Columns = JSON.parse(JSON.stringify(initialColumns));
  leads.forEach((lead) => {
    const columnKey = Object.keys(columnsWithLeads).find((key) => columnsWithLeads[key].status === lead.statusCrm);
    if (columnKey) {
      columnsWithLeads[columnKey].items.push(lead);
    }
  });
  return columnsWithLeads;
}

function getColumnIdByStatus(status: StatusCrm, columns: Columns): string | undefined {
  return Object.keys(columns).find((key) => columns[key].status === status);
}

function getColumnIdFromDropTarget(targetId: string, columns: Columns): string | undefined {
  if (columns[targetId]) {
    return targetId;
  }
  return Object.keys(columns).find((key) => columns[key].items.some((item) => item.id === targetId));
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
  onEdit: (card: LeadCardData) => void;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
}) {

  return (
    <Card
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", card.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart(card.id);
      }}
      onDragEnd={onDragEnd}
      className="p-2 mb-2 bg-white cursor-move"
      onDoubleClick={() => onEdit(card)}
      title="Clique duplo para editar"
    >
      <div className="flex items-start">
        <div className="cursor-grab p-0.5 mr-1.5 text-gray-400 hover:text-gray-600">
          <GripVertical size={14} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-xs text-gray-800 leading-tight">{card.name}</p>
          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
            <Phone size={12} /> {card.phone}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block ${statusColors[card.statusVisual]}`}>
              {card.statusVisual}
            </div>
            <button onClick={() => onEdit(card)} title="Editar Lead" className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors">
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
  onEdit: (card: LeadCardData) => void;
  onCardDragStart: (cardId: string) => void;
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

// Dados mocados que simulam a busca dos leads
const mockLeads: LeadCardData[] = [
    { id: '1', name: 'Juliana Martins', phone: '(11) 98877-6655', statusCrm: 'Novo Lead', statusVisual: 'Novo', email: 'juliana.m@email.com', status: 'Novo', atendente: 'Ana Paula', criadoEm: '2024-07-28' },
    { id: '2', name: 'Marcos Andrade', phone: '(21) 97766-5544', statusCrm: 'Qualificação', statusVisual: 'Qualificado', email: 'marcos.a@corp.com', status: 'Em Contato', atendente: 'Carlos Mendes', criadoEm: '2024-07-27' },
    { id: '3', name: 'Beatriz Costa', phone: '(31) 96655-4433', statusCrm: 'Reunião', statusVisual: 'Agendado', email: 'bia.costa@email.com', status: 'Qualificado', atendente: 'Ana Paula', criadoEm: '2024-07-25' },
    { id: '4', name: 'Lucas Pereira', phone: '(41) 95544-3322', statusCrm: 'Pagos', statusVisual: 'Pago Concluído', email: 'lucas.p@mail.com', status: 'Vendido', atendente: 'Carlos Mendes', criadoEm: '2024-07-22' },
    { id: '5', name: 'Sofia Ribeiro', phone: '(51) 94433-2211', statusCrm: 'Finalizados', statusVisual: 'Atendido', email: 'sofia.r@email.com', status: 'Perdido', atendente: 'Ana Paula', criadoEm: '2024-07-20' },
    { id: '6', name: 'Fernanda Lima', phone: '(31) 97654-3210', statusCrm: 'Follow-ups', statusVisual: 'Negociando', email: 'fernanda.l@email.com', status: 'Em Contato', atendente: 'Carlos Mendes', criadoEm: '2024-07-18' },
    { id: '7', name: 'Ricardo Alves', phone: '(85) 94321-0987', statusCrm: 'Novo Lead', statusVisual: 'Novo', email: 'r.alves@negocio.com', status: 'Novo', atendente: 'Ana Paula', criadoEm: '2024-07-29' },
];

// Constantes para os dropdowns do modal
const allStatus: LeadCardData['status'][] = ["Novo", "Em Contato", "Qualificado", "Perdido", "Vendido"];
const allCrmStatus: StatusCrm[] = ["Novo Lead", "Qualificação", "Reunião", "Follow-ups", "Pagos", "Nutrição", "Finalizados"];
const allAtendentes = ["Ana Paula", "Carlos Mendes", "Fernanda Lima"];

export default function CRM() {
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<LeadCardData | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Columns>(() => {
    if (typeof window !== "undefined") {
      const savedColumns = localStorage.getItem(CRM_STORAGE_KEY);
      if (savedColumns) {
        try {
          return JSON.parse(savedColumns) as Columns;
        } catch {
          localStorage.removeItem(CRM_STORAGE_KEY);
        }
      }
    }
    return buildColumnsFromLeads(mockLeads);
  });

  useEffect(() => {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  function abrirEdicao(card: LeadCardData) {
    setEditando(card);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  function salvarEdicao(form: LeadCardData) {
    if (!editando) return;

    setColumns((prev) => {
      const newColumns: Columns = JSON.parse(JSON.stringify(prev));

      // Remove o card da coluna atual para poder reposicionar pelo status CRM editado.
      for (const colId in newColumns) {
        newColumns[colId].items = newColumns[colId].items.filter((item) => item.id !== editando.id);
      }

      const destinationColumnId = getColumnIdByStatus(form.statusCrm, newColumns);
      if (!destinationColumnId) {
        return prev;
      }

      newColumns[destinationColumnId].items.push(form);
      toast.success(`Lead movido para ${newColumns[destinationColumnId].title}`);
      return newColumns;
    });
    fecharModal();
  }

  function moveCardToColumn(cardId: string, targetColumnId: string) {
    setColumns((prev) => {
      const newColumns: Columns = JSON.parse(JSON.stringify(prev));
      let sourceColumnId: string | undefined;
      let activeCard: LeadCardData | undefined;

      for (const colId in newColumns) {
        const foundCard = newColumns[colId].items.find((item) => item.id === cardId);
        if (foundCard) {
          sourceColumnId = colId;
          activeCard = foundCard;
          break;
        }
      }

      const destColumnId = getColumnIdFromDropTarget(targetColumnId, newColumns);
      if (!activeCard || !sourceColumnId || !destColumnId || sourceColumnId === destColumnId) {
        return prev;
      }

      const movedCard: LeadCardData = {
        ...activeCard,
        statusCrm: newColumns[destColumnId].status,
      };

      newColumns[sourceColumnId].items = newColumns[sourceColumnId].items.filter((item: LeadCardData) => item.id !== cardId);
      newColumns[destColumnId].items.push(movedCard);

      toast.success(`${movedCard.name} movido para ${newColumns[destColumnId].title}`);
      return newColumns;
    });
  }

  function handleCardDragStart(cardId: string) {
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
    moveCardToColumn(draggedCardId, columnId);
    setDraggedCardId(null);
    setOverColumnId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Funil de Vendas e Oportunidades</p>
        </div>
      </div>
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
        <EditModal lead={editando} onClose={fecharModal} onSave={salvarEdicao} />
      )}
    </div>
  );
}

interface EditModalProps {
  lead: LeadCardData;
  onClose: () => void;
  onSave: (form: LeadCardData) => void;
}

function EditModal({ lead, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState(lead);

  const handleSave = () => {
    onSave(form);
  };

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
            <Input id="nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do lead" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="lead@email.com" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="whatsapp">Whatsapp</Label>
              <Input id="whatsapp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadCardData['status'] })} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
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
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}