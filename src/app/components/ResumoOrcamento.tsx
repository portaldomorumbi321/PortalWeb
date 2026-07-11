import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plane, Bed, ShieldCheck, ShoppingCart, User, Mail, Share2 } from "lucide-react";
import { Button } from "./ui/button";
// Tipos replicados de Orcamentos.tsx para consistência
interface ItemOrc {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
}

interface OrcamentoCompleto {
  numero: string;
  cliente: string;
  email: string;
  status: string;
  voos?: any[];
  hospedagem?: any[];
  seguro?: any[];
  itens: ItemOrc[]; // Itens de Venda
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcItem(item: ItemOrc) {
  const bruto = item.quantidade * item.valorUnitario;
  const desc = bruto * (item.desconto / 100);
  return bruto - desc;
}

export default function ResumoOrcamento() {
  const { numero } = useParams<{ numero: string }>();
  const [orcamento, setOrcamento] = useState<OrcamentoCompleto | null>(null);

  useEffect(() => {
    if (numero) {
      const dados = localStorage.getItem(`orc_${numero}`);
      if (dados) {
        setOrcamento(JSON.parse(dados));
      }
    }
  }, [numero]);

  if (!orcamento) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Carregando resumo...</h1>
          <p className="text-gray-500 mt-2">Se o orçamento não carregar, volte e tente novamente.</p>
        </div>
      </div>
    );
  }

  const totalVendas = orcamento.itens.reduce((acc, i) => acc + calcItem(i), 0);

  const handleShareWhatsApp = () => {
    if (!orcamento) return;
    const message = `Olá! Aqui está o resumo do seu orçamento:\n\nCliente: ${orcamento.cliente}\nOrçamento: ${orcamento.numero}\n\nVisite: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Resumo do Orçamento</h1>
          <p className="text-lg text-indigo-600 font-mono mt-1">{orcamento.numero}</p>
        </div>

        <Card className="mb-6 p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-indigo-500" />
              <span>Dados do Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="font-semibold text-gray-900">{orcamento.cliente}</p>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Mail className="w-4 h-4" /> {orcamento.email}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Voos */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Plane className="text-blue-500" /> Voos</CardTitle></CardHeader>
            <CardContent>{orcamento.voos && orcamento.voos.length > 0 ? <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(orcamento.voos, null, 2)}</pre> : <p className="text-sm text-gray-500">Nenhuma informação de voo adicionada.</p>}</CardContent>
          </Card>

          {/* Hospedagem */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bed className="text-purple-500" /> Hospedagem</CardTitle></CardHeader>
            <CardContent>{orcamento.hospedagem && orcamento.hospedagem.length > 0 ? <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(orcamento.hospedagem, null, 2)}</pre> : <p className="text-sm text-gray-500">Nenhuma informação de hospedagem adicionada.</p>}</CardContent>
          </Card>

          {/* Seguro */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="text-green-500" /> Seguro</CardTitle></CardHeader>
            <CardContent>{orcamento.seguro && orcamento.seguro.length > 0 ? <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(orcamento.seguro, null, 2)}</pre> : <p className="text-sm text-gray-500">Nenhuma informação de seguro adicionada.</p>}</CardContent>
          </Card>

          {/* Vendas */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="text-orange-500" /> Vendas</CardTitle></CardHeader>
            <CardContent>
              {orcamento.itens && orcamento.itens.length > 0 && orcamento.itens.some(i => i.descricao) ? (
                <div className="space-y-2">
                  <table className="w-full text-sm">
                    <tbody>
                      {orcamento.itens.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">{item.descricao}</td>
                          <td className="py-2 text-right font-semibold">{moeda(calcItem(item))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-end pt-2">
                    <div className="text-right">
                      <span className="text-sm font-semibold">Total Vendas: </span>
                      <span className="text-lg font-bold text-indigo-600">{moeda(totalVendas)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum item de venda adicionado.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex gap-2 print:hidden">
          <Button onClick={() => window.print()} className="flex-1">
            Imprimir
          </Button>
          <Button onClick={handleShareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
            <Share2 className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
        </div>
      </main>
    </div>
  );
}