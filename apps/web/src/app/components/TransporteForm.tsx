import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { ChevronDown, ChevronUp, Plus, Trash2, Upload, FileText, Image, X } from "lucide-react";

interface Transporte {
  id: number;
  tipo: string;
  empresa: string;
  diaRoteiro: string;
  origem: string;
  destino: string;
  dataHoraSaida: string;
  dataHoraChegada: string;
  valor: number;
  codigoReserva: string;
  descricao: string;
  voucher: string | null;
  voucherTipo: "pdf" | "imagem" | null;
  voucherNome: string;
}

interface TransporteFormProps {
  transportes: Transporte[];
  onTransportesChange: (transportes: Transporte[]) => void;
}

const tiposTransporte = [
  "Transfer",
  "Locação de Veículo",
  "Táxi / Uber",
  "Van / Micro-ônibus",
  "Ônibus",
  "Trem",
  "Metrô",
  "Barco / Ferry",
  "Bicicleta",
  "Outro",
];

export default function TransporteForm({ transportes, onTransportesChange }: TransporteFormProps) {
  const [form, setForm] = useState<Transporte>({
    id: 0,
    tipo: "",
    empresa: "",
    diaRoteiro: "",
    origem: "",
    destino: "",
    dataHoraSaida: "",
    dataHoraChegada: "",
    valor: 0,
    codigoReserva: "",
    descricao: "",
    voucher: null,
    voucherTipo: null,
    voucherNome: "",
  });
  const [erro, setErro] = useState("");
  const [formMinimizado, setFormMinimizado] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const adicionarTransporte = () => {
    if (!form.tipo || !form.empresa || !form.origem || !form.destino) {
      setErro("Preencha os campos obrigatórios: Tipo, Empresa, Origem e Destino.");
      return;
    }

    const novoTransporte: Transporte = {
      ...form,
      id: Date.now(),
    };

    onTransportesChange([...transportes, novoTransporte]);

    // Limpar formulário
    setForm({
      id: 0,
      tipo: "",
      empresa: "",
      diaRoteiro: "",
      origem: "",
      destino: "",
      dataHoraSaida: "",
      dataHoraChegada: "",
      valor: 0,
      codigoReserva: "",
      descricao: "",
      voucher: null,
      voucherTipo: null,
      voucherNome: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErro("");
  };

  const removerTransporte = (id: number) => {
    onTransportesChange(transportes.filter((t) => t.id !== id));
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="space-y-4">
      {/* Formulário de cadastro */}
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="font-semibold text-gray-900">Adicionar Transporte</h4>
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
            <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  {tiposTransporte.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">
                  Empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: Localiza, Uber, etc."
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Dia do Roteiro</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 1, 2, 3..."
                  value={form.diaRoteiro}
                  onChange={(e) => setForm({ ...form, diaRoteiro: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">
                  Origem <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: Aeroporto de Guarulhos"
                  value={form.origem}
                  onChange={(e) => setForm({ ...form, origem: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">
                  Destino <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: Hotel Copacabana Palace"
                  value={form.destino}
                  onChange={(e) => setForm({ ...form, destino: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Data / Hora Saída</Label>
                <Input
                  type="datetime-local"
                  value={form.dataHoraSaida}
                  onChange={(e) => setForm({ ...form, dataHoraSaida: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Data / Hora Chegada / Devolução</Label>
                <Input
                  type="datetime-local"
                  value={form.dataHoraChegada}
                  onChange={(e) => setForm({ ...form, dataHoraChegada: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Valor R$</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.valor || ""}
                  onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Código de Reserva</Label>
                <Input
                  placeholder="Ex: ABC123"
                  value={form.codigoReserva}
                  onChange={(e) => setForm({ ...form, codigoReserva: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="mb-3">
              <Label className="text-xs">Descrição</Label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Informações adicionais sobre o transporte..."
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none"
              />
            </div>

            {/* Voucher */}
            <div className="mb-3">
              <Label className="text-xs">Voucher (PDF ou Imagem)</Label>
              <div className="mt-1">
                {form.voucher ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    {form.voucherTipo === "pdf" ? (
                      <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={form.voucher}
                          alt="Voucher"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {form.voucherNome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {form.voucherTipo === "pdf" ? "Documento PDF" : "Imagem"}
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

            {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}

            <Button
              onClick={adicionarTransporte}
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Transporte
            </Button>
          </>
        )}
      </Card>

      {/* Lista de transportes adicionados */}
      {transportes.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Transportes Adicionados ({transportes.length})
          </h4>
          <div className="space-y-3">
            {transportes.map((transp, idx) => (
              <div
                key={transp.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">
                      {transp.tipo}
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      {transp.empresa}
                    </span>
                    {transp.diaRoteiro && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        Dia {transp.diaRoteiro}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {transp.origem} → {transp.destino}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                    {transp.dataHoraSaida && (
                      <span>
                        Saída:{" "}
                        {new Date(transp.dataHoraSaida).toLocaleString("pt-BR")}
                      </span>
                    )}
                    {transp.dataHoraChegada && (
                      <span>
                        Chegada:{" "}
                        {new Date(transp.dataHoraChegada).toLocaleString("pt-BR")}
                      </span>
                    )}
                    {transp.valor > 0 && (
                      <span className="font-semibold text-indigo-600">
                        {formatarMoeda(transp.valor)}
                      </span>
                    )}
                  </div>
                  {transp.codigoReserva && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Reserva: <span className="font-mono font-semibold">{transp.codigoReserva}</span>
                    </p>
                  )}
                  {transp.descricao && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">
                      {transp.descricao}
                    </p>
                  )}
                  {transp.voucher && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {transp.voucherTipo === "pdf" ? (
                        <FileText className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Image className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {transp.voucherNome}
                      </span>
                      <button
                        onClick={() => {
                          if (transp.voucher) {
                            const win = window.open("");
                            win?.document.write(
                              transp.voucherTipo === "pdf"
                                ? `<iframe src="${transp.voucher}" style="width:100%;height:100%;border:none;"></iframe>`
                                : `<img src="${transp.voucher}" style="max-width:100%;max-height:100vh;display:block;margin:auto;" />`
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
                  onClick={() => removerTransporte(transp.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors ml-3 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-semibold text-gray-900">
              Total Transporte:{" "}
              {formatarMoeda(
                transportes.reduce((sum, t) => sum + t.valor, 0)
              )}
            </p>
          </div>
        </Card>
      )}

      {transportes.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum transporte adicionado. Preencha o formulário acima para adicionar.
        </div>
      )}
    </div>
  );
}