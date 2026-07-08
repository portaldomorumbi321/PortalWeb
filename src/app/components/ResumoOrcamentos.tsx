import { useState } from "react";
import { Eye, Edit2, Trash2, Plus, FileText, ChevronRight } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router";

interface ItemOrc {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
}

interface Orcamento {
  id: number;
  numero: string;
  cliente: string;
  email: string;
  status: "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado" | "Cancelado";
  dataCriacao: string;
  dataValidade: string;
  observacoes: string;
  itens: ItemOrc[];
}

const dados: Orcamento[] = [
  {
    id: 1,
    numero: "ORC-2025-001",
    cliente: "Ana Paula Souza",
    email: "ana@email.com",
    status: "Aprovado",
    dataCriacao: "2025-06-01",
    dataValidade: "2025-07-01",
    observacoes: "Entrega em até 5 dias úteis.",
    itens: [
      { id: 1, descricao: "Notebook Pro 15\"", quantidade: 2, unidade: "un", valorUnitario: 4599.90, desconto: 5 },
      { id: 2, descricao: "Mouse Sem Fio", quantidade: 2, unidade: "un", valorUnitario: 89.90, desconto: 0 },
    ],
  },
  {
    id: 2,
    numero: "ORC-2025-002",
    cliente: "Carlos Mendes",
    email: "carlos@empresa.com",
    status: "Enviado",
    dataCriacao: "2025-06-15",
    dataValidade: "2025-07-15",
    observacoes: "",
    itens: [
      { id: 1, descricao: "Cadeira Ergonômica", quantidade: 5, unidade: "un", valorUnitario: 1299.00, desconto: 10 },
    ],
  },
  {
    id: 3,
    numero: "ORC-2025-003",
    cliente: "Fernanda Lima",
    email: "fernanda@loja.com",
    status: "Rascunho",
    dataCriacao: "2025-07-01",
    dataValidade: "2025-08-01",
    observacoes: "Aguardando confirmação de modelo.",
    itens: [
      { id: 1, descricao: "Serviço de Consultoria", quantidade: 10, unidade: "h", valorUnitario: 250.00, desconto: 0 },
      { id: 2, descricao: "Relatório Técnico", quantidade: 1, unidade: "un", valorUnitario: 800.00, desconto: 0 },
    ],
  },
  {
    id: 4,
    numero: "ORC-2025-004",
    cliente: "Roberto Silva",
    email: "roberto@tech.com",
    status: "Aprovado",
    dataCriacao: "2025-07-05",
    dataValidade: "2025-08-05",
    observacoes: "Cliente VIP - desconto especial aplicado.",
    itens: [
      { id: 1, descricao: "Impressora Laser Color", quantidade: 1, unidade: "un", valorUnitario: 2899.90, desconto: 15 },
      { id: 2, descricao: "Papel A4 (resma)", quantidade: 10, unidade: "un", valorUnitario: 35.00, desconto: 5 },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Aprovado":
      return "bg-green-100 text-green-800";
    case "Enviado":
      return "bg-blue-100 text-blue-800";
    case "Rascunho":
      return "bg-gray-100 text-gray-800";
    case "Rejeitado":
      return "bg-red-100 text-red-800";
    case "Cancelado":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const calcularTotal = (itens: ItemOrc[]) => {
  return itens.reduce((acc, item) => {
    const subtotal = item.quantidade * item.valorUnitario;
    const desconto = (subtotal * item.desconto) / 100;
    return acc + (subtotal - desconto);
  }, 0);
};

export default function ResumoOrcamentos() {
  const navigate = useNavigate();
  const [orcamentos] = useState(dados);
  const [expandidos, setExpandidos] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandidos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const orcamentosRecentes = orcamentos.slice(0, 3);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Orçamentos Recentes</h2>
        </div>
        <Button
          onClick={() => navigate("/financeiro/orcamentos")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <div className="space-y-3">
        {orcamentosRecentes.map((orcamento) => (
          <Card key={orcamento.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{orcamento.numero}</h3>
                  <Badge className={getStatusColor(orcamento.status)}>
                    {orcamento.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-700">Cliente</p>
                    <p>{orcamento.cliente}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Data</p>
                    <p>{new Date(orcamento.dataCriacao).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Validade</p>
                    <p>{new Date(orcamento.dataValidade).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Total</p>
                    <p className="font-semibold text-purple-600">
                      R$ {calcularTotal(orcamento.itens).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                {expandidos.includes(orcamento.id) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Itens:</p>
                    <div className="space-y-1 text-sm">
                      {orcamento.itens.map((item) => (
                        <div key={item.id} className="flex justify-between text-gray-600">
                          <span>
                            {item.quantidade} {item.unidade} de {item.descricao}
                          </span>
                          <span className="font-medium">
                            R${" "}
                            {(
                              item.quantidade *
                              item.valorUnitario *
                              (1 - item.desconto / 100)
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                    {orcamento.observacoes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Observações:</span>{" "}
                          {orcamento.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleExpand(orcamento.id)}
                  className="h-9 w-9"
                  title={expandidos.includes(orcamento.id) ? "Recolher" : "Expandir"}
                >
                  {expandidos.includes(orcamento.id) ? (
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="Visualizar"
                  onClick={() => navigate("/financeiro/orcamentos")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-red-600 hover:text-red-700"
                  title="Deletar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full mt-4 gap-2"
        onClick={() => navigate("/financeiro/orcamentos")}
      >
        Ver todos os orçamentos
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
