import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import {
  Plus,
  Trash2,
  Search,
  MapPin,
  Star,
  Globe,
  Sparkles,
  Clock,
  FileText,
  Image,
  Upload,
  X,
  Calendar,
  DollarSign,
} from "lucide-react";
import { buscarExperienciasDestino } from "../data/destinationsApi";

interface Experiencia {
  id: number;
  nome: string;
  local: string;
  endereco: string;
  tipo: string;
  data: string;
  horario: string;
  duracao: string;
  qtdPessoas: number;
  preco: number;
  descricao: string;
  inclui: string;
  observacoes: string;
  voucher: string | null;
  voucherTipo: "pdf" | "imagem" | null;
  voucherNome: string;
}

interface ExperienciasFormProps {
  experiencias: Experiencia[];
  onExperienciasChange: (experiencias: Experiencia[]) => void;
}

const tiposExperiencia = [
  "Passeio Turístico",
  "Aventura",
  "Cultural",
  "Gastronômico",
  "Relaxamento / Spa",
  "Ecoturismo",
  "Mergulho",
  "Trilha",
  "City Tour",
  "Show / Evento",
  "Museu",
  "Parque Temático",
  "Aula / Workshop",
  "Esportes",
  "Vida Noturna",
  "Fotografia",
  "Outro",
];

