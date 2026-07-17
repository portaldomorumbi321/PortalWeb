import { useParams } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Share2, X, Plane, Bed, Map, CalendarDays, Car, Utensils, Sparkles, Shield, Info, Instagram, Mail, MessageCircle, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { listarFuncionarios, type Funcionario } from "../data/funcionariosApi";
import DestinationPhoto from "./DestinationPhoto";
import logo from "../../imports/logo.png";

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
  passageiros?: string[];
  destino?: string;
  agenteViagem?: string;
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

function limparLinhaRoteiro(linha: string): string {
  return String(linha || '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^#{1,6}\s*/g, '')
    .trim();
}

function normalizarTextoRoteiro(texto: string): string {
  return String(texto || '')
    .replace(/\r\n/g, '\n')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/(\d+\))\s+/g, '\n$1 ')
    .replace(/\s+(Dia\s+\d+[:\-])/gi, '\n$1')
    .replace(/\s+(Dia a dia sugerido|Destaques imperdíveis|Dicas práticas|Evidências dos lugares|Resumo inspirador)/gi, '\n\n$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isTituloNumerado(linha: string): boolean {
  const texto = limparLinhaRoteiro(linha).toLowerCase();
  return /^\d+\)\s+/.test(texto) && (
    texto.includes('título') ||
    texto.includes('resumo') ||
    texto.includes('dia') ||
    texto.includes('destaques') ||
    texto.includes('dicas') ||
    texto.includes('evidências')
  );
}

function isSubtituloRoteiro(linha: string): boolean {
  const texto = limparLinhaRoteiro(linha).toLowerCase();
  return (
    texto.startsWith('roteiro de ') ||
    texto.startsWith('dia ') ||
    texto.includes('dia a dia') ||
    texto.includes('destaques') ||
    texto.includes('dicas práticas') ||
    texto.includes('evidências dos lugares') ||
    texto.includes('resumo') ||
    /:$/.test(texto)
  );
}

function getSubtituloClass(linha: string): string {
  const texto = limparLinhaRoteiro(linha).toLowerCase();

  if (texto.includes('resumo')) return 'text-violet-700';
  if (texto.includes('dia a dia') || texto.startsWith('dia ')) return 'text-blue-700';
  if (texto.includes('destaques')) return 'text-fuchsia-700';
  if (texto.includes('dicas práticas')) return 'text-emerald-700';
  if (texto.includes('evidências dos lugares')) return 'text-amber-700';

  return 'text-sky-700';
}

function RenderRoteiroTexto({ texto }: { texto: string }) {
  const linhas = normalizarTextoRoteiro(texto).split('\n');
  const primeiraLinhaComTexto = linhas.findIndex((linha) => limparLinhaRoteiro(linha).length > 0);

  return (
    <div className="space-y-2 text-[16px] leading-8 text-slate-700" style={{ fontFamily: "'Cambria', 'Palatino Linotype', 'Book Antiqua', serif" }}>
      {linhas.map((linha, index) => {
        const textoLimpo = limparLinhaRoteiro(linha);
        const linhaOriginal = String(linha || '').trim();

        if (!textoLimpo) {
          return <div key={`space-${index}`} className="h-2" />;
        }

        if (index === primeiraLinhaComTexto) {
          return (
            <h3 key={`title-${index}`} className="text-2xl font-bold tracking-tight text-indigo-800">
              {textoLimpo}
            </h3>
          );
        }

        if (isTituloNumerado(linhaOriginal) || isSubtituloRoteiro(linhaOriginal)) {
          return (
            <h4 key={`subtitle-${index}`} className={`pt-2 text-lg font-bold ${getSubtituloClass(linhaOriginal)}`}>
              {textoLimpo}
            </h4>
          );
        }

        if (/^\d+[.)]\s+/.test(linhaOriginal) || /^[-*•]\s+/.test(linhaOriginal)) {
          return (
            <p key={`bullet-${index}`} className="pl-5 text-slate-700">
              • {textoLimpo.replace(/^\d+[.)]\s+/, '').replace(/^[-*•]\s+/, '')}
            </p>
          );
        }

        return (
          <p key={`line-${index}`} className="text-slate-700">
            {textoLimpo}
          </p>
        );
      })}
    </div>
  );
}

