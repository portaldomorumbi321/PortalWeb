import { useParams } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Voo {
  id: number;
  companhia: string;
  numero: string;
  data: string;
  origem: string;
  destino: string;
  partida: string;
  chegada: string;
  duracao: string;
}

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
  voos?: Voo[];
  hospedagem?: any[];
  roteiro?: string;
  dayByDay?: any[];
  transporte?: any[];
  restaurante?: any[];
  experiencias?: any[];
  seguro?: any[];
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
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto bg-white min-h-screen">
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

      {/* VOOS */}
      {orc.voos && orc.voos.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">✈️ Voos</h2>
          <div className="space-y-3">
            {orc.voos.map((voo: any, idx: number) => (
              <div key={voo.id} className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium text-gray-900">
                  {voo.numero} - {voo.companhia}
                  {idx > 0 && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Conexão {idx}</span>}
                </p>
                <p className="text-sm text-gray-600 mt-1">{voo.origem} → {voo.destino}</p>
                <p className="text-xs text-gray-500 mt-1">{voo.data} | {voo.partida} - {voo.chegada} ({voo.duracao})</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* HOSPEDAGEM */}
      {orc.hospedagem && orc.hospedagem.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">🏨 Hospedagem</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {orc.hospedagem.map((h: any, idx: number) => (
              <div key={idx} className="border-l-4 border-green-500 pl-3">
                <p className="font-medium text-gray-900">{h.nome}</p>
                <p className="text-xs">{h.local}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ROTEIRO */}
      {orc.roteiro && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">🗺️ Roteiro</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{orc.roteiro}</p>
        </Card>
      )}

      {/* DAY BY DAY */}
      {orc.dayByDay && orc.dayByDay.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">📅 Dia a Dia</h2>
          <div className="space-y-2">
            {orc.dayByDay.map((day: any, idx: number) => (
              <div key={idx} className="border-l-4 border-purple-500 pl-3">
                <p className="font-medium text-gray-900">Dia {idx + 1}</p>
                <p className="text-sm text-gray-600">{day.atividade}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TRANSPORTE */}
      {orc.transporte && orc.transporte.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">🚗 Transporte</h2>
          <div className="space-y-3">
            {orc.transporte.map((t: any, idx: number) => (
              <div key={idx} className="border-l-4 border-yellow-500 pl-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{t.tipo}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">{t.empresa}</span>
                  {t.diaRoteiro && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Dia {t.diaRoteiro}</span>}
                </div>
                <p className="text-sm text-gray-700 mt-1">{t.origem} → {t.destino}</p>
                {t.dataHoraSaida && (
                  <p className="text-xs text-gray-500 mt-1">
                    Saída: {new Date(t.dataHoraSaida).toLocaleString("pt-BR")}
                    {t.dataHoraChegada && <> | Chegada: {new Date(t.dataHoraChegada).toLocaleString("pt-BR")}</>}
                  </p>
                )}
                {t.valor > 0 && (
                  <p className="text-xs font-semibold text-indigo-600 mt-1">
                    R$ {t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
                {t.codigoReserva && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Reserva: <span className="font-mono font-semibold">{t.codigoReserva}</span>
                  </p>
                )}
                {t.descricao && (
                  <p className="text-xs text-gray-500 mt-0.5 italic">{t.descricao}</p>
                )}
                {t.voucher && (
                  <button
                    onClick={() => {
                      const win = window.open("");
                      if (win && t.voucher) {
                        win.document.write(
                          t.voucherTipo === "pdf"
                            ? `<iframe src="${t.voucher}" style="width:100%;height:100%;border:none;"></iframe>`
                            : `<img src="${t.voucher}" style="max-width:100%;max-height:100vh;display:block;margin:auto;" />`
                        );
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline mt-1 inline-block"
                  >
                    📎 Ver voucher
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-semibold text-gray-900">
              Total Transporte: R${" "}
              {orc.transporte
                .reduce((sum: number, t: any) => sum + (t.valor || 0), 0)
                .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </Card>
      )}

      {/* RESTAURANTE */}
      {orc.restaurante && orc.restaurante.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">🍽️ Restaurante</h2>
          <div className="space-y-2">
            {orc.restaurante.map((r: any, idx: number) => (
              <div key={idx} className="border-l-4 border-red-500 pl-3">
                <p className="font-medium text-gray-900">{r.nome}</p>
                <p className="text-sm text-gray-600">{r.local}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* EXPERIÊNCIAS */}
      {orc.experiencias && orc.experiencias.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">⭐ Experiências</h2>
          <div className="space-y-2">
            {orc.experiencias.map((e: any, idx: number) => (
              <div key={idx} className="border-l-4 border-pink-500 pl-3">
                <p className="font-medium text-gray-900">{e.nome}</p>
                <p className="text-sm text-gray-600">{e.descricao}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SEGURO */}
      {orc.seguro && orc.seguro.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">🛡️ Seguro</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {orc.seguro.map((s: any, idx: number) => (
              <p key={idx} className="border-l-4 border-gray-500 pl-3">{s.tipo}: {s.detalhes}</p>
            ))}
          </div>
        </Card>
      )}

      {/* ITENS */}
      {orc.itens && orc.itens.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-2">Itens do Orçamento</h2>
          <div className="space-y-2">
            {orc.itens.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{it.descricao}</p>
                  <p className="text-xs text-gray-500">{it.quantidade} {it.unidade}</p>
                </div>
                <div className="text-right font-medium text-gray-900 text-sm">
                  R$ {(it.quantidade * it.valorUnitario * (1 - (it.desconto || 0) / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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

