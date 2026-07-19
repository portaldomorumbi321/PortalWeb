import { useParams } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Share2, X, Instagram, Mail, MessageCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { listarFuncionarios, type Funcionario } from "../data/funcionariosApi";
import { buscarOrcamentoPublico } from "../data/orcamentosApi";

const COR_PRINCIPAL = "#0a0534";
const COR_DESTAQUE = "#e07b20";

function RoteiroReferenceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" aria-hidden="true" fill="currentColor">
      <path d="M25.57,48.61h-1.02c-.48-.2-1-.33-1.43-.65-1.35-1-3.59-3.57-4.81-4.9-4.56-4.99-10.38-12.42-12.04-19.04l-.49-2.7c.03-.64-.04-1.3,0-1.94C6.88,1.93,28.96-5.3,39.99,8.41c9.51,11.82,1.17,24.53-7.25,33.81-1.51,1.66-3.49,3.83-5.18,5.27-.62.53-1.2.87-1.99,1.11ZM32.95,18.77c0-4.38-3.55-7.94-7.93-7.94s-7.93,3.55-7.93,7.94,3.55,7.94,7.93,7.94,7.93-3.55,7.93-7.94Z" />
    </svg>
  );
}

function DayByDayReferenceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" aria-hidden="true" fill="currentColor">
      <path d="M36.86,5.77c0,1.08,0,2.15,0,3.23,0,1.3-.98,2.31-2.24,2.3-1.24,0-2.21-.99-2.21-2.28,0-2.19,0-4.38,0-6.57,0-1.29.96-2.27,2.21-2.27,1.25,0,2.22.97,2.23,2.25,0,.56,0,1.11,0,1.67,0,.56,0,1.11,0,1.67Z" />
      <path d="M17.58,5.75c0,1.09,0,2.18,0,3.27,0,1.29-.97,2.28-2.21,2.28-1.24,0-2.23-.99-2.24-2.26,0-2.2-.01-4.41,0-6.61,0-1.29.98-2.25,2.23-2.25,1.25,0,2.2.97,2.21,2.27,0,1.1,0,2.2,0,3.3Z" />
      <path d="M10.57,41.65v-6.62h6.63v6.62h-6.63Z" />
      <path d="M10.57,23.91h6.61v6.61h-6.61v-6.61Z" />
      <path d="M28.3,41.65h-6.6v-6.63h6.6v6.63Z" />
      <path d="M39.43,35.02v6.62h-6.62v-6.62h6.62Z" />
      <path d="M21.69,23.91h6.61v6.61h-6.61v-6.61Z" />
      <path d="M39.43,23.91v6.61h-6.62v-6.61h6.62Z" />
      <path d="M11.66,3.91c0,1.11,0,2.21,0,3.31,0,.82-.04,1.64.07,2.44.26,1.87,1.99,3.23,3.83,3.1,1.97-.14,3.48-1.69,3.5-3.64.02-1.59,0-3.19,0-4.78,0-.14,0-.28,0-.45h11.87c0,.17,0,.31,0,.45,0,1.56,0,3.11,0,4.67,0,2.11,1.63,3.76,3.7,3.76,2.05,0,3.7-1.67,3.7-3.76,0-1.56,0-3.11,0-4.67,0-.14,0-.28,0-.41.05-.03.07-.05.1-.05,1.68.01,3.38-.07,5.05.05,2.77.2,4.86,2.71,4.87,5.66,0,4.01,0,8.01,0,12.02,0,7.49,0,14.99,0,22.48,0,2.78-1.77,5.02-4.42,5.59-.39.08-.8.12-1.2.12-11.25,0-22.51,0-33.76,0-.96,0-1.94.05-2.87-.12-2.68-.51-4.46-2.78-4.46-5.58,0-4.6,0-9.2,0-13.81,0-6.88,0-13.77,0-20.65,0-2.75,1.65-4.95,4.22-5.6.42-.11.87-.16,1.31-.17,1.4-.02,2.8,0,4.2,0,.09,0,.18.02.29.03ZM3.88,18.08c0,.18,0,.31,0,.43,0,8.52,0,17.04,0,25.55,0,2.12,1.41,3.52,3.54,3.52,11.73,0,23.47,0,35.2,0,2.08,0,3.5-1.41,3.5-3.48,0-8.53,0-17.06,0-25.59v-.43H3.88Z" />
    </svg>
  );
}

function VooReferenceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" aria-hidden="true" fill="currentColor">
      <path d="M16.73,46.52l5.55-3.76-1.6-16.3-16.9,6.15.39-5.17,4.92-3.5c0-1.81,0-5.3,1.65-6.47,1.86-1.32,2.94,1.63,3.28,2.99l6.38-4.46c.76-3.29.76-6.75,1.33-10.08.29-1.72,1.03-4.94,3.27-4.94s2.98,3.21,3.27,4.94c.57,3.33.58,6.8,1.33,10.08l6.38,4.46c.34-1.36,1.42-4.31,3.28-2.99,1.66,1.17,1.66,4.66,1.65,6.47l4.92,3.5.39,5.17-16.9-6.15-1.6,16.3,5.55,3.76v2.49h-16.54v-2.49Z" />
    </svg>
  );
}

function HospedagemReferenceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7.1A4 4 0 0 1 22 14.56V21h-2v-2H4v2H2v-6.44A4 4 0 0 1 4 11.1V4zm2 0v6h5V8a2 2 0 0 0-2-2H6zm7 6h5V4h-5v6zm-7 2a2 2 0 0 0-2 2v3h16v-3a2 2 0 0 0-2-2H6z" />
    </svg>
  );
}

function TransportesReferenceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM6 6h12v5H6V6z" />
    </svg>
  );
}

function ExperienciasReferenceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4z" />
    </svg>
  );
}

function RestaurantesReferenceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M4 2h1.15v7h.85V2h1.15v7H8V2h1.15v7H10V2h1.15v7.8c0 1.55-.9 2.88-2.15 3.5V22H6.15v-8.7C4.9 12.68 4 11.35 4 9.8V2z" />
      <path d="M17.8 2c1.45 1.1 2.2 3.7 2.2 6.6V22h-2.6v-7.4h-2.2c-.66 0-1.2-.54-1.2-1.2V8.6C14 5.7 15.3 2.85 17.8 2z" />
    </svg>
  );
}

function OrcamentoReferenceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M6 2h12a1 1 0 0 1 1 1v19l-3-2-3 2-3-2-3 2-3-2V3a1 1 0 0 1 1-1zm3 6h6V6H9v2zm0 4h6v-2H9v2zm0 4h4v-2H9v2z" />
    </svg>
  );
}

function TituloSecao({ titulo, Icone = RoteiroReferenceIcon }: { titulo: string; Icone?: ({ className }: { className?: string }) => JSX.Element }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold text-white sm:text-lg">
      <Icone className="h-7 w-7" />
      {titulo}
    </h2>
  );
}

interface Voo {
  id: number;
  companhia: string;
  numero: string;
  tipoTrecho?: "IDA" | "VOLTA";
  conexao?: number | null;
  data: string;
  origem: string;
  destino: string;
  partida: string;
  chegada: string;
  duracao: string;
  documento?: string | null;
  documentoTipo?: "pdf" | "imagem" | null;
}

interface ItemOrc {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
}

interface Pacote {
  id: number;
  operador: string;
  link: string;
  descricao: string;
  foto?: string | null;
  fotoNome?: string;
  valor?: number;
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
  pacotes?: Pacote[];
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

  if (texto.includes('resumo')) return 'text-[#e07b20]';
  if (texto.includes('dicas práticas')) return 'text-[#e07b20]';

  return 'text-[#0a0534]';
}