function obterDestinoPrincipal(orc: Orcamento): string {
  const destinoVoo =
    orc.voos?.find((item) => typeof item?.destino === "string" && item.destino.trim())?.destino || "";

  if (destinoVoo) {
    return destinoVoo;
  }

  const destinoHospedagem =
    orc.hospedagem?.find((item) => typeof item?.destino === "string" && item.destino.trim())?.destino ||
    orc.hospedagem?.find((item) => typeof item?.local === "string" && item.local.trim())?.local ||
    orc.hospedagem?.find((item) => typeof item?.cidade === "string" && item.cidade.trim())?.cidade ||
    "";

  if (destinoHospedagem) {
    return destinoHospedagem;
  }

  const destinoTransporte =
    orc.transporte?.find((item) => typeof item?.destino === "string" && item.destino.trim())?.destino || "";

  if (destinoTransporte) {
    return destinoTransporte;
  }

  const destinoTopLevel = typeof orc.destino === "string" ? orc.destino.trim() : "";
  if (destinoTopLevel) {
    return destinoTopLevel;
  }

  return "Destino da viagem";
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
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {timerComponents.map(([interval, value]) => (
        <div key={interval} className="min-w-0 text-center">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 px-1 py-2 sm:py-3 text-lg font-bold text-white shadow-md sm:text-2xl">
            {String(value).padStart(2, '0')}
          </div>
          <div className="mt-1 truncate text-[10px] font-medium text-gray-500 sm:text-xs">{interval}</div>
        </div>
      ))}
    </div>
  );
}

