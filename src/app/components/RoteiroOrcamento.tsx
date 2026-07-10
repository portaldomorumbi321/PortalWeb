import { useParams } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function RoteiroOrcamento() {
  const { numero } = useParams<{ numero: string }>();
  const [orc, setOrc] = useState<Orcamento | null>(null);

  useEffect(() => {
    if (numero) {
      const stored = localStorage.getItem(`orc_${numero}`);
      if (stored) {
        setOrc(JSON.parse(stored));
      }
    }
  }, [numero]);

  if (!orc) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Roteiro não disponível.</p>
        </Card>
      </div>
    );
  }

  const total = (orc.itens || []).reduce((acc: number, i: any) => acc + (i.quantidade * i.valorUnitario * (1 - (i.desconto || 0) / 100)), 0);

  const handleShareWhatsApp = () => {
    const message = `Olá! Aqui está o roteiro da sua viagem:\n\nCliente: ${orc.cliente}\nOrçamento: ${orc.numero}\nTotal: R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\nVisite: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-lg mx-auto bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900"><strong>Roteiro da Sua Viagem</strong></h1>
          <p className="text-sm text-gray-500 mt-1">{orc.cliente}</p>
        </div>
        <button onClick={() => window.close()} className="p-2 text-gray-600 hover:text-gray-900">
          <X className="w-5 h-5" />
        </button>
      </div>

      <Card className="p-4 mb-4">
        <p className="text-sm text-gray-500">Número: <span className="font-mono font-semibold">{orc.numero}</span></p>
        <p className="text-sm text-gray-500">Emitido: {orc.dataCriacao}</p>
        {orc.dataValidade && <p className="text-sm text-gray-500">Validade: {orc.dataValidade}</p>}
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="font-semibold text-gray-900 mb-2">Itens</h2>
        <div className="space-y-2">
          {(orc.itens || []).map((it: any, idx: number) => (
            <div key={idx} className="flex justify-between border-b pb-2">
              <div>
                <p className="font-medium text-gray-900 text-sm">{it.descricao}</p>
                <p className="text-xs text-gray-500">{it.quantidade} {it.unidade} · {it.desconto ? `${it.desconto}% desc` : "sem desconto"}</p>
              </div>
              <div className="text-right font-medium text-gray-900 text-sm">
                R$ {(it.quantidade * it.valorUnitario * (1 - (it.desconto || 0) / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {orc.observacoes && (
        <Card className="p-4 mb-4 bg-yellow-50 border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-700 mb-1">Observações</p>
          <p className="text-sm text-yellow-800">{orc.observacoes}</p>
        </Card>
      )}

      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total da Viagem</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-700">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => window.print()} className="flex-1">Imprimir</Button>
        <Button onClick={handleShareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
          <Share2 className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
