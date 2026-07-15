import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Search, Plus, Edit2, X, Check, FileText, ChevronDown, ChevronUp,
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
import { listarClientes, type Cliente } from "../data/clientesApi";
import { listarFuncionarios, type Funcionario } from "../data/funcionariosApi";
import { listarProdutos, type Produto } from "../data/produtosApi";
import {
  atualizarOrcamento,
  criarOrcamento,
  listarOrcamentos,
  type ItemOrc,
  type DocumentoVenda,
  type Orcamento,
  type OrcamentoPayload,
  type StatusOrc,
} from "../data/orcamentosApi";
import {
  criarLancamentoFinanceiro,
  listarLancamentosFinanceiros,
  type LancamentoFinanceiro,
} from "../data/financeiroApi";

const itemVazio = (): ItemOrc => ({ id: Date.now(), descricao: "", quantidade: 1, unidade: "un", valorUnitario: 0, desconto: 0, link: "", documentos: [] });


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

function resumirItemSecao(item: any) {
  if (!item || typeof item !== "object") return "Detalhes disponíveis";

  if (item.nome) return String(item.nome);
  if (item.descricao) return String(item.descricao);
  if (item.companhia || item.numero) {
    const companhia = item.companhia ? String(item.companhia) : "Voo";
    const numero = item.numero ? ` ${String(item.numero)}` : "";
    return `${companhia}${numero}`.trim();
  }
  if (item.origem || item.destino) {
    const origem = item.origem ? String(item.origem) : "Origem";
    const destino = item.destino ? String(item.destino) : "Destino";
    return `${origem} -> ${destino}`;
  }
  if (item.tipo) return String(item.tipo);

  return "Detalhes disponíveis";
}

function extrairNumeroPositivo(valor: unknown, padrao = 0) {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : padrao;
}