export default function RoteiroOrcamento() {
  const { numero } = useParams<{ numero: string }>();
  const [orc, setOrc] = useState<Orcamento | null>(null);
  const [itemAtivo, setItemAtivo] = useState<string>("voos");
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  useEffect(() => {
    if (numero) {
      const stored = localStorage.getItem(`orc_${numero}`);
      if (stored) {
        setOrc(JSON.parse(stored));
      }
    }
  }, [numero]);

  useEffect(() => {
    let mounted = true;

    async function carregarFuncionarios() {
      try {
        const lista = await listarFuncionarios();
        if (mounted) {
          setFuncionarios(lista);
        }
      } catch {
        if (mounted) {
          setFuncionarios([]);
        }
      }
    }

    carregarFuncionarios();

    return () => {
      mounted = false;
    };
  }, []);

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

  const destinoPrincipal = obterDestinoPrincipal(orc);
  const possuiVoo = Boolean(orc.voos?.length);
  const possuiHospedagem = Boolean(orc.hospedagem?.length);
  const possuiPlanejamentoBase = possuiVoo || possuiHospedagem;
  const destinoParaImagem = possuiPlanejamentoBase ? destinoPrincipal : "";
  const dataCheckinPrincipal = orc.hospedagem && orc.hospedagem.length > 0 ? orc.hospedagem[0].checkin : null;
  const dataViagemPrincipal = dataCheckinPrincipal || orc.voos?.[0]?.data || null;
  const listaPassageiros = Array.isArray(orc.passageiros)
    ? orc.passageiros.map((nome) => String(nome || "").trim()).filter(Boolean)
    : [];
  const passageirosTexto = listaPassageiros.length > 0 ? listaPassageiros.join(", ") : "Sem passageiros adicionais";
  const agente = orc.agenteViagem
    ? funcionarios.find((funcionario) => funcionario.name === orc.agenteViagem)
    : null;
  const nomeAgente = agente?.name || orc.agenteViagem;
  const iniciaisAgente = nomeAgente
    ?.split(" ")
    .map((nome) => nome[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const itensRoteiro = [
    { id: "voos", titulo: "Voos", icone: Plane, classe: "bg-blue-100 text-blue-700 hover:bg-blue-200", disponivel: Boolean(orc.voos?.length) },
    { id: "hospedagem", titulo: "Hospedagem", icone: Bed, classe: "bg-green-100 text-green-700 hover:bg-green-200", disponivel: Boolean(orc.hospedagem?.length) },
    { id: "roteiro", titulo: "Roteiro", icone: Map, classe: "bg-sky-100 text-sky-700 hover:bg-sky-200", disponivel: Boolean(orc.roteiro) },
    { id: "dia-a-dia", titulo: "Dia a Dia", icone: CalendarDays, classe: "bg-purple-100 text-purple-700 hover:bg-purple-200", disponivel: Boolean(orc.dayByDay?.length) },
    { id: "transporte", titulo: "Transporte", icone: Car, classe: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200", disponivel: Boolean(orc.transporte?.length) },
    { id: "restaurantes", titulo: "Restaurantes", icone: Utensils, classe: "bg-red-100 text-red-700 hover:bg-red-200", disponivel: Boolean(orc.restaurante?.length) },
    { id: "experiencias", titulo: "Experiências", icone: Sparkles, classe: "bg-pink-100 text-pink-700 hover:bg-pink-200", disponivel: Boolean(orc.experiencias?.length) },
    { id: "seguro", titulo: "Seguro", icone: Shield, classe: "bg-teal-100 text-teal-700 hover:bg-teal-200", disponivel: Boolean(orc.seguro?.length) },
    { id: "passageiros", titulo: "Passageiros", icone: Users, classe: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200", disponivel: Boolean(listaPassageiros.length) },
  ].filter((item) => item.disponivel);

  const navegarParaItem = (id: string) => {
    setItemAtivo(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto bg-white min-h-screen" style={{ fontFamily: "'Cambria', 'Palatino Linotype', 'Book Antiqua', serif" }}>
      <div className="flex items-start justify-between mb-8">
        <div className="text-center flex-1 group">
          <div className="flex items-center justify-center gap-3">
            <img src={logo} alt="Logo" className="h-9 w-9 sm:h-11 sm:w-11 object-contain" />
            <h1
              className="text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-700 via-cyan-600 to-emerald-600"
              style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Times New Roman', serif" }}
            >
              Roteiro da Sua Viagem
            </h1>
          </div>
          <p
            className="text-lg sm:text-xl mt-2 font-medium text-slate-700"
            style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Times New Roman', serif" }}
          >
            {possuiPlanejamentoBase ? `Preparado para ${destinoPrincipal}` : "Ainda não tem voo definido."}
          </p>
        </div>
        <button onClick={() => window.close()} className="p-2 text-gray-600 hover:text-gray-900">
          <X className="w-5 h-5" />
        </button>
      </div>

      <DestinationPhoto destination={destinoParaImagem} />

      <Card className="p-4 mb-6 text-center">
        <h2 className="font-bold text-purple-700 mb-3">Sr(a) {orc.cliente || "Cliente"}, falta para sua viagem:</h2>
        {dataViagemPrincipal ? (
          <Countdown targetDate={dataViagemPrincipal} />
        ) : (
          <p className="text-sm text-gray-500">Data da viagem ainda não definida.</p>
        )}
      </Card>

      {itensRoteiro.length > 0 && (
        <nav aria-label="Itens do roteiro" className="mb-6 print:hidden">
          <p className="text-sm font-semibold text-gray-700 mb-2">Itens do roteiro</p>
          <div className="flex gap-2 overflow-x-auto px-1 pt-2 pb-3">
            {itensRoteiro.map(({ id, titulo, icone: Icone, classe }) => (
              <Button
                key={id}
                type="button"
                onClick={() => navegarParaItem(id)}
                title={titulo}
                aria-label={`Ir para ${titulo}`}
                className={`group relative h-11 w-11 shrink-0 rounded-xl border-0 p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${classe} ${itemAtivo === id ? "ring-2 ring-offset-2 ring-purple-500" : ""}`}
              >
                <Icone className="w-5 h-5" />
                <span className="sr-only">{titulo}</span>
              </Button>
            ))}
          </div>
        </nav>
      )}

      {/* VOOS */}
      {orc.voos && orc.voos.length > 0 && itemAtivo === "voos" && (
        <Card id="voos" className="overflow-hidden mb-6 scroll-mt-4">
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
      {orc.hospedagem && orc.hospedagem.length > 0 && itemAtivo === "hospedagem" && (
        <Card id="hospedagem" className="overflow-hidden mb-6 scroll-mt-4">
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
      {orc.roteiro && itemAtivo === "roteiro" && (
        <Card id="roteiro" className="overflow-hidden mb-6 scroll-mt-4">
          <div className="bg-sky-100 p-3">
            <h2 className="font-bold text-sky-800 flex items-center gap-2"><Map className="w-5 h-5"/> Roteiro</h2>
          </div>
          <div className="p-4">
            <RenderRoteiroTexto texto={orc.roteiro} />
          </div>
        </Card>
      )}

      {/* DAY BY DAY */}
      {orc.dayByDay && orc.dayByDay.length > 0 && itemAtivo === "dia-a-dia" && (
        <Card id="dia-a-dia" className="overflow-hidden mb-6 scroll-mt-4">
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
      {orc.transporte && orc.transporte.length > 0 && itemAtivo === "transporte" && (
        <Card id="transporte" className="overflow-hidden mb-6 scroll-mt-4">
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
      {orc.restaurante && orc.restaurante.length > 0 && itemAtivo === "restaurantes" && (
        <Card id="restaurantes" className="overflow-hidden mb-6 scroll-mt-4">
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
      {orc.experiencias && orc.experiencias.length > 0 && itemAtivo === "experiencias" && (
        <Card id="experiencias" className="overflow-hidden mb-6 scroll-mt-4">
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
      {orc.seguro && orc.seguro.length > 0 && itemAtivo === "seguro" && (
        <Card id="seguro" className="overflow-hidden mb-6 scroll-mt-4">
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

      {listaPassageiros.length > 0 && itemAtivo === "passageiros" && (
        <Card id="passageiros" className="overflow-hidden mb-6 scroll-mt-4">
          <div className="bg-indigo-100 p-3">
            <h2 className="font-bold text-indigo-800 flex items-center gap-2"><Users className="w-5 h-5"/> Passageiros</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 leading-6">{passageirosTexto}</p>
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

      <footer className="mt-10 border-t border-gray-200 pt-6">
        {nomeAgente && (
          <div className="mb-5 max-w-2xl">
            <div className="flex items-center gap-4">
              {agente?.photo ? (
                <img src={agente.photo} alt={`Foto de ${nomeAgente}`} className="h-16 w-16 rounded-full object-cover ring-2 ring-purple-100" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white ring-2 ring-purple-100">
                  {iniciaisAgente}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900">{nomeAgente}</p>
                <p className="mt-1 text-sm font-medium text-purple-700">Especialista em viagens personalizadas</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Planejo viagens personalizadas com atenção aos mínimos detalhes, unindo praticidade, conforto e segurança. Meu compromisso é transformar seus planos em experiências únicas, com suporte dedicado do início ao fim.
            </p>
          </div>
        )}
        <div className="mb-5 flex items-center gap-4 print:hidden">
          <a href="https://wa.me/5511942000321" target="_blank" rel="noreferrer" title="WhatsApp" aria-label="WhatsApp" className="text-green-500 transition-transform hover:scale-110 hover:text-green-600">
            <MessageCircle className="h-5 w-5" />
          </a>
          <a href="https://www.instagram.com/321go.portaldomorumbi" target="_blank" rel="noreferrer" title="Instagram" aria-label="Instagram" className="text-pink-500 transition-transform hover:scale-110 hover:text-pink-600">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="mailto:portaldomorumbi@321go.com.br" title="E-mail" aria-label="E-mail" className="text-red-500 transition-transform hover:scale-110 hover:text-red-600">
            <Mail className="h-5 w-5" />
          </a>
        </div>
        <p className="text-xs text-gray-500">© 2026 321Go Portal do Morumbi. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
