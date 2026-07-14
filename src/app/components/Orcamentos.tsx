import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Search, Plus, Edit2, Trash2, X, Check, FileText, ChevronDown, ChevronUp,
  User, Calendar, DollarSign, Send, Eye, Copy, MapPin, Printer, Sparkles, Link2, Star
} from "lucide-react"; // Adicionado Sparkles
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import VoosForm from "./VoosForm";
import HospedagemForm from "./HospedagemForm";
import RoteiroForm from "./RoteiroForm";
import DayByDayForm from "./DayByDayForm";
import TransporteForm from "./TransporteForm";
import RestauranteForm from "./RestauranteForm";
import ExperienciasForm from "./ExperienciasForm";
import SeguroForm from "./SeguroForm";
import { obterClientes } from "../data/clientes";
import { listarFuncionarios, type Funcionario } from "../data/funcionariosApi";

type StatusOrc = "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado" | "Cancelado";

interface ItemOrc {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
  link?: string;
  documentos?: DocumentoVenda[];
}

interface DocumentoVenda {
  id: number;
  nome: string;
  tipo: string;
  arquivo: string;
}

interface Orcamento {
  id: number;
  numero: string;
  cliente: string;
  email: string;
  agenteViagem?: string;
  status: StatusOrc;
  dataCriacao: string;
  dataValidade: string;
  observacoes: string;
  itens: ItemOrc[];
  voos?: any[];
  hospedagem?: any[];
  roteiro?: string;
  dayByDay?: any[];
  transporte?: any[];
  restaurante?: any[];
  experiencias?: any[];
  seguro?: any[];
}

const itemVazio = (): ItemOrc => ({ id: Date.now(), descricao: "", quantidade: 1, unidade: "un", valorUnitario: 0, desconto: 0, link: "", documentos: [] });

const dados: Orcamento[] = [
  {
    id: 1, numero: "25060101", cliente: "Ana Paula Souza", email: "ana@email.com",
    status: "Aprovado", dataCriacao: "2025-06-01", dataValidade: "2025-07-01", observacoes: "",
    itens: [
      { id: 1, descricao: "Chip Vivo Roaming Internacional", quantidade: 1, unidade: "un", valorUnitario: 350.00, desconto: 0 },
    ],
    // Dados mocados adicionados
    voos: [
      { id: 1, companhia: "Air France", numero: "AF457", data: "2025-09-10", origem: "São Paulo (GRU)", destino: "Paris (CDG)", partida: "18:05", chegada: "10:35", duracao: "11h 30min" },
      { id: 2, companhia: "Air France", numero: "AF454", data: "2025-09-20", origem: "Paris (CDG)", destino: "São Paulo (GRU)", partida: "23:25", chegada: "06:10", duracao: "11h 45min" }
    ],
    hospedagem: [
      { id: 1, nome: "Hôtel Le Marais", local: "Paris, França", endereco: "Rue de Rivoli, 75004 Paris", checkin: "2025-09-11", checkout: "2025-09-20", tipoQuarto: "Quarto Duplo Superior com Vista", preco: 12500, noites: 9, classificacao: 4.5, amenidades: ["WiFi Grátis", "Café da Manhã", "Ar Condicionado"], voucher: null, voucherTipo: null, voucherNome: "" }
    ],
    roteiro: `**Uma Viagem Inesquecível a Paris!**

Prepare-se para explorar a Cidade Luz em uma jornada de 10 dias repleta de cultura, gastronomia e momentos mágicos.

**Destaques:**
- Visita aos icônicos Museu do Louvre e Torre Eiffel.
- Passeios charmosos pelos bairros de Le Marais e Montmartre.
- Cruzeiro pelo Rio Sena ao entardecer.
- Experiências gastronômicas em bistrôs tradicionais.

Este roteiro foi cuidadosamente planejado para oferecer uma imersão completa na beleza e na história de Paris.`,
    dayByDay: [
      { id: 1, data: "2025-09-11", titulo: "Chegada e Exploração de Le Marais", atividades: [
        { id: 1, hora: "12:00", descricao: "Check-in no Hôtel Le Marais.", tipo: "Hospedagem" },
        { id: 2, hora: "14:00", descricao: "Almoço no L'As du Fallafel.", tipo: "Almoço" },
        { id: 3, hora: "16:00", descricao: "Passeio pela Place des Vosges.", tipo: "Passeio" }
      ]},
      { id: 2, data: "2025-09-12", titulo: "Arte e Cultura", atividades: [
        { id: 1, hora: "09:00", descricao: "Visita guiada ao Museu do Louvre.", tipo: "Cultural" },
        { id: 2, hora: "13:00", descricao: "Almoço próximo ao museu.", tipo: "Almoço" }
      ]}
    ],
    transporte: [
      { id: 1, tipo: "Transfer", empresa: "Paris Shuttle", diaRoteiro: "1", origem: "Aeroporto CDG", destino: "Hôtel Le Marais", dataHoraSaida: "2025-09-11T11:00", valor: 350, descricao: "Transfer privado para o hotel." }
    ],
    restaurante: [
      { id: 1, nome: "Le Bouillon Chartier", local: "Paris, França", endereco: "7 Rue du Faubourg Montmartre, 75009 Paris", tipoCozinha: "Francesa", data: "2025-09-12", horario: "20:00", qtdPessoas: 2, preco: 250, telefone: "+33 1 47 70 86 29", website: "https://www.bouillon-chartier.com", observacoes: "Reserva para o jantar.", voucher: null, voucherTipo: null, voucherNome: "" },
      { id: 2, nome: "L'Ambroisie", local: "Paris, França", endereco: "9 Place des Vosges, 75004 Paris", tipoCozinha: "Francesa", data: "2025-09-15", horario: "21:00", qtdPessoas: 2, preco: 1800, telefone: "+33 1 42 78 51 45", website: "", observacoes: "Reserva especial de comemoração.", voucher: null, voucherTipo: null, voucherNome: "" }
    ],
    experiencias: [
      { id: 1, nome: "Tour Guiado no Museu do Louvre", local: "Paris, França", tipo: "Cultural", data: "2025-09-12", horario: "09:00", duracao: "3h", qtdPessoas: 2, preco: 450, descricao: "Tour com guia especializado nas principais obras.", inclui: "Ingresso e guia", observacoes: "", voucher: null, voucherTipo: null, voucherNome: "" },
      { id: 2, nome: "Passeio de Barco no Rio Sena", local: "Paris, França", tipo: "Passeio Turístico", data: "2025-09-13", horario: "19:00", duracao: "1h", qtdPessoas: 2, preco: 150, descricao: "Passeio ao entardecer com vista para a Torre Eiffel.", inclui: "Ticket do barco", observacoes: "", voucher: null, voucherTipo: null, voucherNome: "" }
    ],
  },
  {
    id: 2, numero: "25061501", cliente: "Carlos Mendes", email: "carlos@empresa.com",
    status: "Enviado", dataCriacao: "2025-06-15", dataValidade: "2025-07-15", observacoes: "",
    itens: [
      { id: 1, descricao: "Cadeira Ergonômica", quantidade: 5, unidade: "un", valorUnitario: 1299.00, desconto: 10 },
    ],
    dayByDay: [
      { id: 1, data: "2025-08-01", titulo: "Instalação Mobiliário", atividades: [
        { id: 1, hora: "09:00", descricao: "Entrega das cadeiras no escritório.", tipo: "Entrega" },
        { id: 2, hora: "10:00", descricao: "Montagem e distribuição das cadeiras.", tipo: "Serviço" },
        { id: 3, hora: "12:00", descricao: "Finalização e aceite do cliente.", tipo: "Finalização" }
      ]}
    ],
  },
  {
    id: 3, numero: "25070101", cliente: "Fernanda Lima", email: "fernanda@loja.com",
    status: "Rascunho", dataCriacao: "2025-07-01", dataValidade: "2025-08-01", observacoes: "Aguardando confirmação de modelo.",
    itens: [
      { id: 1, descricao: "Serviço de Consultoria", quantidade: 10, unidade: "h", valorUnitario: 250.00, desconto: 0 },
      { id: 2, descricao: "Relatório Técnico", quantidade: 1, unidade: "un", valorUnitario: 800.00, desconto: 0 },
    ],
  },
  {
    id: 4, numero: "25052001", cliente: "João Victor Reis", email: "joao@mail.com",
    status: "Rejeitado", dataCriacao: "2025-05-20", dataValidade: "2025-06-20", observacoes: "",
    itens: [
      { id: 1, descricao: "Licença Software Anual", quantidade: 1, unidade: "un", valorUnitario: 3500.00, desconto: 0 },
    ],
  },
];

