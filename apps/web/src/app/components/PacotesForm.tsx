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
}

interface Pacote {
  id: number;
  operador: string;
  origem: string;
  destino: string;
  link: string;
  descricao: string;
  foto: string | null;
  valor: number;
  dataIda?: string;
  dataVolta?: string;
  passageiros?: string;
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
  link: "",
  descricao: "",
  foto: null,
  valor: 0,
  dataIda: "",
  dataVolta: "",
  passageiros: "",
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

export default function PacotesForm({ pacotes, onPacotesChange }: PacotesFormProps) {
  const [form, setForm] = useState<Omit<Pacote, "id">>(pacoteVazio);
  const [valorInput, setValorInput] = useState("");
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formMinimizado, setFormMinimizado] = useState(true);
  const [analisandoIA, setAnalisandoIA] = useState(false);
  const [analiseMinimizada, setAnaliseMinimizada] = useState(true);
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
                link: form.link.trim(),
                descricao: form.descricao.trim(),
                foto: form.foto,
                valor: form.valor,
                dataIda: form.dataIda,
                dataVolta: form.dataVolta,
                passageiros: form.passageiros,
                documentos: form.documentos || [],
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
        link: form.link.trim(),
        descricao: form.descricao.trim(),
        foto: form.foto,
        valor: form.valor,
        dataIda: form.dataIda,
        dataVolta: form.dataVolta,
        passageiros: form.passageiros,
        documentos: form.documentos || [],
      },
    ]);
    limparFormulario();
    setErro("");
  }

  function editarPacote(pacote: Pacote) {
    setFormMinimizado(false);
    setEditandoId(pacote.id);
    setForm({
      operador: pacote.operador || "",
      origem: pacote.origem || "",
      destino: pacote.destino || "",
      link: pacote.link || "",
      descricao: pacote.descricao || "",
      foto: pacote.foto || null,
      valor: Number(pacote.valor) || 0,
      documentos: Array.isArray(pacote.documentos) ? pacote.documentos : [],
      dataIda: pacote.dataIda || "",
      dataVolta: pacote.dataVolta || "",
      passageiros: pacote.passageiros || "",
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

  async function analisarDocumentosComIA() {
    if (!form.documentos || form.documentos.length === 0) {
      setErro("Nenhum documento para analisar.");
      return;
    }

    setAnalisandoIA(true);
    setErro("");

    try {
      const novasAnalises = await Promise.all(
        form.documentos.map(async (doc) => {
          let contextoArquivo = `Nome do arquivo: ${doc.nome}\n\n`;
          let temConteudoPdf = false;

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
              contextoArquivo += `--- Conteúdo do arquivo: ${doc.nome} ---\n${textContent}\n--- Fim do arquivo: ${doc.nome} ---\n\n`;
              temConteudoPdf = true;
            } catch (e) {
              contextoArquivo += `--- Erro ao ler o conteúdo do PDF: ${doc.nome} ---\n`;
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
  "reserva": "string",
  "destino": "string",
  "passageiros": "string",
  "dataIda": "string",
  "horaSaidaIda": "string",
  "horaChegadaIda": "string",
  "dataVolta": "string",
  "horaSaidaVolta": "string",
  "horaChegadaVolta": "string",
  "outrasInfos": "string"
}`;

          try {
            const data = await enviarMensagemIA([{ role: "user", content: prompt }]);
            const respostaLimpa = data.reply.replace(/^```json\s*/, "").replace(/```$/, "").trim();
            const respostaJson = JSON.parse(respostaLimpa);

            const fmtData = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado';

            const relatorio = `**Relatório do Pacote**
--------------------
**Nº de Reserva/Localizador:** ${respostaJson.reserva || 'Não informado'}
**Destino Principal:** ${respostaJson.destino || 'Não informado'}
**Passageiros:** ${respostaJson.passageiros || 'Não informado'}
**Data de Ida:** ${fmtData(respostaJson.dataIda)}
**Horário de Saída (Ida):** ${respostaJson.horaSaidaIda || 'Não informado'}
**Horário de Chegada (Ida):** ${respostaJson.horaChegadaIda || 'Não informado'}
**Data de Volta:** ${fmtData(respostaJson.dataVolta)}
**Horário de Saída (Volta):** ${respostaJson.horaSaidaVolta || 'Não informado'}
**Horário de Chegada (Volta):** ${respostaJson.horaChegadaVolta || 'Não informado'}
**Outras Informações:** ${respostaJson.outrasInfos || 'Nenhuma'}`;

            // Atualiza o formulário com os dados extraídos do primeiro documento analisado com sucesso
            setForm((f) => ({
              ...f,
              destino: f.destino || respostaJson.destino || '',
              dataIda: f.dataIda || respostaJson.dataIda || '',
              dataVolta: f.dataVolta || respostaJson.dataVolta || '',
              passageiros: f.passageiros || respostaJson.passageiros || '',
            }));

            return { ...doc, analise: relatorio };
          } catch (error) {
            const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido ao contatar a IA.";
            return { ...doc, analise: `Falha na análise com IA: ${mensagemErro}` };
          }
        })
      );

      setForm((f) => ({ ...f, documentos: novasAnalises }));
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido ao contatar a IA.";
      setErro(`Falha na análise com IA: ${mensagemErro}`);
    } finally {
      setAnalisandoIA(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Seção de Anexos e Análise com IA */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 font-semibold text-gray-900">
            <Upload className="h-4 w-4 text-indigo-500" />
            Anexos e Análise de IA
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAnaliseMinimizada((prev) => !prev)}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            {analiseMinimizada ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            {analiseMinimizada ? "Maximizar" : "Minimizar"}
          </Button>
        </div>
        {!analiseMinimizada && (
          <>
            <p className="text-xs text-gray-500 mb-4 -mt-3">Anexe os documentos do pacote e use a IA para extrair os dados.</p>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={analisarDocumentosComIA}
              disabled={analisandoIA || (form.documentos || []).length === 0}
              className="gap-2 text-indigo-600 border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            ><Sparkles className={`w-4 h-4 ${analisandoIA ? "animate-spin" : ""}`} /> {analisandoIA ? "Analisando..." : "Analisar com IA"}</Button>
          </>
        )}
      </Card>

      {/* Seção de Detalhes do Pacote */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 font-semibold text-gray-900">
            <Package2 className="h-4 w-4 text-indigo-500" />
            Adicionar Pacote Manualmente
          </h4>
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

        {!formMinimizado && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <Label className="text-xs">Descrição</Label>
                <textarea
                  rows={3}
                  placeholder="Detalhes do pacote"
                  value={form.descricao}
                  onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none"
                />
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
                {editandoId !== null ? "Salvar pacote" : "Adicionar pacote"}
              </Button>
              {editandoId !== null && (
                <Button type="button" variant="outline" onClick={limparFormulario}>
                  Cancelar edição
                </Button>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Lista de Pacotes Adicionados */}
      <div className="space-y-3">
        {pacotes.map((pacote, index) => (
          <Card key={pacote.id} className="p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-400">Pacote {index + 1}</p>
                <p className="font-semibold text-gray-900">{pacote.operador || "Sem operador"}</p>
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
