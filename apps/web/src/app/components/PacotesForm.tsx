import { useMemo, useState, useRef } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, Link2, Package2, Image, Upload, FileText, X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { enviarMensagemIA } from "../data/aiChatApi";
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";

// Configura o worker para o pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

interface Documento {
  id: number;
  nome: string;
  tipo: string;
  arquivo: string;
  analise?: string;
  dadosIA?: {
    operador?: string;
    reserva?: string;
    destino?: string;
    passageiros?: string;
    dataIda?: string;
    dataVolta?: string;
  };
}

interface Pacote {
  id: number;
  operador: string;
  origem: string;
  destino: string;
  reserva?: string;
  link: string;

  foto: string | null;
  valor: number;
  dataIda?: string;
  dataVolta?: string;
  passageiros?: string;
  logAnalise?: string;
  documentos: Documento[];
}

interface PacotesFormProps {
  pacotes: Pacote[];
  onPacotesChange: (pacotes: Pacote[]) => void;
}

const operadoresPadrao = [
  "HotelDO",
  "Decolar",
  "CVC",
  "Flytour",
  "Orinter",
  "Abreu",
  "Visual Turismo",
  "Diversa Turismo",
];

const pacoteVazio: Omit<Pacote, "id"> = {
  operador: "",
  origem: "",
  destino: "",
  reserva: "",
  link: "",

  foto: null,
  valor: 0,
  dataIda: "",
  dataVolta: "",
  passageiros: "",
  logAnalise: "",
  documentos: []
};

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMoeda(valorTexto: string) {
  const limpo = valorTexto
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");
  const valor = Number(limpo);
  return Number.isFinite(valor) && valor >= 0 ? valor : 0;
}