export default function ExperienciasForm({
  experiencias,
  onExperienciasChange,
}: ExperienciasFormProps) {
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [avisoTemporario, setAvisoTemporario] = useState("");
  const [buscou, setBuscou] = useState(false);
  const [selecionado, setSelecionado] = useState<any | null>(null);
  const [mostrarManual, setMostrarManual] = useState(false);
  const [formDetalhes, setFormDetalhes] = useState({
    data: "",
    horario: "",
    duracao: "",
    qtdPessoas: 1,
    preco: 0,
    tipo: "",
    inclui: "",
  });
  const [formManual, setFormManual] = useState({
    nome: "",
    local: "",
    endereco: "",
    descricao: "",
    observacoes: "",
  });
  const [voucher, setVoucher] = useState<{
    base64: string;
    tipo: "pdf" | "imagem";
    nome: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formManualRef = useRef<HTMLDivElement>(null);

  const buscarExperiencia = async () => {
    if (!busca.trim()) {
      setErro("Digite um local para buscar");
      return;
    }

    setCarregando(true);
    setErro("");
    setResultados([]);
    setBuscou(false);
    setMostrarManual(false);
    setAvisoTemporario("");

    try {
      const resposta = await buscarExperienciasDestino(busca);
      const itens = Array.isArray(resposta?.itens) ? resposta.itens : [];
      setResultados(itens);
      if (resposta?.fallback) {
        setAvisoTemporario("Resultados temporários.");
      }

      if (itens.length === 0) {
        setErro("Nenhuma experiência encontrada. Adicione manualmente ou tente outra busca.");
        setMostrarManual(true);
      }
    } catch (err) {
      console.error("Erro ao buscar experiências:", err);
      setErro(
        "Erro ao buscar experiências. Você pode adicionar manualmente."
      );
      setMostrarManual(true);
    } finally {
      setCarregando(false);
      setBuscou(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPDF = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPDF && !isImage) {
      setErro("Apenas arquivos PDF ou imagem (JPG, PNG, etc.) são permitidos.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setVoucher({
        base64,
        tipo: isPDF ? "pdf" : "imagem",
        nome: file.name,
      });
      setErro("");
    };
    reader.readAsDataURL(file);
  };

  const removerVoucher = () => {
    setVoucher(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const abrirDetalhes = (exp: any) => {
    setSelecionado(exp);
    setErro("");
  };

  const adicionarExperiencia = () => {
    if (!selecionado || !formDetalhes.data) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    const novaExperiencia: Experiencia = {
      id: Date.now(),
      nome: selecionado.nome,
      local: selecionado.local,
      endereco: selecionado.endereco,
      tipo: formDetalhes.tipo,
      data: formDetalhes.data,
      horario: formDetalhes.horario,
      duracao: formDetalhes.duracao,
      qtdPessoas: formDetalhes.qtdPessoas,
      preco: formDetalhes.preco,
      descricao: selecionado.descricao || "",
      inclui: formDetalhes.inclui,
      observacoes: "",
      voucher: voucher?.base64 || null,
      voucherTipo: voucher?.tipo || null,
      voucherNome: voucher?.nome || "",
    };

    onExperienciasChange([...experiencias, novaExperiencia]);

    setSelecionado(null);
    setFormDetalhes({
      data: "",
      horario: "",
      duracao: "",
      qtdPessoas: 1,
      preco: 0,
      tipo: "",
      inclui: "",
    });
    setResultados([]);
    setBusca("");
    setVoucher(null);
    setBuscou(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const adicionarExperienciaManual = () => {
    if (!formManual.nome.trim() || !formManual.local.trim()) {
      setErro("Preencha os campos obrigatórios: Nome e Local.");
      return;
    }
    if (!formDetalhes.data) {
      setErro("Preencha a data da experiência.");
      return;
    }

    const novaExperiencia: Experiencia = {
      id: Date.now(),
      nome: formManual.nome,
      local: formManual.local,
      endereco: formManual.endereco,
      tipo: formDetalhes.tipo,
      data: formDetalhes.data,
      horario: formDetalhes.horario,
      duracao: formDetalhes.duracao,
      qtdPessoas: formDetalhes.qtdPessoas,
      preco: formDetalhes.preco,
      descricao: formManual.descricao,
      inclui: formDetalhes.inclui,
      observacoes: formManual.observacoes,
      voucher: voucher?.base64 || null,
      voucherTipo: voucher?.tipo || null,
      voucherNome: voucher?.nome || "",
    };

    onExperienciasChange([...experiencias, novaExperiencia]);

    setFormManual({
      nome: "",
      local: "",
      endereco: "",
      descricao: "",
      observacoes: "",
    });
    setFormDetalhes({
      data: "",
      horario: "",
      duracao: "",
      qtdPessoas: 1,
      preco: 0,
      tipo: "",
      inclui: "",
    });
    setVoucher(null);
    setMostrarManual(false);
    setErro("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removerExperiencia = (id: number) => {
    onExperienciasChange(experiencias.filter((e) => e.id !== id));
  };

  const abrirFormManual = () => {
    setMostrarManual(true);
    setResultados([]);
    setSelecionado(null);
    setErro("");
    setBuscou(false);
    // Scroll para o formulário manual
    setTimeout(() => formManualRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">
          <Sparkles className="w-4 h-4 inline-block mr-2 text-indigo-500" />
          Buscar Experiências / Atrações
        </h4>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Local / Cidade / Atração</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Ex: Paris, Nova York, Disney..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && buscarExperiencia()
                }
                className="flex-1"
              />
              <Button
                onClick={buscarExperiencia} 
                disabled={carregando}
                size="icon"
                className="w-auto gap-2 px-4"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {erro && (
            <p className="text-xs text-red-500">{erro}</p>
          )}
          {avisoTemporario && (
            <p className="text-xs text-amber-600">{avisoTemporario}</p>
          )}
        </div>
      </Card>
      <div className="text-center">
        <Button variant="link" onClick={abrirFormManual} className="text-indigo-600 text-sm">
          Não encontrou a experiência? Adicionar manualmente
        </Button>
      </div>

      {/* Resultados da busca */}
      {resultados.length > 0 && !selecionado && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              <Globe className="w-4 h-4 inline-block mr-1 text-blue-500" />
              Experiências Encontradas ({resultados.length})
              {avisoTemporario && (
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Temporário
                </span>
              )}
            </h4>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {resultados.map((exp, idx) => (
              <button
                key={exp.placeId || idx}
                onClick={() => abrirDetalhes(exp)}
                className="w-full text-left p-3 border rounded-lg hover:bg-white hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="font-medium text-gray-900 truncate">
                        {exp.nome}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{exp.endereco}</span>
                    </p>
                    {exp.descricao && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                        {exp.descricao}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    {exp.classificacao > 0 && (
                      <p className="font-semibold text-indigo-600 text-sm">
                        <Star className="w-3 h-3 inline-block text-yellow-500" />{" "}
                        {exp.classificacao.toFixed(1)}
                        {exp.totalAvaliacoes && (
                          <span className="text-xs text-gray-400 font-normal">
                            {" "}
                            ({exp.totalAvaliacoes})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {resultados.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMostrarManual(true);
                  setResultados([]);
                }}
                className="text-xs text-indigo-600 w-full"
              >
                Não encontrou o ideal?{" "}
                <strong className="ml-1">Adicionar manualmente</strong>
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Sem resultados */}
      {buscou && resultados.length === 0 && !selecionado && !mostrarManual && (
        <Card className="p-6 text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500 mb-3">
            Nenhuma experiência encontrada para "{busca}".
          </p>
          <Button onClick={() => setMostrarManual(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Manualmente
          </Button>
        </Card>
      )}

      {/* Detalhes do selecionado */}
      {selecionado && (
        <Card className="p-4 bg-green-50 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3">
            <Sparkles className="w-4 h-4 inline-block mr-1" />
            {selecionado.nome}
          </h4>

          <div className="bg-white p-3 rounded mb-3 text-sm">
            <p className="font-medium text-gray-900">{selecionado.local}</p>
            <p className="text-xs text-gray-500">{selecionado.endereco}</p>
            {selecionado.classificacao > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  <Star className="w-3 h-3 inline-block mr-0.5" />
                  {selecionado.classificacao.toFixed(1)}
                </span>
              </div>
            )}
            {selecionado.descricao && (
              <p className="text-xs text-gray-500 mt-2">{selecionado.descricao}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">Tipo de Experiência</Label>
              <select
                value={formDetalhes.tipo}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, tipo: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Selecione o tipo</option>
                {tiposExperiencia.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">
                Data <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formDetalhes.data}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, data: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Horário</Label>
              <Input
                type="time"
                value={formDetalhes.horario}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, horario: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Duração</Label>
              <Input
                placeholder="Ex: 2h, 4h, Dia inteiro"
                value={formDetalhes.duracao}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, duracao: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Nº de Pessoas</Label>
              <Input
                type="number"
                min="1"
                value={formDetalhes.qtdPessoas}
                onChange={(e) =>
                  setFormDetalhes({
                    ...formDetalhes,
                    qtdPessoas: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Preço (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={formDetalhes.preco || ""}
                onChange={(e) =>
                  setFormDetalhes({
                    ...formDetalhes,
                    preco: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Inclui</Label>
              <Input
                placeholder="Ex: Ingresso, transporte, guia..."
                value={formDetalhes.inclui}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, inclui: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Voucher */}
          <div className="mb-3">
            <Label className="text-xs">Voucher / Ingresso (PDF ou Imagem)</Label>
            <div className="mt-1">
              {voucher ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  {voucher.tipo === "pdf" ? (
                    <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={voucher.base64}
                        alt="Voucher"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {voucher.nome}
                    </p>
                    <p className="text-xs text-gray-500">
                      {voucher.tipo === "pdf" ? "Documento PDF" : "Imagem"}
                    </p>
                  </div>
                  <button
                    onClick={removerVoucher}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    Clique para fazer upload do voucher
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    PDF ou imagem (JPG, PNG)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {erro && selecionado && (
            <p className="text-xs text-red-500 mb-3">{erro}</p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={adicionarExperiencia}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Experiência
            </Button>
            <Button
              onClick={() => setSelecionado(null)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Formulário manual */}
      {mostrarManual && !selecionado && (
        <Card ref={formManualRef} className="p-4 border-2 border-dashed border-indigo-300 bg-indigo-50/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              <Sparkles className="w-4 h-4 inline-block mr-1 text-indigo-500" />
              Adicionar Experiência Manualmente
            </h4>
            <button
              onClick={() => {
                setMostrarManual(false);
                setBuscou(false);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">
                Nome da Experiência <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Tour pelo Louvre"
                value={formManual.nome}
                onChange={(e) =>
                  setFormManual({ ...formManual, nome: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">
                Local / Cidade <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Paris, França"
                value={formManual.local}
                onChange={(e) =>
                  setFormManual({ ...formManual, local: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Endereço / Ponto de Encontro</Label>
              <Input
                placeholder="Ex: Museu do Louvre, Paris"
                value={formManual.endereco}
                onChange={(e) =>
                  setFormManual({ ...formManual, endereco: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Tipo de Experiência</Label>
              <select
                value={formDetalhes.tipo}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, tipo: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Selecione o tipo</option>
                {tiposExperiencia.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">
                Data <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formDetalhes.data}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, data: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Horário</Label>
              <Input
                type="time"
                value={formDetalhes.horario}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, horario: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Duração</Label>
              <Input
                placeholder="Ex: 2h, 4h, Dia inteiro"
                value={formDetalhes.duracao}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, duracao: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Nº de Pessoas</Label>
              <Input
                type="number"
                min="1"
                value={formDetalhes.qtdPessoas}
                onChange={(e) =>
                  setFormDetalhes({
                    ...formDetalhes,
                    qtdPessoas: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Preço (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={formDetalhes.preco || ""}
                onChange={(e) =>
                  setFormDetalhes({
                    ...formDetalhes,
                    preco: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Inclui</Label>
              <Input
                placeholder="Ex: Ingresso, transporte, guia, alimentação..."
                value={formDetalhes.inclui}
                onChange={(e) =>
                  setFormDetalhes({ ...formDetalhes, inclui: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Descrição</Label>
              <textarea
                value={formManual.descricao}
                onChange={(e) =>
                  setFormManual({ ...formManual, descricao: e.target.value })
                }
                placeholder="Descreva a experiência, o que esperar, etc."
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Observações</Label>
              <textarea
                value={formManual.observacoes}
                onChange={(e) =>
                  setFormManual({ ...formManual, observacoes: e.target.value })
                }
                placeholder="O que levar, restrições, etc."
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none"
              />
            </div>
          </div>

          {/* Voucher */}
          <div className="mb-3">
            <Label className="text-xs">Voucher / Ingresso (PDF ou Imagem)</Label>
            <div className="mt-1">
              {voucher ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  {voucher.tipo === "pdf" ? (
                    <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={voucher.base64}
                        alt="Voucher"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {voucher.nome}
                    </p>
                    <p className="text-xs text-gray-500">
                      {voucher.tipo === "pdf" ? "Documento PDF" : "Imagem"}
                    </p>
                  </div>
                  <button
                    onClick={removerVoucher}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    Clique para fazer upload do voucher
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    PDF ou imagem (JPG, PNG)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {erro && mostrarManual && (
            <p className="text-xs text-red-500 mb-3">{erro}</p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={adicionarExperienciaManual}
              className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Experiência
            </Button>
            <Button
              onClick={() => {
                setMostrarManual(false);
                setBuscou(false);
              }}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de experiências adicionadas */}
      {experiencias.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            <Sparkles className="w-4 h-4 inline-block mr-1 text-green-500" />
            Experiências Adicionadas ({experiencias.length})
          </h4>
          <div className="space-y-2">
            {experiencias.map((exp, idx) => (
              <div
                key={exp.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">
                      {exp.nome}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {exp.local}
                    </span>
                    {exp.tipo && (
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded">
                        {exp.tipo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <Calendar className="w-3 h-3 inline-block mr-0.5" />
                    {exp.data}
                    {exp.horario && <> às {exp.horario}</>}
                    {exp.duracao && <> • {exp.duracao}</>}
                    {" • "}
                    {exp.qtdPessoas} pessoa{exp.qtdPessoas !== 1 ? "s" : ""}
                  </p>
                  {exp.preco > 0 && (
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                      <DollarSign className="w-3 h-3 inline-block" />
                      R${" "}
                      {exp.preco.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  )}
                  {exp.inclui && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Inclui: {exp.inclui}
                    </p>
                  )}
                  {exp.descricao && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {exp.descricao}
                    </p>
                  )}
                  {exp.voucher && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {exp.voucherTipo === "pdf" ? (
                        <FileText className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Image className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {exp.voucherNome}
                      </span>
                      <button
                        onClick={() => {
                          if (exp.voucher) {
                            const win = window.open("");
                            win?.document.write(
                              exp.voucherTipo === "pdf"
                                ? `<iframe src="${exp.voucher}" style="width:100%;height:100%;border:none;"></iframe>`
                                : `<img src="${exp.voucher}" style="max-width:100%;max-height:100vh;display:block;margin:auto;" />`
                            );
                          }
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                      >
                        Visualizar
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removerExperiencia(exp.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors ml-3 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-semibold text-gray-900">
              Total Experiências: R${" "}
              {experiencias
                .reduce((sum, e) => sum + (e.preco || 0), 0)
                .toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </p>
          </div>
        </Card>
      )}

      {experiencias.length === 0 && !mostrarManual && !selecionado && !carregando && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhuma experiência adicionada. Busque acima ou adicione manualmente.
        </div>
      )}
    </div>
  );
}