function RenderRoteiroTexto({ texto }: { texto: string }) {
  const linhas = normalizarTextoRoteiro(texto).split('\n');
  const primeiraLinhaComTexto = linhas.findIndex((linha) => limparLinhaRoteiro(linha).length > 0);

  return (
    <div className="space-y-2 text-[16px] leading-8 text-slate-700" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {linhas.map((linha, index) => {
        const textoLimpo = limparLinhaRoteiro(linha);
        const linhaOriginal = String(linha || '').trim();

        if (!textoLimpo) {
          return <div key={`space-${index}`} className="h-2" />;
        }

        if (index === primeiraLinhaComTexto) {
          return (
            <h3 key={`title-${index}`} className="text-2xl font-bold tracking-tight" style={{ color: COR_PRINCIPAL }}>
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

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataCurta(data?: string | null) {
  if (!data) return "Nao informado";
  const date = new Date(`${data}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Nao informado";
  return date.toLocaleDateString("pt-BR");
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
    return <span className="font-semibold" style={{ color: COR_DESTAQUE }}>Sua viagem começou!</span>;
  }

  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {timerComponents.map(([interval, value]) => (
        <div key={interval} className="min-w-0 text-center">
          <div className="rounded-xl bg-white/12 px-1 py-2 text-lg font-bold text-white shadow-md sm:py-3 sm:text-2xl">
            {String(value).padStart(2, '0')}
          </div>
          <div className="mt-1 truncate text-[10px] font-medium text-white/70 sm:text-xs">{interval}</div>
        </div>
      ))}
    </div>
  );
}

export default function RoteiroOrcamento() {
  const { numero } = useParams<{ numero: string }>();
  const [orc, setOrc] = useState<Orcamento | null>(null);
  const [itemAtivo, setItemAtivo] = useState<string>("pacotes");
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function carregarOrcamento() {
      if (!numero) {
        if (active) {
          setOrc(null);
          setErroCarregamento("Número do orçamento não informado.");
          setCarregando(false);
        }
        return;
      }

      setCarregando(true);
      setErroCarregamento(null);

      try {
        const orcamentoApi = await buscarOrcamentoPublico(numero);
        if (active) {
          setOrc(orcamentoApi);
          setCarregando(false);
        }
        return;
      } catch (error) {
        const stored = localStorage.getItem(`orc_${numero}`);

        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (active) {
              setOrc(parsed);
              setCarregando(false);
            }
            return;
          } catch {
            // segue para o estado de erro abaixo
          }
        }

        if (active) {
          setOrc(null);
          setErroCarregamento(error instanceof Error ? error.message : "Roteiro não disponível no momento.");
          setCarregando(false);
        }
      }
    }

    carregarOrcamento();

    return () => {
      active = false;
    };
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

  if (carregando) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">Carregando roteiro...</p>
        </Card>
      </div>
    );
  }

  if (!orc) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto">
        <Card className="p-4 text-center">
          <p className="text-sm text-gray-600">{erroCarregamento || "Roteiro não disponível."}</p>
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
  const fotoPacoteDestaque =
    (orc.pacotes || []).find((item) => typeof item?.foto === "string" && item.foto.trim())?.foto || "";
  const dataCheckinPrincipal = orc.hospedagem && orc.hospedagem.length > 0 ? orc.hospedagem[0].checkin : null;
  const dataCheckoutPrincipal = orc.hospedagem && orc.hospedagem.length > 0 ? orc.hospedagem[0].checkout : null;
  const dataViagemPrincipal = dataCheckinPrincipal || orc.voos?.[0]?.data || null;
  const listaPassageiros = Array.isArray(orc.passageiros)
    ? orc.passageiros.map((nome) => String(nome || "").trim()).filter(Boolean)
    : [];
  const passageirosTexto = listaPassageiros.length > 0 ? listaPassageiros.join(", ") : "Sem passageiros adicionais";
  const agente = orc.agenteViagem
    ? funcionarios.find((funcionario) => funcionario.name === orc.agenteViagem)
    : null;
  const nomeAgente = agente?.name || orc.agenteViagem;
  const saudacaoAgente = String(agente?.saudacoes || "").trim();
  const iniciaisAgente = nomeAgente
    ?.split(" ")
    .map((nome) => nome[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const itensRoteiro = [
    { id: "pacotes", titulo: "Pacotes", icone: OrcamentoReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.pacotes?.length) },
    { id: "voos", titulo: "Voos", icone: VooReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.voos?.length) },
    { id: "hospedagem", titulo: "Hospedagens", icone: HospedagemReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.hospedagem?.length) },
    { id: "roteiro", titulo: "Roteiro", icone: RoteiroReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.roteiro) },
    { id: "dia-a-dia", titulo: "Day by Day", icone: DayByDayReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.dayByDay?.length) },
    { id: "transporte", titulo: "Transportes", icone: TransportesReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.transporte?.length) },
    { id: "restaurantes", titulo: "Restaurantes", icone: RestaurantesReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.restaurante?.length) },
    { id: "experiencias", titulo: "Experiencias", icone: ExperienciasReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.experiencias?.length) },
    { id: "seguro", titulo: "Seguro", icone: RoteiroReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(orc.seguro?.length) },
    { id: "passageiros", titulo: "Passageiros", icone: RoteiroReferenceIcon, classe: "bg-[#0a0534] text-white hover:bg-[#140a4d]", disponivel: Boolean(listaPassageiros.length) },
  ].filter((item) => item.disponivel);

  const navegarParaItem = (id: string) => {
    setItemAtivo(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const abrirVoucherPdf = async (documento: string) => {
    try {
      const documentoNormalizado = documento.startsWith("data:")
        ? documento
        : `data:application/pdf;base64,${documento}`;

      const response = await fetch(documentoNormalizado);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");

      // Revoga a URL depois de um tempo para evitar vazamento de memória.
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      window.open(documento, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-4xl mx-auto min-h-screen bg-[#f0f0f0]" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div className="flex items-start justify-between mb-8">
        <div className="text-center flex-1 group">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full" style={{ backgroundColor: COR_PRINCIPAL, boxShadow: "0 4px 16px rgba(10,5,52,.25)" }}>
              <RoteiroReferenceIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h1
              className="text-2xl sm:text-4xl font-semibold tracking-tight"
              style={{ color: COR_PRINCIPAL }}
            >
              Roteiro da Sua Viagem
            </h1>
          </div>
          <p
            className="text-lg sm:text-xl mt-2 font-medium"
            style={{ color: COR_DESTAQUE }}
          >
            {possuiPlanejamentoBase ? `Preparado para ${destinoPrincipal}` : "Ainda não tem voo definido."}
          </p>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Check-in: {formatarDataCurta(dataCheckinPrincipal)} | Check-out: {formatarDataCurta(dataCheckoutPrincipal)}
          </p>
        </div>
        <button onClick={() => window.close()} className="p-2 text-[#0a0534] hover:text-[#e07b20] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {fotoPacoteDestaque && (
        <div className="mb-6 overflow-hidden rounded-xl border border-cyan-100 bg-white shadow-sm">
          <img src={fotoPacoteDestaque} alt="Foto do pacote" className="h-64 w-full object-cover sm:h-80" />
        </div>
      )}

      <Card className="p-4 mb-6 text-center" style={{ backgroundColor: COR_PRINCIPAL, color: "white" }}>
        <h2 className="font-bold mb-3" style={{ color: COR_DESTAQUE }}>Sr(a) {orc.cliente || "Cliente"}, falta para sua viagem:</h2>
        {dataViagemPrincipal ? (
          <Countdown targetDate={dataViagemPrincipal} />
        ) : (
          <p className="text-sm text-white/70">Data da viagem ainda não definida.</p>
        )}
      </Card>

      {itensRoteiro.length > 0 && (
        <nav aria-label="Itens do roteiro" className="mb-6 print:hidden">
          <p className="mb-3 text-center text-sm font-semibold text-gray-700">Itens do roteiro</p>
          <div className="flex flex-wrap items-start justify-center gap-4 px-1 pt-2 pb-3">
            {itensRoteiro.map(({ id, titulo, icone: Icone, classe }) => (
              <Button
                key={id}
                type="button"
                onClick={() => navegarParaItem(id)}
                title={titulo}
                aria-label={`Ir para ${titulo}`}
                className={`group relative h-auto w-20 shrink-0 border-0 bg-transparent p-0 shadow-none transition-all hover:-translate-y-0.5 ${itemAtivo === id ? "ring-0" : ""}`}
              >
                <span className="mx-auto flex w-full flex-col items-center gap-2">
                  <span className={`flex h-[66px] w-[66px] items-center justify-center rounded-full shadow-sm transition-all ${classe} ${itemAtivo === id ? "ring-2 ring-offset-2 ring-[#e07b20]" : ""}`}>
                    <Icone className="h-9 w-9" />
                  </span>
                  <span className="block text-center text-xs font-semibold text-[#0a0534]">{titulo}</span>
                </span>
              </Button>
            ))}
          </div>
        </nav>
      )}

      {/* PACOTES */}
      {orc.pacotes && orc.pacotes.length > 0 && itemAtivo === "pacotes" && (
        <Card id="pacotes" className="overflow-hidden mb-6 scroll-mt-4">
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Pacotes" Icone={OrcamentoReferenceIcon} />
          </div>
          <div className="p-4 space-y-3">
            {orc.pacotes.map((pacote: any, idx: number) => (
              <div key={pacote.id || idx} className="rounded-lg bg-gray-50 p-3">
                {pacote.descricao && <p className="text-sm text-gray-600">{pacote.descricao}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* VOOS */}
      {orc.voos && orc.voos.length > 0 && itemAtivo === "voos" && (
        <Card id="voos" className="overflow-hidden mb-6 scroll-mt-4">
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Voos" Icone={VooReferenceIcon} />
          </div>
          <div className="p-4 space-y-3">
            {orc.voos.map((voo: any) => (
              <div key={voo.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {voo.numero} - {voo.companhia}
                  </p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {voo.tipoTrecho || "IDA"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5">{voo.origem} → {voo.destino}</p>
                <p className="text-xs text-gray-500 mt-1.5">{voo.data} | {voo.partida} - {voo.chegada} ({voo.duracao})</p>
                {voo.documento && voo.documentoTipo === "pdf" && (
                  <div className="mt-3 border-t border-gray-200 pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void abrirVoucherPdf(String(voo.documento))}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Clique aqui para abrir o Voucher
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* HOSPEDAGEM */}
      {orc.hospedagem && orc.hospedagem.length > 0 && itemAtivo === "hospedagem" && (
        <Card id="hospedagem" className="overflow-hidden mb-6 scroll-mt-4">
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Hospedagens" Icone={HospedagemReferenceIcon} />
          </div>
          <div className="p-4 space-y-3">
            {orc.hospedagem.map((h: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                {typeof h.fotoHospedagem === "string" && h.fotoHospedagem.trim() && (
                  <a
                    href={h.fotoHospedagem}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-3 block overflow-hidden rounded-lg border border-gray-200"
                    title="Abrir foto da hospedagem"
                  >
                    <img
                      src={h.fotoHospedagem}
                      alt={`Foto da hospedagem ${h.nome || ""}`.trim() || "Foto da hospedagem"}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                )}
                <p className="font-medium text-gray-900">{h.nome}</p>
                <p className="text-xs text-gray-500">{h.local}</p>
                {h.endereco && <p className="text-xs text-gray-400">{h.endereco}</p>}
                <p className="text-sm font-medium text-indigo-600 mt-1">{formatarPeriodo(h.checkin, h.checkout)}</p>
                <p className="text-xs text-gray-600 mt-1">{h.tipoQuarto} • {h.noites} noite{h.noites !== 1 ? "s" : ""}</p>
                {h.voucher && (
                  <div className="mt-2 flex justify-end">
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
                      className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Clique aqui para abrir o Voucher
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ROTEIRO */}
      {orc.roteiro && itemAtivo === "roteiro" && (
        <Card id="roteiro" className="overflow-hidden mb-6 scroll-mt-4">
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Roteiro" />
          </div>
          <div className="p-4">
            <RenderRoteiroTexto texto={orc.roteiro} />
          </div>
        </Card>
      )}

      {/* DAY BY DAY */}
      {orc.dayByDay && orc.dayByDay.length > 0 && itemAtivo === "dia-a-dia" && (
        <Card id="dia-a-dia" className="overflow-hidden mb-6 scroll-mt-4">
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Day by Day" Icone={DayByDayReferenceIcon} />
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
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Transportes" Icone={TransportesReferenceIcon} />
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
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Restaurantes" Icone={RestaurantesReferenceIcon} />
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
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Experiencias" Icone={ExperienciasReferenceIcon} />
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
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Seguro" />
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
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Passageiros" />
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 leading-6">{passageirosTexto}</p>
          </div>
        </Card>
      )}

      {orc.observacoes && (
        <Card className="overflow-hidden mb-6">
          <div className="p-3" style={{ backgroundColor: COR_PRINCIPAL }}>
            <TituloSecao titulo="Observacoes" />
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
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {saudacaoAgente || "Planejo viagens personalizadas com atenção aos mínimos detalhes, unindo praticidade, conforto e segurança. Meu compromisso é transformar seus planos em experiências únicas, com suporte dedicado do início ao fim."}
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