function normalizarChave(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function padronizarOperador(valor: string) {
  const normalizado = normalizarChave(valor);
  if (!normalizado) return "";

  const mapaOperadores: Record<string, string> = {
    hoteldo: "HotelDO",
    decolar: "Decolar",
    cvc: "CVC",
    flytour: "Flytour",
    orinter: "Orinter",
    abreu: "Abreu",
    visualturismo: "Visual Turismo",
    diversaturismo: "Diversa Turismo",
  };

  const exato = mapaOperadores[normalizado];
  if (exato) return exato;

  const porContem = Object.entries(mapaOperadores).find(([chave]) => normalizado.includes(chave));
  return porContem?.[1] || valor.trim();
}

function normalizarValorIA(valor?: string) {
  if (!valor) return "";
  const normalizado = valor.trim();
  return normalizado.toLowerCase() === "não informado" ? "" : normalizado;
}

function dataBrParaIso(dataBr: string) {
  const partes = dataBr.split("/");
  if (partes.length !== 3) return "";
  const [dia, mes, ano] = partes;
  if (!dia || !mes || !ano) return "";
  if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return "";
  return `${ano}-${mes}-${dia}`;
}

function extrairDadosIADeAnalise(analise: string) {
  const extrair = (regex: RegExp) => {
    const valor = analise.match(regex)?.[1];
    return normalizarValorIA(valor);
  };

  const dataIdaBr = extrair(/\*\*Data de Ida:\*\*\s*(.+)/);
  const dataVoltaBr = extrair(/\*\*Data de Volta:\*\*\s*(.+)/);

  return {
    operador: padronizarOperador(extrair(/\*\*Operador:\*\*\s*(.+)/)),
    reserva: extrair(/\*\*Nº de Reserva\/Localizador:\*\*\s*(.+)/),
    destino: extrair(/\*\*Destino Principal:\*\*\s*(.+)/),
    passageiros: extrair(/\*\*Passageiros:\*\*\s*(.+)/),
    dataIda: dataIdaBr ? dataBrParaIso(dataIdaBr) : "",
    dataVolta: dataVoltaBr ? dataBrParaIso(dataVoltaBr) : "",
  };
}

export default function PacotesForm({ pacotes, onPacotesChange }: PacotesFormProps) {
  const [form, setForm] = useState<Omit<Pacote, "id">>(pacoteVazio);
  const [valorInput, setValorInput] = useState("");
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formMinimizado, setFormMinimizado] = useState(true);
  const [vouchersMinimizado, setVouchersMinimizado] = useState(false);
  const [analisandoIA, setAnalisandoIA] = useState(false);
  const [logAnaliseIA, setLogAnaliseIA] = useState<string[]>([]);
  const [provedorIA, setProvedorIA] = useState<"automático" | "openai" | "groq" | "gemini" | "openrouter" | "cloudflare">("automático");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const operadores = useMemo(
    () => Array.from(new Set([...operadoresPadrao, ...pacotes.map((item) => item.operador.trim()).filter(Boolean)])),
    [pacotes],
  );

  function limparFormulario() {
    setForm(pacoteVazio);
    setValorInput("");
    setEditandoId(null);
  }

  function salvarPacote() {
    if (!form.operador.trim()) {
      setErro("Informe o operador do pacote.");
      return;
    }

    if (editandoId !== null) {
      onPacotesChange(
        pacotes.map((item) =>
          item.id === editandoId
            ? {
                ...item,
                operador: form.operador.trim(),
                origem: form.origem.trim(),
                destino: form.destino.trim(),
                reserva: form.reserva?.trim(),
                link: form.link.trim(),

                foto: form.foto,
                valor: form.valor,
                dataIda: form.dataIda,
                dataVolta: form.dataVolta,
                passageiros: form.passageiros,                
                documentos: form.documentos || [],
                logAnalise: logAnaliseIA.join("\n"),
              }
            : item,
        ),
      );
      limparFormulario();
      setErro("");
      return;
    }

    onPacotesChange([
      ...pacotes,
      {
        id: Date.now(),
        operador: form.operador.trim(),
        origem: form.origem.trim(),
        destino: form.destino.trim(),
        reserva: form.reserva?.trim(),
        link: form.link.trim(),

        foto: form.foto,
        valor: form.valor,
        dataIda: form.dataIda,
        dataVolta: form.dataVolta,
        passageiros: form.passageiros,
        logAnalise: logAnaliseIA.join("\n"),
        documentos: form.documentos,
      },
    ]);
    limparFormulario();
    setErro("");
  }

  function editarPacote(pacote: Pacote) {
    setVouchersMinimizado(false);
    setFormMinimizado(false);
    setEditandoId(pacote.id);
    const logPacote = (pacote.logAnalise || "")
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean);
    setLogAnaliseIA(logPacote);
    setForm({
      operador: pacote.operador || "",
      origem: pacote.origem || "",
      destino: pacote.destino || "",
      reserva: pacote.reserva || "",
      link: pacote.link || "",

      foto: pacote.foto || null,
      valor: Number(pacote.valor) || 0,
      documentos: Array.isArray(pacote.documentos) ? pacote.documentos : [],
      dataIda: pacote.dataIda || "",
      dataVolta: pacote.dataVolta || "",
      passageiros: pacote.passageiros || "",
      logAnalise: pacote.logAnalise || "",
    });
    setValorInput(pacote.valor ? formatarMoeda(Number(pacote.valor) || 0) : "");
    setErro("");
  }

  function removerPacote(id: number) {
    onPacotesChange(pacotes.filter((item) => item.id !== id));
    if (editandoId === id) {
      limparFormulario();
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    if (arquivos.length === 0) return;

    const docs = await Promise.all(
      arquivos.map(
        (arquivo) =>
          new Promise<Documento>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: Date.now() + Math.floor(Math.random() * 10000),
                nome: arquivo.name,
                tipo: arquivo.type,
                arquivo: String(reader.result || ""),
                analise: "",
              });
            };
            reader.onerror = () => reject(new Error("Falha ao carregar documento."));
            reader.readAsDataURL(arquivo);
          })
      )
    );

    setForm((f) => ({ ...f, documentos: [...f.documentos, ...docs] }));
    e.target.value = "";
  }

  function removerDocumento(idDocumento: number) {
    setForm((f) => ({
      ...f,
      documentos: (f.documentos || []).filter((doc) => doc.id !== idDocumento),
    }))
  }

  function atualizarCamposComResultadoIA() {
    const documentos = form.documentos || [];
    if (documentos.length === 0) {
      setErro("Nenhum documento para atualizar os campos.");
      return;
    }

    const documentoComResultado = documentos.find((doc) => doc.dadosIA || doc.analise);
    if (!documentoComResultado) {
      setErro("Nenhum resultado de IA encontrado para atualizar os campos.");
      return;
    }

    const dadosIA = documentoComResultado.dadosIA || extrairDadosIADeAnalise(documentoComResultado.analise || "");
    if (!dadosIA.operador && !dadosIA.reserva && !dadosIA.destino && !dadosIA.passageiros && !dadosIA.dataIda && !dadosIA.dataVolta) {
      setErro("Não foi possível extrair dados do resultado da IA para atualizar os campos.");
      return;
    }

    setErro("");
    setForm((f) => ({
      ...f,
      operador: dadosIA.operador || f.operador || "",
      reserva: dadosIA.reserva || f.reserva || "",
      destino: dadosIA.destino || f.destino || "",
      dataIda: dadosIA.dataIda || f.dataIda || "",
      dataVolta: dadosIA.dataVolta || f.dataVolta || "",
      passageiros: dadosIA.passageiros || f.passageiros || "",
    }));
  }

  async function identificarOperadorNoIcone(doc: Documento) {
    if (!doc.tipo.startsWith("image/") || !doc.arquivo) return "";

    const promptOperador = [
      "Identifique o nome da operadora de turismo exibida no logo da imagem.",
      "Responda APENAS com um nome de operadora, sem frases extras.",
      "Se não conseguir identificar com confiança, responda apenas com string vazia.",
      "Operadoras válidas: HotelDO, Decolar, CVC, Flytour, Orinter, Abreu, Visual Turismo, Diversa Turismo.",
    ].join("\n");

    try {
      const resposta = await enviarMensagemIA(
        [
          {
            role: "user",
            content: [
              { type: "text", text: promptOperador },
              { type: "image_url", image_url: { url: doc.arquivo } },
            ],
          },
        ],
        "openai",
      );

      return padronizarOperador(resposta.reply.replace(/[`"]/g, "").trim());
    } catch {
      return "";
    }
  }

  async function analisarDocumentosComIA() {
    if (!form.documentos || form.documentos.length === 0) {
      setErro("Nenhum documento para analisar.");
      return;
    }

    setAnalisandoIA(true);
    setErro("");
    setForm((f) => ({ ...f, logAnalise: "" }));

    // Usa array local para garantir que o log seja preciso (evita problemas com estado assíncrono do React)
    const logEntries: string[] = ["Iniciando análise com IA..."];
    setLogAnaliseIA([...logEntries]);

    const adicionarLog = (mensagem: string) => {
      logEntries.push(mensagem);
      setLogAnaliseIA([...logEntries]);
    };

    try {
      const novasAnalises = await Promise.all(
        form.documentos.map(async (doc) => {
          let contextoArquivo = "Nome do arquivo: " + doc.nome + "\n\n";
          let temConteudoPdf = false;
          let operadorDetectado = "";

          if (doc.tipo === 'application/pdf' && doc.arquivo) {
            try {
              const loadingTask = pdfjsLib.getDocument({ data: atob(doc.arquivo.split(',')[1]) });
              const pdf = await loadingTask.promise;
              let textContent = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
              }
              contextoArquivo += "--- Conteúdo do arquivo: " + doc.nome + " ---\n" + textContent + "\n--- Fim do arquivo: " + doc.nome + " ---\n\n";
              temConteudoPdf = true;
            } catch (e) {
              contextoArquivo += "--- Erro ao ler o conteúdo do PDF: " + doc.nome + " ---\n";
            }
          }

          if (doc.tipo.startsWith("image/") && doc.arquivo) {
            operadorDetectado = await identificarOperadorNoIcone(doc);
            if (operadorDetectado) {
              contextoArquivo += `--- Operador identificado no ícone: ${operadorDetectado} ---\n\n`;
            }
          }

          const prompt = `Você é um assistente especialista em turismo. Analise o contexto de um arquivo de um pacote de viagem e extraia as informações solicitadas para o formato JSON.

Contexto do arquivo para análise:
${contextoArquivo}

Instruções:
1.  Extraia as seguintes informações do nome do arquivo e, se disponível, do conteúdo do PDF.
2.  Se uma informação não for encontrada, retorne uma string vazia "" para o campo correspondente.
3.  Para datas, use o formato AAAA-MM-DD.
4.  Retorne APENAS o objeto JSON, sem nenhum texto ou formatação adicional.
${!temConteudoPdf ? "\n5. Como o conteúdo do arquivo não pôde ser lido, baseie sua análise **exclusivamente no nome do arquivo**." : ""}
Formato JSON esperado:
{
  "operador": "string",
  "reserva": "string",
  "destino": "string",
  "passageiros": "string",
  "dataIda": "string",
  "horaSaidaIda": "string",
  "horaChegadaIda": "string",
  "dataVolta": "string",
  "horaSaidaVolta": "string",
  "horaChegadaVolta": "string"
}`;

          const tentarComProvedor = async (provedor?: "openai" | "groq" | "gemini" | "openrouter" | "cloudflare") => {
            return enviarMensagemIA([{ role: "user", content: prompt }], provedor);
          };

          try {
            let data;
            let provedorUsado: "OpenAI" | "Groq" | "Gemini" | "OpenRouter" | "Cloudflare";
            const provedoresAutomatico: ("openai" | "groq" | "gemini" | "openrouter" | "cloudflare")[] = ["openai", "groq", "gemini", "openrouter", "cloudflare"];

            if (provedorIA === "automático") {
              const mapaProvedorCapitalizado: Record<string, "OpenAI" | "Groq" | "Gemini" | "OpenRouter" | "Cloudflare"> = {
                openai: "OpenAI",
                groq: "Groq",
                gemini: "Gemini",
                openrouter: "OpenRouter",
                cloudflare: "Cloudflare",
              };

              for (const provedor of provedoresAutomatico) {
                try {
                  const nomeProvedor = mapaProvedorCapitalizado[provedor];
                  adicionarLog(`Analisando "${doc.nome}" com ${nomeProvedor}...`);
                  data = await tentarComProvedor(provedor);
                  provedorUsado = nomeProvedor;
                  // Se a chamada for bem-sucedida, saia do loop
                  if (data) break;
                } catch (error) {
                  const nomeProvedor = mapaProvedorCapitalizado[provedor];
                  console.warn(`Falha no ${nomeProvedor}, tentando com o próximo...`, error);
                  adicionarLog(`Falha no ${nomeProvedor} para "${doc.nome}". Tentando com o próximo...`);
                }
              }

              if (!data) {
                // Se todos os provedores falharem
                throw new Error("Todos os provedores de IA falharam.");
              }
            } else {
              const mapaProvedor: Record<string, "OpenAI" | "Groq" | "Gemini" | "OpenRouter" | "Cloudflare"> = {
                openai: "OpenAI",
                groq: "Groq",
                gemini: "Gemini",
                openrouter: "OpenRouter",
                cloudflare: "Cloudflare",
              };
              const provedorCapitalizado = mapaProvedor[provedorIA] || "OpenAI";
              adicionarLog(`Analisando "${doc.nome}" com ${provedorCapitalizado}...`);
              data = await tentarComProvedor(provedorIA);
              provedorUsado = provedorCapitalizado;
            }

            const respostaLimpa = data.reply.replace(/^```json\s*/, "").replace(/```$/, "").trim();
            const respostaJson = JSON.parse(respostaLimpa);

            const fmtData = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado';
const relatorio = `**Relatório do Pacote (Analisado com ${provedorUsado})**
--------------------
**Operador:** ${padronizarOperador(respostaJson.operador || operadorDetectado || '') || 'Não informado'}
**Nº de Reserva/Localizador:** ${respostaJson.reserva || 'Não informado'}
**Destino Principal:** ${respostaJson.destino || 'Não informado'}
**Passageiros:** ${respostaJson.passageiros || 'Não informado'}
**Data de Ida:** ${fmtData(respostaJson.dataIda)}
**Horário de Saída (Ida):** ${respostaJson.horaSaidaIda || 'Não informado'}
**Horário de Chegada (Ida):** ${respostaJson.horaChegadaIda || 'Não informado'}
**Data de Volta:** ${fmtData(respostaJson.dataVolta)}
**Horário de Saída (Volta):** ${respostaJson.horaSaidaVolta || 'Não informado'}
**Horário de Chegada (Volta):** ${respostaJson.horaChegadaVolta || 'Não informado'}`;

            // Atualiza o formulário com os dados extraídos da análise.
            setForm((f) => ({
              ...f,
              operador: f.operador || padronizarOperador(respostaJson.operador || operadorDetectado || ''),
              reserva: f.reserva || respostaJson.reserva || '',
              destino: f.destino || respostaJson.destino || '',
              dataIda: f.dataIda || respostaJson.dataIda || '',
              dataVolta: f.dataVolta || respostaJson.dataVolta || '',
              passageiros: f.passageiros || respostaJson.passageiros || '',
            }));

            return {
              ...doc,
              analise: relatorio,
              dadosIA: {
                operador: padronizarOperador(respostaJson.operador || operadorDetectado || ""),
                reserva: respostaJson.reserva || "",
                destino: respostaJson.destino || "",
                passageiros: respostaJson.passageiros || "",
                dataIda: respostaJson.dataIda || "",
                dataVolta: respostaJson.dataVolta || "",
              },
            };
          } catch (error) {
            const mensagemErro = "Não foi possível analisar o documento. Tente novamente mais tarde.";
            adicionarLog(`Falha ao analisar "${doc.nome}": ${mensagemErro}`);
            return { ...doc, analise: `Falha na análise com IA: ${mensagemErro}` };
          }
        })
      );

      setForm((f) => ({ ...f, documentos: novasAnalises }));
    } catch (error) {
      const mensagemErro = "Falha em ambos os provedores de IA. Verifique os logs e tente novamente.";
      adicionarLog(mensagemErro);
      setErro(`Falha na análise com IA: ${mensagemErro}`);
    } finally {
      setAnalisandoIA(false);
      // Persiste o log no formulário para exibir após a análise (usa o array local que tem os valores corretos)
      setForm((f) => ({ ...f, logAnalise: logEntries.join("\n") }));
    }
  }


  return (
    <div className="space-y-4">
      {/* Seção de Anexos e Análise com IA */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 font-semibold text-gray-900">
            <Package2 className="h-4 w-4 text-indigo-500" />
            Vouchers
          </h4>          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVouchersMinimizado((prev) => !prev)}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            {vouchersMinimizado ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            {vouchersMinimizado ? "Maximizar" : "Minimizar"}
          </Button>
        </div>
          {!vouchersMinimizado && (
            <>
            <div className="space-y-4 mb-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors bg-white"
              >
                <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                <p className="text-xs text-gray-500">Clique para anexar arquivos</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, ZIP, JPG, etc.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              {(form.documentos || []).length > 0 ? (
                <div className="space-y-1.5 pr-2">
                  {(form.documentos || []).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-2.5 py-2 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <a href={doc.arquivo} download={doc.nome} className="truncate text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{doc.nome}</span>
                          </a>
                          <button type="button" onClick={() => removerDocumento(doc.id)} className="ml-2 rounded p-1 text-red-500 hover:bg-red-50" title="Remover documento">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {doc.analise && (
                          <div className="mt-2 whitespace-pre-wrap rounded-md border border-indigo-200 bg-indigo-50 p-2 text-xs text-indigo-800">
                            {doc.analise}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-gray-400 border border-dashed rounded-lg p-4 flex items-center justify-center bg-white">Nenhum anexo adicionado.</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={analisarDocumentosComIA}
                disabled={analisandoIA || (form.documentos || []).length === 0}
                className="gap-2 text-indigo-600 border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Sparkles className={`w-4 h-4 ${analisandoIA ? "animate-spin" : ""}`} />
                {analisandoIA ? "Analisando..." : "Analisar com IA"}
              </Button>
              <select
                value={provedorIA}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (
                    valor === "automático" ||
                    valor === "openai" ||
                    valor === "groq" ||
                    valor === "gemini" ||
                    valor === "openrouter" ||
                    valor === "cloudflare"
                  ) {
                    setProvedorIA(valor);
                  }
                }}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring"
                disabled={analisandoIA}
              >
                <option value="automático">Automático</option>
                <option value="openai">OpenAI</option>
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
                <option value="openrouter">OpenRouter</option>
                <option value="cloudflare">Cloudflare</option>
              </select>
            </div>
            {logAnaliseIA.length > 0 && (
              <div className={`mt-2 text-xs space-y-1 ${analisandoIA ? "text-gray-500" : "text-gray-600 p-2 border rounded-md bg-gray-50"}`}>
                {!analisandoIA && <p className="font-semibold">Log da última análise:</p>}
                <pre className="whitespace-pre-wrap font-sans">{logAnaliseIA.join("\n")}</pre>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                <Plus className="h-4 w-4 text-indigo-500" />
                Detalhes
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={atualizarCamposComResultadoIA}
                  disabled={analisandoIA || (form.documentos || []).length === 0}
                  className="gap-2"
                >
                  <Sparkles className={`w-4 h-4 ${analisandoIA ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormMinimizado((prev) => !prev)}
                  className="gap-2 text-gray-600 hover:text-gray-900"
                >
                  {formMinimizado ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  {formMinimizado ? "Maximizar" : "Minimizar"}
                </Button>
              </div>
            </div>

            {!formMinimizado && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-4">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Operador *</Label>
                    <Input
                      className="mt-1"
                      placeholder="Selecione da lista ou digite"
                      value={form.operador}
                      onChange={(e) => setForm((prev) => ({ ...prev, operador: e.target.value }))}
                      list="lista-operadores-pacotes"
                    />
                    <datalist id="lista-operadores-pacotes">
                      {operadores.map((operador) => (
                        <option key={operador} value={operador} />
                      ))}
                    </datalist>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs">Nº de Reserva</Label>
                    <Input
                      className="mt-1"
                      placeholder="Ex: ABC123"
                      value={form.reserva || ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, reserva: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs">Link</Label>
                    <div className="relative mt-1">
                      <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="https://..."
                        className="pl-8"
                        value={form.link}
                        onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Origem</Label>
                    <Input
                      className="mt-1"
                      placeholder="Ex: São Paulo"
                      value={form.origem}
                      onChange={(e) => setForm((prev) => ({ ...prev, origem: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Destino</Label>
                    <Input
                      className="mt-1"
                      placeholder="Ex: Lisboa"
                      value={form.destino}
                      onChange={(e) => setForm((prev) => ({ ...prev, destino: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Data de Ida</Label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={form.dataIda || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, dataIda: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Data de Volta</Label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={form.dataVolta || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, dataVolta: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Passageiros</Label>
                      <Input
                        className="mt-1"
                        placeholder="Ex: 2 adultos, 1 criança"
                        value={form.passageiros || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, passageiros: e.target.value }))}
                      />
                    </div>
                  </div>



                  <div className="sm:col-span-2">
                    <Label className="text-xs">Foto (URL)</Label>
                    <div className="relative mt-1">
                      <Image className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="https://media.staticontent.com/media/pictures/..."
                        className="pl-8"
                        value={form.foto || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, foto: e.target.value.trim() || null }))}
                      />
                    </div>
                    {form.foto && (
                      <div className="mt-2 overflow-hidden rounded-md border border-gray-200">
                        <img src={form.foto} alt="Prévia da foto do pacote" className="h-28 w-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs">Valor (R$)</Label>
                    <Input
                      placeholder="R$ 0,00"
                      value={valorInput}
                      onChange={(e) => {
                        const texto = e.target.value;
                        setValorInput(texto);
                        setForm((prev) => ({ ...prev, valor: parseMoeda(texto) }));
                      }}
                      onBlur={() => {
                        setValorInput(form.valor > 0 ? formatarMoeda(form.valor) : "");
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>

                {erro && <p className="mt-3 text-xs text-red-500">{erro}</p>}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={salvarPacote} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {editandoId !== null ? "Salvar voucher" : "Adicionar voucher"}
                  </Button>
                  {editandoId !== null && (
                    <Button type="button" variant="outline" onClick={limparFormulario}>
                      Cancelar edição
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
          )}

      </Card>

      {/* Lista de Pacotes Adicionados */}
      <div className="space-y-3">
        {pacotes.map((pacote, index) => (
          <Card key={pacote.id} className="p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-400">Voucher {index + 1}</p>
                <p className="font-semibold text-gray-900">{pacote.operador || "Sem operador"}</p>
                {pacote.reserva && (
                  <p className="text-xs text-gray-500 mt-0.5">Reserva: {pacote.reserva}</p>
                )}
                {(pacote.origem || pacote.destino) && (
                  <p className="text-xs text-gray-500 mt-0.5">{pacote.origem || "Origem"} -&gt; {pacote.destino || "Destino"}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => editarPacote(pacote)}
                  className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                  title="Editar pacote"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removerPacote(pacote.id)}
                  className="rounded p-1.5 text-red-500 hover:bg-red-50"
                  title="Remover pacote"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}