const statusConfig: Record<StatusOrc, { bg: string; cor: string }> = {
  Rascunho:  { bg: "bg-gray-100",   cor: "text-gray-600" },
  Enviado:   { bg: "bg-blue-100",   cor: "text-blue-700" },
  Aprovado:  { bg: "bg-green-100",  cor: "text-green-700" },
  Rejeitado: { bg: "bg-red-100",    cor: "text-red-600" },
  Cancelado: { bg: "bg-orange-100", cor: "text-orange-600" },
};

const allStatus: StatusOrc[] = ["Rascunho", "Enviado", "Aprovado", "Rejeitado", "Cancelado"];
const secoesOrcamento = ["Voos", "Hospedagem", "Roteiro", "Day by Day", "Transporte", "Restaurante", "Experiências", "Seguro", "Vendas"] as const;
type SecaoOrcamento = typeof secoesOrcamento[number];

function calcItem(item: ItemOrc) {
  const bruto = item.quantidade * item.valorUnitario;
  const desc = bruto * (item.desconto / 100);
  return bruto - desc;
}

function calcTotal(itens: ItemOrc[]) {
  return itens.reduce((acc, i) => acc + calcItem(i), 0);
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtData(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function gerarNumero(lista: Orcamento[]) {
  // New format: <aammdd><NN> where NN is incremental starting at 01 per day
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePart = `${yy}${mm}${dd}`;

  // Look for existing numbers that match the new pattern for today and extract their sequence
  const regex = new RegExp(`^${datePart}(\\d{2})$`);
  const seqNums = lista
    .map((o) => {
      const m = String(o.numero).match(regex);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  const next = seqNums.length > 0 ? Math.max(...seqNums) + 1 : 1;
  const seq = String(next).padStart(2, "0");
  return `${datePart}${seq}`;
}

type Tela = "lista" | "form" | "preview";

const orcVazio = (): Omit<Orcamento, "id"> => ({
  numero: "", cliente: "", email: "", agenteViagem: "", status: "Rascunho",
  dataCriacao: new Date().toISOString().split("T")[0],
  dataValidade: "", observacoes: "", itens: [itemVazio()],
});

export default function Orcamentos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lista, setLista] = useState<Orcamento[]>(dados);
  const [tela, setTela] = useState<Tela>("lista");
  const [editando, setEditando] = useState<Orcamento | null>(null);
  const [form, setForm] = useState<Omit<Orcamento, "id">>(orcVazio());
  const [preview, setPreview] = useState<Orcamento | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOrc | "Todos">("Todos");
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [section, setSection] = useState<SecaoOrcamento>("Voos");
  const [voos, setVoos] = useState<any[]>([]);
  const [hospedagem, setHospedagem] = useState<any[]>([]);
  const [roteiro, setRoteiro] = useState<string>("");
  const [dayByDay, setDayByDay] = useState<any[]>([]);
  const [transporte, setTransporte] = useState<any[]>([]);
  const [gerandoRoteiro, setGerandoRoteiro] = useState(false); // Estado de loading para a IA
  const [restaurante, setRestaurante] = useState<any[]>([]);
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [seguro, setSeguro] = useState<any[]>([]);
  const [funcionariosAtivos, setFuncionariosAtivos] = useState<Funcionario[]>([]);
  const clientesAtivos = obterClientes().filter((cliente) => cliente.status === "Ativo");

  useEffect(() => {
    let mounted = true;

    async function carregarFuncionarios() {
      try {
        const funcionarios = await listarFuncionarios();
        if (mounted) {
          setFuncionariosAtivos(funcionarios.filter((funcionario) => funcionario.status === "Ativo"));
        }
      } catch {
        if (mounted) {
          setFuncionariosAtivos([]);
        }
      }
    }

    carregarFuncionarios();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle state params from ResumoOrcamentos
  useEffect(() => {
    const state = location.state as any;
    if (state?.previewId) {
      const orc = lista.find(o => o.id === state.previewId);
      if (orc) {
        setPreview(orc);
        setTela("preview");
        // Clear state to prevent reopening on refresh
        navigate(location.pathname, { replace: true });
      }
    } else if (state?.editId) {
      const orc = lista.find(o => o.id === state.editId);
      if (orc) {
        setEditando(orc);
        setForm({ numero: orc.numero, cliente: orc.cliente, email: orc.email, agenteViagem: orc.agenteViagem || "", status: orc.status, dataCriacao: orc.dataCriacao, dataValidade: orc.dataValidade, observacoes: orc.observacoes, itens: orc.itens.map((i) => ({ ...i, link: i.link || "", documentos: i.documentos || [] })) });
        setTela("form");
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state]);

  // --- lista helpers ---
  const filtrados = lista.filter((o) => {
    const q = busca.toLowerCase();
    const match = o.numero.toLowerCase().includes(q) || o.cliente.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    return match && (filtroStatus === "Todos" || o.status === filtroStatus);
  });

  const totais = {
    total: lista.reduce((a, o) => a + calcTotal(o.itens), 0),
    aprovados: lista.filter((o) => o.status === "Aprovado").reduce((a, o) => a + calcTotal(o.itens), 0),
    pendentes: lista.filter((o) => o.status === "Enviado").length,
  };

  function toggleExpandir(id: number) {
    setExpandidos((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const [favoritos, setFavoritos] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("favoritos_orcamentos") || "[]"); }
    catch { return []; }
  });

  function toggleFavorito(id: number) {
    setFavoritos((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("favoritos_orcamentos", JSON.stringify(next));
      window.dispatchEvent(new Event("favoritos_orcamentos_updated"));
      return next;
    });
  }

  function abrirNovo() {
    setEditando(null);
    // Limpa o formulário principal e as seções
    setForm({ ...orcVazio(), numero: gerarNumero(lista) });
    setVoos([]);
    setHospedagem([]);
    setRoteiro("");
    setDayByDay([]);
    setTransporte([]);
    setRestaurante([]);
    setExperiencias([]);
    setSeguro([]);
    setTela("form");
  }

  function abrirEdicao(o: Orcamento) {
    setEditando(o);
    setForm({ numero: o.numero, cliente: o.cliente, email: o.email, agenteViagem: o.agenteViagem || "", status: o.status, dataCriacao: o.dataCriacao, dataValidade: o.dataValidade, observacoes: o.observacoes, itens: o.itens.map((i) => ({ ...i, link: i.link || "", documentos: i.documentos || [] })) });
    // Carrega os dados das seções para os estados correspondentes
    setVoos(o.voos || []);
    setHospedagem(o.hospedagem || []);
    setRoteiro(o.roteiro || "");
    setDayByDay(o.dayByDay || []);
    setTransporte(o.transporte || []);
    setRestaurante(o.restaurante || []);
    setExperiencias(o.experiencias || []);
    setSeguro(o.seguro || []);
    setTela("form");
  }

  function abrirPreview(o: Orcamento) { setPreview(o); setTela("preview"); }

  function voltar() { setTela("lista"); setEditando(null); setPreview(null); }

  function salvar() {
    if (!form.cliente.trim()) return null;
    
    // Montar dados do orçamento com seções
    const orcComSecoes = {
      ...form,
      voos: voos.length > 0 ? voos : undefined,
      hospedagem: hospedagem.length > 0 ? hospedagem : undefined,
      roteiro: roteiro.trim() ? roteiro : undefined,
      dayByDay: dayByDay.length > 0 ? dayByDay : undefined,
      transporte: transporte.length > 0 ? transporte : undefined,
      restaurante: restaurante.length > 0 ? restaurante : undefined,
      experiencias: experiencias.length > 0 ? experiencias : undefined,
      seguro: seguro.length > 0 ? seguro : undefined,
    };
    
    if (editando) {
      setLista((prev) => prev.map((o) => (o.id === editando.id ? { ...editando, ...orcComSecoes } : o)));
      voltar();
      return editando.id;
    } else {
      const id = lista.length > 0 ? Math.max(...lista.map((o) => o.id)) + 1 : 1;
      const novo = { id, ...orcComSecoes };
      setLista((prev) => [...prev, novo]);
      voltar();
      return id;
    }
  }

  function duplicar(o: Orcamento) {
    const id = lista.length > 0 ? Math.max(...lista.map((x) => x.id)) + 1 : 1;
    const novo: Orcamento = { ...o, id, numero: gerarNumero([...lista, o]), status: "Rascunho", dataCriacao: new Date().toISOString().split("T")[0] };
    setLista((prev) => [...prev, novo]);
  }

  function gerarRoteiro(orc: Orcamento | null = null) {
    const orcParaAbrir = orc || (editando ? editando : null);
    if (!orcParaAbrir) return;
    
    // Montar dados do orçamento com seções atualizadas
    const orcComSecoes = {
      ...orcParaAbrir,
      voos: voos.length > 0 ? voos : orcParaAbrir.voos,
      hospedagem: hospedagem.length > 0 ? hospedagem : orcParaAbrir.hospedagem,
      roteiro: roteiro.trim() ? roteiro : orcParaAbrir.roteiro,
      dayByDay: dayByDay.length > 0 ? dayByDay : orcParaAbrir.dayByDay,
      transporte: transporte.length > 0 ? transporte : orcParaAbrir.transporte,
      restaurante: restaurante.length > 0 ? restaurante : orcParaAbrir.restaurante,
      experiencias: experiencias.length > 0 ? experiencias : orcParaAbrir.experiencias,
      seguro: seguro.length > 0 ? seguro : orcParaAbrir.seguro,
    };
    
    // Store in localStorage to access from new tab
    localStorage.setItem(`orc_${orcComSecoes.numero}`, JSON.stringify(orcComSecoes));
    // Open roteiro in new tab using numero (not id)
    window.open(`/financeiro/orcamentos/roteiro/${orcComSecoes.numero}`, "_blank");
  }

  function abrirResumo(orc: Orcamento | null = null) {
    const orcParaAbrir = orc || (editando ? { id: editando.id, ...form } : null);
    if (!orcParaAbrir) return;

    const orcComSecoes = {
      ...orcParaAbrir,
      voos: voos.length > 0 ? voos : orcParaAbrir.voos,
      hospedagem: hospedagem.length > 0 ? hospedagem : orcParaAbrir.hospedagem,
      roteiro: roteiro.trim() ? roteiro : orcParaAbrir.roteiro,
      dayByDay: dayByDay.length > 0 ? dayByDay : orcParaAbrir.dayByDay,
      transporte: transporte.length > 0 ? transporte : orcParaAbrir.transporte,
      restaurante: restaurante.length > 0 ? restaurante : orcParaAbrir.restaurante,
      experiencias: experiencias.length > 0 ? experiencias : orcParaAbrir.experiencias,
      seguro: seguro.length > 0 ? seguro : orcParaAbrir.seguro,
    };

    // Armazena no localStorage para acessar na nova aba
    localStorage.setItem(`orc_${orcComSecoes.numero}`, JSON.stringify(orcComSecoes));
    window.open(`/financeiro/orcamentos/resumo/${orcComSecoes.numero}`, "_blank");
  }

  function gerarOrcamento(orc: Orcamento | null = null) {
    const orcParaAbrir = orc || (editando ? editando : null);
    if (!orcParaAbrir) return;
    setPreview(orcParaAbrir);
    setTela("preview");
    setTimeout(() => window.print(), 500); // Aguarda a renderização antes de imprimir
  }

  function excluir(id: number) { setLista((prev) => prev.filter((o) => o.id !== id)); setConfirmarExclusao(null); }

  // --- itens do form ---
  function addItem() { setForm((f) => ({ ...f, itens: [...f.itens, itemVazio()] })); }
  function removeItem(id: number) { setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) })); }
  function updateItem(id: number, field: keyof ItemOrc, value: string | number) {
    setForm((f) => ({ ...f, itens: f.itens.map((i) => i.id === id ? { ...i, [field]: value } : i) }));
  }

  async function uploadDocumentosVenda(idItem: number, e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    if (arquivos.length === 0) return;

    const docs = await Promise.all(
      arquivos.map(
        (arquivo) =>
          new Promise<DocumentoVenda>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: Date.now() + Math.floor(Math.random() * 10000),
                nome: arquivo.name,
                tipo: arquivo.type,
                arquivo: String(reader.result || ""),
              });
            };
            reader.onerror = () => reject(new Error("Falha ao carregar documento."));
            reader.readAsDataURL(arquivo);
          })
      )
    );

    setForm((f) => ({
      ...f,
      itens: f.itens.map((item) =>
        item.id === idItem
          ? { ...item, documentos: [...(item.documentos || []), ...docs] }
          : item
      ),
    }));
    e.target.value = "";
  }

  function removerDocumentoVenda(idItem: number, idDocumento: number) {
    setForm((f) => ({
      ...f,
      itens: f.itens.map((item) =>
        item.id === idItem
          ? { ...item, documentos: (item.documentos || []).filter((doc) => doc.id !== idDocumento) }
          : item
      ),
    }));
  }

  // --- Geração de Roteiro com IA (Simulação) ---
  async function gerarRoteiroComIA() {
    setGerandoRoteiro(true);

    // 1. Coletar dados do formulário para enviar à IA
    const hotelInfo = hospedagem[0] ? `em ${hospedagem[0].nomeHotel} (${hospedagem[0].cidade})` : '';
    const vooInfo = voos[0] ? `com voo de ${voos[0].origem} para ${voos[0].destino} no dia ${fmtData(voos[0].dataIda)}` : '';
    const prompt = `Crie uma sugestão de roteiro de viagem para ${form.cliente} ${vooInfo} ${hotelInfo}. O roteiro deve ser um texto descritivo e envolvente.`;

    console.log("Enviando para IA (simulado):", prompt);

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("Chave da API do Gemini não encontrada. Verifique o arquivo .env");
      setRoteiro("ERRO: A chave da API do Google Gemini não foi configurada em VITE_GEMINI_API_KEY no arquivo .env.");
      setGerandoRoteiro(false);
      return;
    }

    try {
      // 2. Chamada direta para a API do Google Gemini
      // Substitua 'gemini-1.0-pro' pelo modelo que você está usando, se for diferente.
      // A URL pode variar dependendo da sua região e projeto.
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro da API Gemini:", errorData);
        throw new Error(`Erro na API: ${errorData.error?.message || 'Resposta inválida'}`);
      }

      const data = await response.json();
      // Extrai o texto da resposta da API do Gemini
      const roteiroGerado = data.candidates[0].content.parts[0].text;
      setRoteiro(roteiroGerado);

    } catch (error) {
      console.error("Falha ao gerar roteiro com IA:", error);
      setRoteiro(`Ocorreu um erro ao tentar gerar o roteiro com a IA. Detalhes: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setGerandoRoteiro(false);
    }
  }

  // ============ TELA PREVIEW ============
  if (tela === "preview" && preview) {
    const total = calcTotal(preview.itens);
    const totalBruto = preview.itens.reduce((a, i) => a + i.quantidade * i.valorUnitario, 0);
    const totalDesc = totalBruto - total;
    return (
      <div>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Button variant="outline" onClick={voltar} className="flex items-center gap-2"><X className="w-4 h-4" /> Fechar</Button>
          <h2 className="text-xl font-bold text-gray-900">Visualização do Orçamento</h2>
          <Button onClick={() => abrirResumo(preview)} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <FileText className="w-4 h-4" /> Resumo do Orçamento
          </Button>
          <Button onClick={() => gerarOrcamento(preview)} className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2">
            <Printer className="w-4 h-4" /> Gerar Orçamento
          </Button>
          <Button
            onClick={() => gerarRoteiro(preview)}
            disabled={preview.status !== "Aprovado"}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title={preview.status !== "Aprovado" ? "O orçamento precisa estar Aprovado" : "Gerar Roteiro"}
          >
            <MapPin className="w-4 h-4" /> Gerar Roteiro
          </Button>
        </div>
        <Card className="max-w-3xl mx-auto p-8">
          {/* Cabeçalho do orçamento */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-indigo-700">{preview.numero}</h1>
              <p className="text-gray-500 text-sm mt-1">Emitido em {fmtData(preview.dataCriacao)} · Válido até {fmtData(preview.dataValidade)}</p>
            </div>
            <Badge className={`${statusConfig[preview.status].bg} ${statusConfig[preview.status].cor} text-sm px-3 py-1`}>{preview.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Cliente</p>
              <p className="font-semibold text-gray-900">{preview.cliente}</p>
              <p className="text-sm text-gray-500">{preview.email}</p>
            </div>
          </div>

          {/* Itens */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-indigo-200">
                <th className="text-left py-2 text-gray-600 font-semibold">Descrição</th>
                <th className="text-center py-2 text-gray-600 font-semibold w-16">Qtd</th>
                <th className="text-center py-2 text-gray-600 font-semibold w-12">Un</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">Unit.</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-16">Desc.</th>
                <th className="text-right py-2 text-gray-600 font-semibold w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {preview.itens.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  <td className="py-2.5 text-gray-800">{item.descricao}</td>
                  <td className="py-2.5 text-center text-gray-600">{item.quantidade}</td>
                  <td className="py-2.5 text-center text-gray-500">{item.unidade}</td>
                  <td className="py-2.5 text-right text-gray-600">{moeda(item.valorUnitario)}</td>
                  <td className="py-2.5 text-right text-orange-500">{item.desconto > 0 ? `${item.desconto}%` : "—"}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">{moeda(calcItem(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totais */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{moeda(totalBruto)}</span></div>
              {totalDesc > 0 && <div className="flex justify-between text-sm text-orange-500"><span>Descontos</span><span>- {moeda(totalDesc)}</span></div>}
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2"><span>Total</span><span className="text-indigo-700">{moeda(total)}</span></div>
            </div>
          </div>

          {preview.observacoes && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Observações</p>
              <p className="text-sm text-yellow-800">{preview.observacoes}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ============ TELA FORMULÁRIO ============
  if (tela === "form") {
    const itensVendaComDescricao = form.itens.filter((item) => item.descricao.trim());
    const totalHospedagemResumo = hospedagem.reduce((acc, item) => acc + (Number(item?.preco) || 0), 0);
    const totalTransporteResumo = transporte.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
    const totalRestauranteResumo = restaurante.reduce((acc, item) => acc + (Number(item?.preco) || 0), 0);
    const totalExperienciasResumo = experiencias.reduce((acc, item) => acc + (Number(item?.preco) || 0), 0);
    const totalSeguroResumo = seguro.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
    const totalVendasResumo = itensVendaComDescricao.reduce((acc, item) => acc + calcItem(item), 0);
    const totalResumo = totalVendasResumo
      + totalHospedagemResumo
      + totalTransporteResumo
      + totalRestauranteResumo
      + totalExperienciasResumo
      + totalSeguroResumo;
    const resumoSecoes: { nome: SecaoOrcamento; quantidade: number; valor: string }[] = [
      { nome: "Voos", quantidade: voos.length, valor: "—" },
      { nome: "Hospedagem", quantidade: hospedagem.length, valor: moeda(totalHospedagemResumo) },
      { nome: "Roteiro", quantidade: roteiro.trim() ? 1 : 0, valor: roteiro.trim() ? "Preenchido" : "—" },
      { nome: "Day by Day", quantidade: dayByDay.length, valor: "—" },
      { nome: "Transporte", quantidade: transporte.length, valor: moeda(totalTransporteResumo) },
      { nome: "Restaurante", quantidade: restaurante.length, valor: moeda(totalRestauranteResumo) },
      { nome: "Experiências", quantidade: experiencias.length, valor: moeda(totalExperienciasResumo) },
      { nome: "Seguro", quantidade: seguro.length, valor: moeda(totalSeguroResumo) },
    ];
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={voltar} className="flex items-center gap-2"><X className="w-4 h-4" /> Cancelar</Button>
          <h2 className="text-xl font-bold text-gray-900">{editando ? `Editar ${editando.numero}` : "Novo Orçamento"}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do cliente */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-indigo-500" /> Dados do Cliente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="cliente">Cliente *</Label>
                  <select
                    id="cliente"
                    value={form.cliente}
                    onChange={(e) => {
                      const cliente = clientesAtivos.find((item) => item.nome === e.target.value);
                      setForm({ ...form, cliente: cliente?.nome ?? "", email: cliente?.email ?? "" });
                    }}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientesAtivos.map((cliente) => (
                      <option key={cliente.id} value={cliente.nome}>{cliente.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Button type="button" variant="outline" onClick={() => navigate("/cadastros/clientes")} className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Cadastrar cliente
                  </Button>
                </div>
                <div>
                  <Label htmlFor="agente-viagem">Agente de Viagem</Label>
                  <select
                    id="agente-viagem"
                    value={form.agenteViagem || ""}
                    onChange={(e) => setForm({ ...form, agenteViagem: e.target.value })}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="">Selecione um agente</option>
                    {funcionariosAtivos.map((funcionario) => (
                      <option key={funcionario.id} value={funcionario.name}>{funcionario.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Button type="button" variant="outline" onClick={() => navigate("/funcionario")} className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Cadastrar funcionário
                  </Button>
                </div>
              </div>
            </Card>

            {/* Seções do orçamento (sub-páginas) */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4"><FileText className="w-4 h-4 text-indigo-500 inline-block mr-2" /> Seções do Orçamento</h3>

              <div className="mb-3">
                <div className="flex flex-wrap gap-2 text-sm">
                  {secoesOrcamento.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSection(s)}
                      className={`whitespace-nowrap px-3 py-2 rounded-md ${section === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                {section === 'Voos' && (
                  <VoosForm voos={voos} onVoosChange={setVoos} />
                )}

                {section === 'Hospedagem' && (
                  <HospedagemForm hospedagens={hospedagem} onHospedagensChange={setHospedagem} />
                )}

                {section === 'Roteiro' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="roteiro-texto">Descrição do Roteiro</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={gerarRoteiroComIA}
                        disabled={gerandoRoteiro}
                        className="flex items-center gap-2 text-indigo-600 border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Sparkles className={`w-4 h-4 ${gerandoRoteiro ? 'animate-spin' : ''}`} /> {gerandoRoteiro ? 'Gerando...' : 'Gerar com IA'}
                      </Button>
                    </div>
                    <RoteiroForm roteiro={roteiro} onRoteiroChange={setRoteiro} />
                  </div>
                )}

                {section === 'Day by Day' && (
                  <DayByDayForm dayByDay={dayByDay} onDayByDayChange={setDayByDay} />
                )}

                {section === 'Transporte' && (
                  <TransporteForm transportes={transporte} onTransportesChange={setTransporte} />
                )}

                {section === 'Restaurante' && (
                  <RestauranteForm restaurantes={restaurante} onRestaurantesChange={setRestaurante} />
                )}

                {section === 'Experiências' && (
                  <ExperienciasForm experiencias={experiencias} onExperienciasChange={setExperiencias} />
                )}

                {section === 'Seguro' && (
                  <SeguroForm seguros={seguro} onSegurosChange={setSeguro} />
                )}

                {section === 'Vendas' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Itens relacionados à venda (produtos/serviços).</p>
                    <div className="space-y-3">
                      {form.itens.map((item, idx) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-400">Item {idx + 1}</span>
                            {form.itens.length > 1 && (
                              <button onClick={() => removeItem(item.id)} className="p-1 rounded text-red-400 hover:bg-red-50"><X className="w-3.5 h-3.5" /></button>
                            )}
                          </div>
                          <div className="grid grid-cols-6 gap-2">
                            <div className="col-span-6">
                              <Input value={item.descricao} onChange={(e) => updateItem(item.id, "descricao", e.target.value)} placeholder="Descrição do item / serviço" />
                            </div>
                            <div className="col-span-2">
                              <Input type="number" min="1" value={item.quantidade} onChange={(e) => updateItem(item.id, "quantidade", parseFloat(e.target.value) || 1)} placeholder="Qtd" />
                            </div>
                            <div className="col-span-1">
                              <Input value={item.unidade} onChange={(e) => updateItem(item.id, "unidade", e.target.value)} placeholder="Un" />
                            </div>
                            <div className="col-span-2">
                              <Input type="number" min="0" step="0.01" value={item.valorUnitario} onChange={(e) => updateItem(item.id, "valorUnitario", parseFloat(e.target.value) || 0)} placeholder="Valor unit." />
                            </div>
                            <div className="col-span-1">
                              <Input type="number" min="0" max="100" value={item.desconto} onChange={(e) => updateItem(item.id, "desconto", parseFloat(e.target.value) || 0)} placeholder="% desc" />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                              <Label htmlFor={`item-link-${item.id}`} className="text-xs text-gray-500">Link</Label>
                              <div className="relative mt-1">
                                <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                  id={`item-link-${item.id}`}
                                  value={item.link || ""}
                                  onChange={(e) => updateItem(item.id, "link", e.target.value)}
                                  placeholder="https://..."
                                  className="pl-8"
                                />
                              </div>
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                              <Label htmlFor={`item-documentos-${item.id}`} className="text-xs text-gray-500">Downloads de documentos</Label>
                              <Input
                                id={`item-documentos-${item.id}`}
                                type="file"
                                multiple
                                onChange={(e) => uploadDocumentosVenda(item.id, e)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          {(item.documentos || []).length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              {(item.documentos || []).map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-2.5 py-2 text-xs">
                                  <a
                                    href={doc.arquivo}
                                    download={doc.nome}
                                    className="truncate text-indigo-600 hover:text-indigo-700"
                                  >
                                    {doc.nome}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removerDocumentoVenda(item.id, doc.id)}
                                    className="ml-2 rounded p-1 text-red-500 hover:bg-red-50"
                                    title="Remover documento"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-right text-sm font-semibold text-indigo-700 mt-2">
                            {moeda(calcItem(item))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button onClick={addItem} className="mt-3 w-full border-2 border-dashed border-indigo-200 rounded-lg py-2.5 text-sm text-indigo-600 font-medium hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Adicionar item
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Observações */}
            <Card className="p-5">
              <Label htmlFor="obs">Observações</Label>
              <textarea id="obs" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="" rows={3} className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none" />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" /> Detalhes</h3>
              <div className="space-y-4">
                <div>
                  <Label>Número</Label>
                  <Input value={form.numero} readOnly disabled className="mt-1 font-mono bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <Label htmlFor="dataCriacao">Data de emissão</Label>
                  <Input id="dataCriacao" type="date" value={form.dataCriacao} onChange={(e) => setForm({ ...form, dataCriacao: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="dataValidade">Válido até</Label>
                  <Input id="dataValidade" type="date" value={form.dataValidade} onChange={(e) => setForm({ ...form, dataValidade: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as StatusOrc })}
                    className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    {allStatus.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Resumo de valores */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-indigo-500" /> Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="space-y-1.5">
                  {resumoSecoes.map((secao) => (
                    <div key={secao.nome} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-2.5 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex h-6 min-w-8 items-center justify-center rounded bg-indigo-100 px-2 text-xs font-semibold text-indigo-700">
                          {secao.quantidade}x
                        </span>
                        <span className="truncate text-gray-700">{secao.nome}</span>
                      </div>
                      <span className="text-right font-medium text-gray-700">{secao.valor}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {itensVendaComDescricao.length > 0 ? (
                    itensVendaComDescricao.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-2.5 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="inline-flex h-6 min-w-8 items-center justify-center rounded bg-indigo-100 px-2 text-xs font-semibold text-indigo-700">
                            {item.quantidade}x
                          </span>
                          <span className="truncate text-gray-700">{item.descricao}</span>
                        </div>
                        <span className="text-right font-medium text-gray-700">{moeda(calcItem(item))}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">Nenhum item de venda informado.</p>
                  )}
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base text-gray-900">
                  <span>Total</span>
                  <span className="text-indigo-700">{moeda(totalResumo)}</span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <Button onClick={salvar} disabled={!form.cliente.trim()} className="w-full gap-2">
                <Check className="w-4 h-4 mr-1" />{editando ? "Salvar alterações" : "Criar orçamento"}
              </Button>
              <Button variant="outline" onClick={voltar} className="w-full gap-2">Cancelar</Button>
              <Button variant="ghost" onClick={() => abrirResumo()} className="w-full text-sm text-gray-600 gap-2">
                Resumo do Orçamento
              </Button>
              <Button variant="ghost" onClick={() => gerarOrcamento()} className="w-full text-sm text-gray-600 gap-2">
                Gerar Orçamento
              </Button>
              <Button
                variant="ghost"
                onClick={() => gerarRoteiro()}
                disabled={form.status !== "Aprovado"}
                className="w-full text-sm text-gray-600 gap-2 disabled:text-gray-400 disabled:cursor-not-allowed">
                Gerar Roteiro
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ TELA LISTA ============
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-sm text-gray-500 mt-1">{lista.length} orçamentos cadastrados</p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4" /> Novo Orçamento
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-indigo-600" /></div>
          <div><p className="text-xs text-gray-500">Volume Total</p><p className="text-xl font-bold text-gray-900">{moeda(totais.total)}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Check className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-xs text-gray-500">Aprovados</p><p className="text-xl font-bold text-gray-900">{moeda(totais.aprovados)}</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Send className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Aguardando retorno</p><p className="text-xl font-bold text-gray-900">{totais.pendentes} orçamento{totais.pendentes !== 1 ? "s" : ""}</p></div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Pesquisar por número, cliente, e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 pr-9" />
            {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Todos", ...allStatus] as const).map((s) => (
              <button key={s} onClick={() => setFiltroStatus(s as StatusOrc | "Todos")} className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${filtroStatus === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{s}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Lista de orçamentos */}
      <div className="space-y-3">
        {filtrados.length === 0 && (
          <Card className="py-12 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Nenhum orçamento encontrado</p>
          </Card>
        )}
        {filtrados.map((orc) => {
          const total = calcTotal(orc.itens);
          const cfg = statusConfig[orc.status];
          const expandido = expandidos.has(orc.id);
          const vencido = orc.dataValidade && new Date(orc.dataValidade) < new Date() && orc.status !== "Aprovado" && orc.status !== "Cancelado" && orc.status !== "Rejeitado";
          return (
            <Card key={orc.id} className="overflow-hidden">
              {/* Linha principal */}
              <div className="p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-indigo-700">{orc.numero}</span>
                    <Badge className={`${cfg.bg} ${cfg.cor} hover:${cfg.bg}`}>{orc.status}</Badge>
                    {vencido && <span className="text-xs text-red-500 font-semibold">⚠ Vencido</span>}
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{orc.cliente}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" />Emissão: {fmtData(orc.dataCriacao)}</span>
                    {orc.dataValidade && <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" />Validade: {fmtData(orc.dataValidade)}</span>}
                    <span className="text-xs text-gray-400">{orc.itens.length} item{orc.itens.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg text-indigo-700">{moeda(total)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                  <button onClick={() => abrirPreview(orc)} title="Visualizar" className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => abrirResumo(orc)} title="Resumo do Orçamento" className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"><FileText className="w-4 h-4" /></button>
                  <button onClick={() => abrirEdicao(orc)} title="Editar" className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => gerarOrcamento(orc)} title="Gerar Orçamento" className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"><Printer className="w-4 h-4" /></button>
                  <button
                    onClick={() => gerarRoteiro(orc)}
                    disabled={orc.status !== "Aprovado"}
                    title={orc.status !== "Aprovado" ? "O orçamento precisa estar Aprovado" : "Gerar Roteiro"}
                    className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  ><MapPin className="w-4 h-4" /></button>
                  <button onClick={() => duplicar(orc)} title="Duplicar" className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors"><Copy className="w-4 h-4" /></button>
                  {confirmarExclusao === orc.id ? (
                    <>
                      <span className="text-xs text-gray-500">Excluir?</span>
                      <button onClick={() => excluir(orc.id)} className="p-1.5 rounded text-green-600 hover:bg-green-50"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmarExclusao(null)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmarExclusao(orc.id)} title="Excluir" className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => toggleFavorito(orc.id)} title={favoritos.includes(orc.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} className={`p-1.5 rounded transition-colors ${favoritos.includes(orc.id) ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}>
                    <Star className={`w-4 h-4 ${favoritos.includes(orc.id) ? 'fill-yellow-400' : ''}`} />
                  </button>
                  <button onClick={() => toggleExpandir(orc.id)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100 transition-colors">
                    {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Itens expandidos */}
              {expandido && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 font-semibold">
                        <th className="text-left pb-2">Descrição</th>
                        <th className="text-center pb-2 w-12">Qtd</th>
                        <th className="text-center pb-2 w-10">Un</th>
                        <th className="text-right pb-2 w-24">Unit.</th>
                        <th className="text-right pb-2 w-16">Desc.</th>
                        <th className="text-right pb-2 w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orc.itens.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200">
                          <td className="py-1.5 text-gray-700">{item.descricao}</td>
                          <td className="py-1.5 text-center text-gray-500">{item.quantidade}</td>
                          <td className="py-1.5 text-center text-gray-400">{item.unidade}</td>
                          <td className="py-1.5 text-right text-gray-500">{moeda(item.valorUnitario)}</td>
                          <td className="py-1.5 text-right text-orange-500">{item.desconto > 0 ? `${item.desconto}%` : "—"}</td>
                          <td className="py-1.5 text-right font-semibold text-gray-800">{moeda(calcItem(item))}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-indigo-200">
                        <td colSpan={5} className="py-2 font-bold text-gray-700">Total</td>
                        <td className="py-2 text-right font-bold text-indigo-700">{moeda(total)}</td>
                      </tr>
                    </tbody>
                  </table>
                  {orc.observacoes && <p className="text-xs text-gray-500 mt-2 italic">Obs: {orc.observacoes}</p>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
