import { useParams } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Share2, X, Plane, Bed, Map, CalendarDays, Car, Utensils, Sparkles, Shield, Info
} from "lucide-react";
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

function formatarPeriodo(checkin: string, checkout: string): string {
  if (!checkin || !checkout) return "";

  const inicio = new Date(checkin + 'T00:00:00');
  const fim = new Date(checkout + 'T00:00:00');

  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  const formatadorMesAno = new Intl.DateTimeFormat('pt-BR', options);

  const diaInicio = inicio.getUTCDate();
  const diaFim = fim.getUTCDate();

  const mesAnoInicio = formatadorMesAno.format(inicio);
  const mesAnoFim = formatadorMesAno.format(fim);

  if (mesAnoInicio === mesAnoFim) {
    return `${diaInicio} a ${diaFim} de ${mesAnoInicio}`;
  } else {
    const optionsInicio: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const formatadorInicio = new Intl.DateTimeFormat('pt-BR', optionsInicio);
    return `${formatadorInicio.format(inicio)} a ${diaFim} de ${mesAnoFim}`;
  }
}

function Countdown({ targetDate }: { targetDate: string }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate + 'T00:00:00') - +new Date();
    return difference > 0 ? {
      Meses: Math.floor(difference / (1000 * 60 * 60 * 24 * 30.44)),
      Dias: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30.44),
      Horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
      Minutos: Math.floor((difference / 1000 / 60) % 60),
      Segundos: Math.floor((difference / 1000) % 60),
    } : {};
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft);

  if (!timerComponents.length) {
    return <span className="text-green-600 font-semibold">Sua viagem começou!</span>;
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-4">
      {timerComponents.map(([interval, value]) => (
        <div key={interval} className="text-center flex flex-col items-center">
          <div className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg min-w-[45px] sm:min-w-[55px] shadow-lg">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 mt-1">{interval}</div>
        </div>
      ))}
    </div>
  );
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

  const handleShareWhatsApp = () => {
    const message = `Olá! Aqui está o roteiro da sua viagem:\n\nCliente: ${orc.cliente}\nOrçamento: ${orc.numero}\n\nVisite: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const destinoPrincipal = orc.hospedagem && orc.hospedagem.length > 0 ? orc.hospedagem[0].local : "Sua Viagem";
  const dataCheckinPrincipal = orc.hospedagem && orc.hospedagem.length > 0 ? orc.hospedagem[0].checkin : null;
  const origemPrincipal = orc.voos && orc.voos.length > 0 ? orc.voos[0].origem : null;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto bg-white min-h-screen">
      <div className="flex items-start justify-between mb-8">
        <div className="text-center flex-1 group">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Roteiro da Sua Viagem
          </h1>
          {origemPrincipal && (
            <p className="text-lg text-gray-600 mt-2">
              Preparado para {origemPrincipal}
            </p>
          )}
        </div>
        <button onClick={() => window.close()} className="p-2 text-gray-600 hover:text-gray-900">
          <X className="w-5 h-5" />
        </button>
      </div>

      {dataCheckinPrincipal && (
        <Card className="p-4 mb-6 text-center">
          <h2 className="font-bold text-purple-700 mb-3">Sr(a) {orc.cliente}, falta para sua viagem:</h2>
          <Countdown targetDate={dataCheckinPrincipal} />
        </Card>
      )}

      {/* VOOS */}
      {orc.voos && orc.voos.length > 0 && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-blue-100 p-3">
            <h2 className="font-bold text-blue-800 flex items-center gap-2"><Plane className="w-5 h-5"/> Voos</h2>
          </div>
          <div className="p-4 space-y-3">
            {orc.voos.map((voo: any, idx: number) => (
              <div key={voo.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {voo.numero} - {voo.companhia}
                  </p>
                  {idx > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Conexão {idx}</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1.5">{voo.origem} → {voo.destino}</p>
                <p className="text-xs text-gray-500 mt-1.5">{voo.data} | {voo.partida} - {voo.chegada} ({voo.duracao})</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* HOSPEDAGEM */}
      {orc.hospedagem && orc.hospedagem.length > 0 && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-green-100 p-3">
            <h2 className="font-bold text-green-800 flex items-center gap-2"><Bed className="w-5 h-5"/> Hospedagem</h2>
          </div>
          <div className="p-4 space-y-3">
            {orc.hospedagem.map((h: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{h.nome}</p>
                <p className="text-xs text-gray-500">{h.local}</p>
                {h.endereco && <p className="text-xs text-gray-400">{h.endereco}</p>}
                <p className="text-sm font-medium text-indigo-600 mt-1">{formatarPeriodo(h.checkin, h.checkout)}</p>
                <p className="text-xs text-gray-600 mt-1">{h.tipoQuarto} • {h.noites} noite{h.noites !== 1 ? "s" : ""}</p>
                {h.voucher && (
                  <button
                    onClick={() => {
                      const win = window.open("");
                      if (win && h.voucher) {
                        win.document.write(
                          h.voucherTipo === "pdf"
                            ? `<iframe src="${h.voucher}" style="width:100%;height:100%;border:none;"></iframe>`
                            : `<img src="${h.voucher}" style="max-width:100%;max-height:100vh;display:block;margin:auto;" />`
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
        </Card>
      )}

      {/* ROTEIRO */}
      {orc.roteiro && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-sky-100 p-3">
            <h2 className="font-bold text-sky-800 flex items-center gap-2"><Map className="w-5 h-5"/> Roteiro</h2>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap p-4">{orc.roteiro}</p>
        </Card>
      )}

      {/* DAY BY DAY */}
      {orc.dayByDay && orc.dayByDay.length > 0 && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-purple-100 p-3">
            <h2 className="font-bold text-purple-800 flex items-center gap-2"><CalendarDays className="w-5 h-5"/> Dia a Dia</h2>
          </div>
          <div className="p-4 space-y-3">
            {orc.dayByDay.map((day: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Dia {idx + 1}</p>
                <p className="text-sm text-gray-600">{day.atividade}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TRANSPORTE */}
      {orc.transporte && orc.transporte.length > 0 && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-yellow-100 p-3">
            <h2 className="font-bold text-yellow-800 flex items-center gap-2"><Car className="w-5 h-5"/> Transporte</h2>
          </div>
          <div className="p-4 space-y-3">
            {orc.transporte.map((t: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
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
        </Card>
      )}

      {/* RESTAURANTE */}
      {orc.restaurante && orc.restaurante.length > 0 && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-red-100 p-3">
            <h2 className="font-bold text-red-800 flex items-center gap-2"><Utensils className="w-5 h-5"/> Restaurantes</h2>
          </div>
          <div className="p-4 space-y-3">
            {orc.restaurante.map((r: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{r.nome}</p>
                <p className="text-sm text-gray-600">{r.local}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* EXPERIÊNCIAS */}
      {orc.experiencias && orc.experiencias.length > 0 && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-pink-100 p-3">
            <h2 className="font-bold text-pink-800 flex items-center gap-2"><Sparkles className="w-5 h-5"/> Experiências</h2>
          </div>
          <div className="p-4 space-y-3">
            {orc.experiencias.map((e: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{e.nome}</p>
                <p className="text-sm text-gray-600">{e.descricao}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SEGURO */}
      {orc.seguro && orc.seguro.length > 0 && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-teal-100 p-3">
            <h2 className="font-bold text-teal-800 flex items-center gap-2"><Shield className="w-5 h-5"/> Seguro</h2>
          </div>
          <div className="p-4 space-y-3 text-sm text-gray-600">
            {orc.seguro.map((s: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <p>{s.tipo}: {s.detalhes}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {orc.observacoes && (
        <Card className="overflow-hidden mb-6">
          <div className="bg-amber-100 p-3">
            <h2 className="font-bold text-amber-800 flex items-center gap-2"><Info className="w-5 h-5"/> Observações</h2>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap p-4">{orc.observacoes}</p>
        </Card>
      )}

      <div className="flex gap-2 print:hidden">
        <Button onClick={() => window.print()} className="flex-1">Imprimir</Button>
        <Button onClick={handleShareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
          <Share2 className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
