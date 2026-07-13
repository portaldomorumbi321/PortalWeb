import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import {
  Plus,
  Trash2,
  Search,
  Shield,
  Calendar,
  FileText,
  Image,
  Upload,
  X,
  Lightbulb,
  Globe,
  DollarSign,
  Clock,
} from "lucide-react";

interface Seguro {
  id: number;
  tipo: string;
  seguradora: string;
  apolice: string;
  dataInicio: string;
  dataFim: string;
  cobertura: string;
  valor: number;
  contatoEmergencia: string;
  telefoneEmergencia: string;
  observacoes: string;
  voucher: string | null;
  voucherTipo: "pdf" | "imagem" | null;
  voucherNome: string;
}

interface SeguroFormProps {
  seguros: Seguro[];
  onSegurosChange: (seguros: Seguro[]) => void;
}

const tiposSeguro = [
  "Saúde / Médico",
  "Bagagem",
  "Cancelamento",
  "Extravio de Documentos",
  "Responsabilidade Civil",
  "Acidentes Pessoais",
  "Multirisco",
  "Assistência Viagem",
  "Automóvel (Locação)",
  "Outro",
];

const sugestoesCobertura = [
  "Despesas médicas e hospitalares",
  "Repatriação médica e funerária",
  "Extravio de bagagem",
  "Cancelamento / interrupção de viagem",
  "Atraso de voo",
  "Indenização por invalidez",
  "Assistência farmacêutica",
  "Cobertura para COVID-19",
];