function montarLinhasDescricao(orc: Orcamento): ItemOrc[] {
  let proximoId = 1;
  const criarLinha = (
    descricao: string,
    quantidade = 1,
    unidade = "item",
    valorUnitario = 0,
    desconto = 0
  ): ItemOrc => ({
    id: proximoId++,
    descricao,
    quantidade,
    unidade,
    valorUnitario,
    desconto,
  });

  const linhasVendas = (orc.itens || []).map((item) =>
    criarLinha(
      `[Vendas] ${item.descricao}`,
      item.quantidade,
      item.unidade || "un",
      item.valorUnitario,
      item.desconto
    )
  );

  const secoes = [
    { titulo: "Voos", dados: orc.voos },
    { titulo: "Hospedagem", dados: orc.hospedagem },
    { titulo: "Day by Day", dados: orc.dayByDay },
    { titulo: "Transporte", dados: orc.transporte },
    { titulo: "Restaurante", dados: orc.restaurante },
    { titulo: "Experiências", dados: orc.experiencias },
    { titulo: "Seguro", dados: orc.seguro },
  ];

  const linhasSecoes = secoes.flatMap((secao) => {
    if (!Array.isArray(secao.dados) || secao.dados.length === 0) return [];

    return secao.dados.map((item) => {
      const quantidade = extrairNumeroPositivo(item?.qtdPessoas, 0)
        || extrairNumeroPositivo(item?.quantidade, 0)
        || extrairNumeroPositivo(item?.noites, 0)
        || 1;

      const valorUnitario = extrairNumeroPositivo(item?.valor, 0)
        || extrairNumeroPositivo(item?.preco, 0)
        || extrairNumeroPositivo(item?.valorUnitario, 0)
        || 0;

      const unidade = typeof item?.unidade === "string" && item.unidade.trim()
        ? item.unidade
        : "item";

      return criarLinha(
        `[${secao.titulo}] ${resumirItemSecao(item)}`,
        quantidade,
        unidade,
        valorUnitario,
        0
      );
    });
  });

  const linhaRoteiro = orc.roteiro && orc.roteiro.trim()
    ? [criarLinha(`[Roteiro] ${orc.roteiro.trim().replace(/\s+/g, " ").slice(0, 160)}${orc.roteiro.trim().length > 160 ? "..." : ""}`, 1, "txt", 0, 0)]
    : [];

  return [...linhasVendas, ...linhasSecoes, ...linhaRoteiro];
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

const orcVazio = (): OrcamentoPayload => ({
  numero: "", cliente: "", email: "", agenteViagem: "", status: "Rascunho",
  dataCriacao: new Date().toISOString().split("T")[0],
  dataValidade: "", observacoes: "", itens: [itemVazio()],
});

export default function Orcamentos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lista, setLista] = useState<Orcamento[]>([]);
  const [tela, setTela] = useState<Tela>("lista");
  const [editando, setEditando] = useState<Orcamento | null>(null);
  const [form, setForm] = useState<OrcamentoPayload>(orcVazio());
  const [preview, setPreview] = useState<Orcamento | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOrc | "Todos">("Todos");
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
  const [clientesAtivos, setClientesAtivos] = useState<Cliente[]>([]);
  const [produtosAtivos, setProdutosAtivos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [statusBloqueado, setStatusBloqueado] = useState(false);
  const [modalFinanceiroAberto, setModalFinanceiroAberto] = useState(false);
  const [salvandoLancamento, setSalvandoLancamento] = useState(false);
  const [erroLancamento, setErroLancamento] = useState<string | null>(null);
  const [quitadoLancamento, setQuitadoLancamento] = useState(true);
  const [formaPagamentoLancamento, setFormaPagamentoLancamento] = useState("");
  const [parcelasLancamento, setParcelasLancamento] = useState("1");
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().slice(0, 10));
  const [popupAprovadoAberto, setPopupAprovadoAberto] = useState(false);

  function calcularTotalOrcamentoAtual() {
    const totalVendas = form.itens.reduce((acc, item) => acc + calcItem(item), 0);
    const totalHospedagem = hospedagem.reduce((acc, item) => acc + (Number(item?.preco) || 0), 0);
    const totalTransporte = transporte.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);
    const totalRestaurante = restaurante.reduce((acc, item) => acc + (Number(item?.preco) || 0), 0);
    const totalExperiencias = experiencias.reduce((acc, item) => acc + (Number(item?.preco) || 0), 0);
    const totalSeguro = seguro.reduce((acc, item) => acc + (Number(item?.valor) || 0), 0);

    return totalVendas + totalHospedagem + totalTransporte + totalRestaurante + totalExperiencias + totalSeguro;
  }

  async function verificarReceitaLancada(orcamentoId: number) {
    try {
      const lancamentos = await listarLancamentosFinanceiros();
      const receita = lancamentos.find(
        (item: LancamentoFinanceiro) => item.tipo === "receita" && item.orcamentoId === orcamentoId
      );
      setStatusBloqueado(Boolean(receita));
    } catch {
      setStatusBloqueado(false);
    }
  }

  function abrirCadastroLancamentoFinanceiro() {
    setErroLancamento(null);
    setQuitadoLancamento(true);
    setFormaPagamentoLancamento("");
    setParcelasLancamento("1");
    setDataLancamento(form.dataCriacao || new Date().toISOString().slice(0, 10));
    setModalFinanceiroAberto(true);
  }

  async function onChangeStatusOrcamento(novoStatus: StatusOrc) {
    if (statusBloqueado) {
      return;
    }

    const eraAprovado = form.status === "Aprovado";
    setForm((prev) => ({ ...prev, status: novoStatus }));

    if (novoStatus !== "Aprovado" || eraAprovado) {
      return;
    }

    setPopupAprovadoAberto(true);
  }

  function confirmarAprovadoQuitado() {
    setPopupAprovadoAberto(false);

    if (!editando?.id) {
      setErro("Salve o orçamento primeiro para gerar o lançamento financeiro vinculado.");
      return;
    }

    abrirCadastroLancamentoFinanceiro();
  }

  function confirmarAprovadoSemQuitacao() {
    setPopupAprovadoAberto(false);
  }

  async function salvarLancamentoVinculado() {
    if (!editando?.id) {
      setErroLancamento("Orçamento inválido para vincular lançamento financeiro.");
      return;
    }

    const valorTotal = calcularTotalOrcamentoAtual();
    const parcelas = Number(parcelasLancamento);

    if (!dataLancamento) {
      setErroLancamento("Informe a data do lançamento.");
      return;
    }

    if (quitadoLancamento && !formaPagamentoLancamento.trim()) {
      setErroLancamento("Selecione a forma de pagamento.");
      return;
    }

    if (quitadoLancamento && (!Number.isInteger(parcelas) || parcelas <= 0)) {
      setErroLancamento("Informe a quantidade de parcelas válida.");
      return;
    }

    setSalvandoLancamento(true);
    setErroLancamento(null);

    try {
      await criarLancamentoFinanceiro({
        tipo: "receita",
        descricao: `Receita do orçamento #${form.numero} - ${form.cliente}`,
        valor: Math.abs(valorTotal),
        data: dataLancamento,
        oculto: false,
        orcamentoPago: quitadoLancamento,
        formaPagamento: quitadoLancamento ? formaPagamentoLancamento.trim() : "",
        parcelas: quitadoLancamento ? parcelas : null,
        orcamentoId: editando.id,
      });

      setModalFinanceiroAberto(false);
      setStatusBloqueado(true);
    } catch (error) {
      setErroLancamento(error instanceof Error ? error.message : "Erro ao salvar lançamento financeiro.");
    } finally {
      setSalvandoLancamento(false);
    }
  }

  async function carregarOrcamentos() {
    setErro(null);
    try {
      const listaApi = await listarOrcamentos();
      setLista(listaApi);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar orçamentos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function carregarDadosCadastros() {
      try {
        const [clientes, funcionarios, produtos] = await Promise.all([listarClientes(), listarFuncionarios(), listarProdutos()]);

        if (mounted) {
          setClientesAtivos(clientes.filter((cliente) => cliente.status === "Ativo"));
          setFuncionariosAtivos(funcionarios.filter((funcionario) => funcionario.status === "Ativo"));
          setProdutosAtivos(produtos.filter((produto) => produto.status === "Ativo"));
        }
      } catch {
        if (mounted) {
          setClientesAtivos([]);
          setFuncionariosAtivos([]);
          setProdutosAtivos([]);
        }
      }
    }

    carregarDadosCadastros();
    carregarOrcamentos();

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
        void abrirEdicao(orc);
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, lista, location.pathname, navigate]);

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
    setErro(null);
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
    setStatusBloqueado(false);
    setTela("form");
  }

  async function abrirEdicao(o: Orcamento) {
    setEditando(o);
    setErro(null);
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
    await verificarReceitaLancada(o.id);
    setTela("form");
  }

  function abrirPreview(o: Orcamento) { setPreview(o); setTela("preview"); }

  function voltar() { setTela("lista"); setEditando(null); setPreview(null); }

  async function salvar() {
    if (!form.cliente.trim()) return null;
    setSalvando(true);
    setErro(null);
    
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
    
    try {
      if (editando) {
        await atualizarOrcamento(editando.id, orcComSecoes);
        await carregarOrcamentos();
        voltar();
        return editando.id;
      }

      const criado = await criarOrcamento(orcComSecoes);
      await carregarOrcamentos();
      voltar();
      return criado.id;
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar orçamento.");
      return null;
    } finally {
      setSalvando(false);
    }
  }

  async function duplicar(o: Orcamento) {
    const novo: OrcamentoPayload = { ...o, numero: gerarNumero([...lista, o]), status: "Rascunho", dataCriacao: new Date().toISOString().split("T")[0] };
    delete (novo as any).id;
    try {
      await criarOrcamento(novo);
      await carregarOrcamentos();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao duplicar orçamento.");
    }
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

  // --- itens do form ---
  function addItem() { setForm((f) => ({ ...f, itens: [...f.itens, itemVazio()] })); }
  function removeItem(id: number) { setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) })); }
  function updateItem(id: number, field: keyof ItemOrc, value: string | number) {
    setForm((f) => ({ ...f, itens: f.itens.map((i) => i.id === id ? { ...i, [field]: value } : i) }));
  }

  function selecionarProdutoItem(id: number, nomeProduto: string) {
    const nomeNormalizado = nomeProduto.trim().toLowerCase();
    const produto = produtosAtivos.find((item) => item.nome.trim().toLowerCase() === nomeNormalizado);

    setForm((f) => ({
      ...f,
      itens: f.itens.map((item) =>
        item.id === id
          ? {
              ...item,
              descricao: nomeProduto,
              unidade: produto?.unidade || item.unidade,
              valorUnitario: produto?.preco ?? item.valorUnitario,
            }
          : item
      ),
    }));
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
                    <p className="text-sm text-gray-600 mb-2">Itens relacionados à venda (produtos/serviços). Se quiser, digite um item manualmente.</p>
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
                              <Input
                                value={item.descricao}
                                onChange={(e) => selecionarProdutoItem(item.id, e.target.value)}
                                placeholder="Selecione da lista ou digite outro produto/serviço"
                                list={`produtos-vendas-${item.id}`}
                              />
                              <datalist id={`produtos-vendas-${item.id}`}>
                                {produtosAtivos.map((produto) => (
                                  <option key={produto.id} value={produto.nome} />
                                ))}
                              </datalist>
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
                    onChange={(e) => void onChangeStatusOrcamento(e.target.value as StatusOrc)}
                    className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    disabled={statusBloqueado}
                  >
                    {allStatus.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {statusBloqueado && (
                    <p className="mt-1 text-xs text-gray-500">
                      Status bloqueado após lançamento financeiro vinculado.
                    </p>
                  )}
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
              <Button onClick={salvar} disabled={salvando || !form.cliente.trim()} className="w-full gap-2">
                <Check className="w-4 h-4 mr-1" />{salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar orçamento"}
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

        {modalFinanceiroAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setModalFinanceiroAberto(false)} />
            <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Novo lançamento financeiro</h2>
                <button
                  onClick={() => setModalFinanceiroAberto(false)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Fechar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {erroLancamento && (
                <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erroLancamento}</p>
              )}

              <div className="space-y-4">
                <div>
                  <Label>Orçamento</Label>
                  <Input value={`${form.numero} - ${form.cliente}`} className="mt-1" disabled />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Input value={`Receita do orçamento #${form.numero} - ${form.cliente}`} className="mt-1" disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor</Label>
                    <Input value={calcularTotalOrcamentoAtual().toFixed(2)} className="mt-1" disabled />
                  </div>
                  <div>
                    <Label htmlFor="data-lancamento-orc">Data</Label>
                    <Input
                      id="data-lancamento-orc"
                      type="date"
                      value={dataLancamento}
                      onChange={(e) => setDataLancamento(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quitado-orc">Quitado</Label>
                    <select
                      id="quitado-orc"
                      value={quitadoLancamento ? "sim" : "nao"}
                      onChange={(e) => {
                        const quitado = e.target.value === "sim";
                        setQuitadoLancamento(quitado);
                        if (!quitado) {
                          setFormaPagamentoLancamento("");
                          setParcelasLancamento("1");
                        }
                      }}
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="nao">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="forma-orc">Forma de pagamento</Label>
                    <select
                      id="forma-orc"
                      value={formaPagamentoLancamento}
                      onChange={(e) => setFormaPagamentoLancamento(e.target.value)}
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      disabled={!quitadoLancamento}
                    >
                      <option value="">Selecione</option>
                      <option value="pix">PIX</option>
                      <option value="cartao_credito">Cartão de crédito</option>
                      <option value="cartao_debito">Cartão de débito</option>
                      <option value="boleto">Boleto</option>
                      <option value="transferencia">Transferência</option>
                      <option value="dinheiro">Dinheiro</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="parcelas-orc">Parcelas</Label>
                    <Input
                      id="parcelas-orc"
                      type="number"
                      min="1"
                      step="1"
                      value={parcelasLancamento}
                      onChange={(e) => setParcelasLancamento(e.target.value)}
                      className="mt-1"
                      disabled={!quitadoLancamento}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalFinanceiroAberto(false)}>Cancelar</Button>
                <Button onClick={() => void salvarLancamentoVinculado()} disabled={salvandoLancamento}>
                  {salvandoLancamento ? "Salvando..." : "Salvar lançamento"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {popupAprovadoAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setPopupAprovadoAberto(false)} />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900">Orçamento aprovado</h3>
              <p className="mt-2 text-sm text-gray-600">
                Perfeito. Este orçamento já foi quitado? Se sim, vamos abrir agora o cadastro do lançamento financeiro vinculado.
              </p>

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={confirmarAprovadoSemQuitacao}>
                  Ainda não foi quitado
                </Button>
                <Button onClick={confirmarAprovadoQuitado} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Sim, foi quitado
                </Button>
              </div>
            </div>
          </div>
        )}
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

      {erro && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      {carregando && (
        <p className="mb-4 text-sm text-gray-500">Carregando orçamentos...</p>
      )}

      {/* Lista de orçamentos */}
      <div className="space-y-3">
        {!carregando && filtrados.length === 0 && (
          <Card className="py-12 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Nenhum orçamento encontrado</p>
          </Card>
        )}
        {filtrados.map((orc) => {
          const total = calcTotal(orc.itens);
          const linhasDescricao = montarLinhasDescricao(orc);
          const totalDescricao = calcTotal(linhasDescricao);
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
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Descrição</h4>
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
                      {linhasDescricao.map((item) => (
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
                        <td className="py-2 text-right font-bold text-indigo-700">{moeda(totalDescricao)}</td>
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
