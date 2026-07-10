import { useLocation, useNavigate } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export default function RoteiroOrcamento() {
  const location = useLocation();
  const navigate = useNavigate();
  const orc = (location.state as any)?.orc;

  if (!orc) {
    return (
      <div className="px-4 py-8">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Roteiro não disponível. Gere o roteiro a partir da tela de orçamentos.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
        </Card>
      </div>
    );
  }

  const total = (orc.itens || []).reduce((acc: number, i: any) => acc + (i.quantidade * i.valorUnitario * (1 - (i.desconto || 0) / 100)), 0);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <p className="text-xs text-gray-500">Roteiro do Orçamento</p>
          <h1 className="text-xl font-bold text-gray-900 truncate">{orc.cliente}</h1>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <p className="text-sm text-gray-500">Número: <span className="font-mono">{orc.numero}</span></p>
        <p className="text-sm text-gray-500">Emitido: {orc.dataCriacao}</p>
        {orc.dataValidade && <p className="text-sm text-gray-500">Validade: {orc.dataValidade}</p>}
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="font-semibold text-gray-900 mb-2">Itens</h2>
        <div className="space-y-2">
          {(orc.itens || []).map((it: any, idx: number) => (
            <div key={idx} className="flex justify-between">
              <div>
                <p className="font-medium text-gray-900">{it.descricao}</p>
                <p className="text-xs text-gray-500">{it.quantidade} {it.unidade} · {it.desconto ? `${it.desconto}% desc` : "sem desconto"}</p>
              </div>
              <div className="text-right font-medium text-gray-900">
                R$ {(it.quantidade * it.valorUnitario * (1 - (it.desconto || 0) / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Observações</p>
            <p className="text-sm text-gray-700">{orc.observacoes || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-bold text-indigo-700">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </Card>

      <Button onClick={() => window.print()} className="w-full">Imprimir / Salvar como PDF</Button>
    </div>
  );
}