export default function SeguroForm({
  seguros,
  onSegurosChange,
}: SeguroFormProps) {
  const [form, setForm] = useState<Seguro>({
    id: 0,
    tipo: "",
    seguradora: "",
    apolice: "",
    dataInicio: "",
    dataFim: "",
    cobertura: "",
    valor: 0,
    contatoEmergencia: "",
    telefoneEmergencia: "",
    observacoes: "",
    voucher: null,
    voucherTipo: null,
    voucherNome: "",
  });
  const [erro, setErro] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Sugestão de integração com API de cotação de seguros
  const [mostrarSugestoesCobertura, setMostrarSugestoesCobertura] = useState(false);

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
      setForm({
        ...form,
        voucher: base64,
        voucherTipo: isPDF ? "pdf" : "imagem",
        voucherNome: file.name,
      });
      setErro("");
    };
    reader.readAsDataURL(file);
  };

  const removerVoucher = () => {
    setForm({ ...form, voucher: null, voucherTipo: null, voucherNome: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const adicionarSeguro = () => {
    if (!form.tipo || !form.seguradora) {
      setErro("Preencha os campos obrigatórios: Tipo e Seguradora.");
      return;
    }

    const novoSeguro: Seguro = {
      ...form,
      id: Date.now(),
    };

    onSegurosChange([...seguros, novoSeguro]);

    setForm({
      id: 0,
      tipo: "",
      seguradora: "",
      apolice: "",
      dataInicio: "",
      dataFim: "",
      cobertura: "",
      valor: 0,
      contatoEmergencia: "",
      telefoneEmergencia: "",
      observacoes: "",
      voucher: null,
      voucherTipo: null,
      voucherNome: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErro("");
  };

  const removerSeguro = (id: number) => {
    onSegurosChange(seguros.filter((s) => s.id !== id));
  };

  const toggleCobertura = (cobertura: string) => {
    const coberturasAtuais = form.cobertura
      ? form.cobertura.split(", ").map((c) => c.trim())
      : [];
    if (coberturasAtuais.includes(cobertura)) {
      setForm({
        ...form,
        cobertura: coberturasAtuais
          .filter((c) => c !== cobertura)
          .join(", "),
      });
    } else {
      setForm({
        ...form,
        cobertura: [...coberturasAtuais, cobertura].join(", "),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Sugestão de integração com API de cotação */}
      <Card className="p-4 bg-purple-50 border border-purple-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-900">
              Sugestão: Cotação Automática de Seguros
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Integre com APIs de seguradoras (ex: SulAmérica, Porto Seguro,
              Allianz Travel) ou plataformas de comparação (ex: SegurosPromo,
              Confiance) para cotar e contratar seguros automaticamente.
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Exemplo:{" "}
              <code className="bg-purple-100 px-1 rounded">
                GET /api/seguradoras?destino=Paris&duracao=7&idade=30
              </code>
            </p>
          </div>
        </div> {/* Closing div for <div className="flex items-start gap-3"> */}
      </Card> {/* Closing Card for the suggestion box */}

      {!mostrarForm && (
        <div className="text-center">
          <Button variant="link" onClick={() => setMostrarForm(true)} className="text-indigo-600 text-sm">
            Adicionar seguro manualmente
          </Button>
        </div>
      )}

      {/* Formulário de cadastro */}
      {mostrarForm && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              Adicionar Seguro
            </h4>
            <Button variant="ghost" size="icon" onClick={() => setMostrarForm(false)} className="h-7 w-7 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div>
              <Label className="text-xs">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Selecione o tipo</option>
                {tiposSeguro.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">
                Seguradora <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: SulAmérica, Porto Seguro"
                value={form.seguradora}
                onChange={(e) => setForm({ ...form, seguradora: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Nº da Apólice</Label>
              <Input
                placeholder="Ex: AP-2025-123456"
                value={form.apolice}
                onChange={(e) => setForm({ ...form, apolice: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Data Início</Label>
              <Input
                type="date"
                value={form.dataInicio}
                onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Data Fim</Label>
              <Input
                type="date"
                value={form.dataFim}
                onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.valor || ""}
                onChange={(e) =>
                  setForm({ ...form, valor: parseFloat(e.target.value) || 0 })
                }
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-xs">Cobertura</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  placeholder="Ex: Médico, Bagagem, Cancelamento"
                  value={form.cobertura}
                  onChange={(e) => setForm({ ...form, cobertura: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarSugestoesCobertura(!mostrarSugestoesCobertura)}
                  className="text-xs whitespace-nowrap"
                >
                  {mostrarSugestoesCobertura ? "Fechar" : "Sugestões"}
                </Button>
              </div>

              {mostrarSugestoesCobertura && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-[10px] text-gray-500 mb-1.5 font-medium">
                    Selecione as coberturas desejadas:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sugestoesCobertura.map((c) => {
                      const ativo = form.cobertura
                        .split(", ")
                        .map((x) => x.trim())
                        .includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCobertura(c)}
                          className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                            ativo
                              ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                              : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {ativo && "✓ "}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label className="text-xs">Contato de Emergência</Label>
              <Input
                placeholder="Nome do contato"
                value={form.contatoEmergencia}
                onChange={(e) =>
                  setForm({ ...form, contatoEmergencia: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-xs">Telefone de Emergência</Label>
              <Input
                placeholder="+55 11 99999-9999"
                value={form.telefoneEmergencia}
                onChange={(e) =>
                  setForm({ ...form, telefoneEmergencia: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="sm:col-span-3">
              <Label className="text-xs">Observações</Label>
              <textarea
                value={form.observacoes}
                onChange={(e) =>
                  setForm({ ...form, observacoes: e.target.value })
                }
                placeholder="Informações adicionais sobre o seguro..."
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none"
              />
            </div>
          </div>

          {/* Documento da apólice */}
          <div className="mb-3">
            <Label className="text-xs">Documento da Apólice (PDF)</Label>
            <div className="mt-1">
              {form.voucher ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {form.voucherNome}
                    </p>
                    <p className="text-xs text-gray-500">Documento PDF</p>
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
                    Clique para fazer upload da apólice
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    PDF (JPG, PNG também aceitos)
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

          {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}

          <Button
            onClick={adicionarSeguro}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Adicionar Seguro
          </Button>
        </Card>
      )}

      {/* Lista de seguros adicionados */}
      {seguros.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Seguros Adicionados ({seguros.length})
          </h4>
          <div className="space-y-3">
            {seguros.map((seg, idx) => (
              <div
                key={seg.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">
                      {seg.tipo}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {seg.seguradora}
                    </span>
                    {seg.apolice && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        {seg.apolice}
                      </span>
                    )}
                  </div>
                  {(seg.dataInicio || seg.dataFim) && (
                    <p className="text-xs text-gray-600 mt-1">
                      <Calendar className="w-3 h-3 inline-block mr-0.5" />
                      {seg.dataInicio && new Date(seg.dataInicio).toLocaleDateString("pt-BR")}
                      {seg.dataInicio && seg.dataFim && " → "}
                      {seg.dataFim && new Date(seg.dataFim).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {seg.cobertura && (
                    <p className="text-xs text-gray-600 mt-1">
                      <Shield className="w-3 h-3 inline-block mr-0.5" />
                      {seg.cobertura}
                    </p>
                  )}
                  {seg.valor > 0 && (
                    <p className="text-xs font-semibold text-indigo-600 mt-1">
                      R${" "}
                      {seg.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  )}
                  {(seg.contatoEmergencia || seg.telefoneEmergencia) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Emergência: {seg.contatoEmergencia}
                      {seg.contatoEmergencia && seg.telefoneEmergencia && " - "}
                      {seg.telefoneEmergencia}
                    </p>
                  )}
                  {seg.observacoes && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">
                      {seg.observacoes}
                    </p>
                  )}
                  {seg.voucher && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {seg.voucherNome}
                      </span>
                      <button
                        onClick={() => {
                          if (seg.voucher) {
                            const win = window.open("");
                            win?.document.write(
                              seg.voucherTipo === "pdf"
                                ? `<iframe src="${seg.voucher}" style="width:100%;height:100%;border:none;"></iframe>`
                                : `<img src="${seg.voucher}" style="max-width:100%;max-height:100vh;display:block;margin:auto;" />`
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
                  onClick={() => removerSeguro(seg.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors ml-3 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-semibold text-gray-900">
              Total Seguros: R${" "}
              {seguros
                .reduce((sum, s) => sum + (s.valor || 0), 0)
                .toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </p>
          </div>
        </Card>
      )}

      {seguros.length === 0 && !mostrarForm && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum seguro adicionado. Preencha o formulário acima para adicionar.
        </div>
      )}
    </div>
  );
}