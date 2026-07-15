import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Plus, Trash2, Search, Plane, Upload, FileText, Image, Link2, X } from "lucide-react";

interface Voo {
  id: number;
  companhia: string;
  numero: string;
  data: string;
  origem: string;
  destino: string;
  partida: string;
  chegada: string;
  valor?: number;
  duracao: string;
  documento: string | null;
  documentoTipo: "pdf" | "imagem" | null;
  documentoNome: string;
  linkVoo: string;
}

interface VoosFormProps {
  voos: Voo[];
  onVoosChange: (voos: Voo[]) => void;
}

const companhiasAereas = [
  "TAP Air Portugal",
  "LATAM Airlines",
  "GOL Linhas Aéreas",
  "Azul Linhas Aéreas",
  "American Airlines",
  "Delta Air Lines",
  "United Airlines",
  "Lufthansa",
  "Air France",
  "KLM",
  "British Airways",
  "Iberia",
  "Emirates",
  "Qatar Airways",
];

export default function VoosForm({ voos, onVoosChange }: VoosFormProps) {
  const [busca, setBusca] = useState({ companhia: "", numero: "", data: "" });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<Voo | null>(null);
  const [mostrarManual, setMostrarManual] = useState(false);
  const [formManual, setFormManual] = useState<Omit<Voo, 'id'>>({
    companhia: "",
    numero: "",
    data: "",
    origem: "",
    destino: "",
    partida: "",
    chegada: "",
    valor: 0,
    duracao: "",
    documento: null,
    documentoTipo: null,
    documentoNome: "",
    linkVoo: "",
  });
  const formManualRef = useRef<HTMLDivElement>(null);
  const buscaFileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  const atualizarResultado = (parcial: Partial<Voo>) => {
    setResultados((atual) => (atual ? { ...atual, ...parcial } : atual));
  };

  const handleDocumentoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    origem: "busca" | "manual",
  ) => {
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
      const payload = {
        documento: base64,
        documentoTipo: isPDF ? "pdf" : "imagem" as "pdf" | "imagem",
        documentoNome: file.name,
      };

      if (origem === "busca") {
        atualizarResultado(payload);
      } else {
        setFormManual((atual) => ({ ...atual, ...payload }));
      }

      setErro("");
    };
    reader.readAsDataURL(file);
  };

  const removerDocumento = (origem: "busca" | "manual") => {
    const payload = { documento: null, documentoTipo: null, documentoNome: "" };

    if (origem === "busca") {
      atualizarResultado(payload);
      if (buscaFileInputRef.current) {
        buscaFileInputRef.current.value = "";
      }
      return;
    }

    setFormManual((atual) => ({ ...atual, ...payload }));
    if (manualFileInputRef.current) {
      manualFileInputRef.current.value = "";
    }
  };

  const buscarVoo = async () => {
    if (!busca.companhia || !busca.numero || !busca.data) {
      setErro("Preencha todos os campos");
      return;
    }

    setCarregando(true);
    setMostrarManual(false);
    setErro("");
    
    try {
      // Simular busca em API (pode ser integrada com API real depois)
      // Para demo, vamos retornar dados simulados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const resultado: Voo = {
        id: Date.now(),
        companhia: busca.companhia,
        numero: busca.numero,
        data: busca.data,
        origem: "São Paulo (GIG/CGH)",
        destino: "Rio de Janeiro (RIOx)",
        partida: "14:30",
        chegada: "16:00",
        valor: 0,
        duracao: "1h 30min",
        documento: null,
        documentoTipo: null,
        documentoNome: "",
        linkVoo: "",
      };

      setResultados(resultado);
    } catch (err) {
      setErro("Erro ao buscar voo. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const adicionarVoo = () => {
    if (!resultados) return;
    
    const novoVoo: Voo = {
      ...resultados,
      id: Date.now(),
    };
    
    onVoosChange([...voos, novoVoo]);
    setResultados(null);
    setBusca({ companhia: "", numero: "", data: "" });
    if (buscaFileInputRef.current) {
      buscaFileInputRef.current.value = "";
    }
    setErro("");
  };

  const adicionarVooManual = () => {
    if (!formManual.companhia || !formManual.origem || !formManual.destino || !formManual.data) {
      setErro("Preencha os campos obrigatórios: Cia Aérea, Origem, Destino e Data.");
      return;
    }
    const novoVoo: Voo = {
      ...formManual,
      id: Date.now(),
    };
    onVoosChange([...voos, novoVoo]);
    setFormManual({ companhia: "", numero: "", data: "", origem: "", destino: "", partida: "", chegada: "", valor: 0, duracao: "", documento: null, documentoTipo: null, documentoNome: "", linkVoo: "" });
    if (manualFileInputRef.current) {
      manualFileInputRef.current.value = "";
    }
    setMostrarManual(false);
    setErro("");
  };

  const removerVoo = (id: number) => {
    onVoosChange(voos.filter(v => v.id !== id));
  };

  const abrirFormManual = () => {
    setMostrarManual(true);
    setResultados(null);
    setErro("");
    setTimeout(() => formManualRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Buscar Voo</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <Label className="text-xs">CIA Aérea</Label>
            <Input
              placeholder="Ex: TAP, LATAM..."
              value={busca.companhia}
              onChange={(e) => setBusca({ ...busca, companhia: e.target.value })}
              className="mt-1"
              list="companhias-aereas-list"
            />
            <datalist id="companhias-aereas-list">
              {companhiasAereas.map((cia) => (
                <option key={cia} value={cia} />
              ))}
            </datalist>
          </div>
          <div>
            <Label className="text-xs">Nº Vôo</Label>
            <Input
              placeholder="Ex: TP123"
              value={busca.numero}
              onChange={(e) => setBusca({ ...busca, numero: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Data</Label>
            <Input
              type="date"
              value={busca.data}
              onChange={(e) => setBusca({ ...busca, data: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
        {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}
        <Button
          onClick={buscarVoo}
          disabled={carregando}
          className="w-full sm:w-auto gap-2"
        >
          <Search className="w-4 h-4" />
          {carregando ? "Buscando..." : "Buscar Voo"}
        </Button>
      </Card>
      <div className="text-center">
        <Button variant="link" onClick={abrirFormManual} className="text-indigo-600 text-sm">
          Não encontrou o voo? Adicionar manualmente
        </Button>
      </div>

      {/* Resultado da busca */}
      {resultados && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">Detalhes do Voo</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">Companhia</p>
              <p className="font-semibold text-gray-900">{resultados.companhia}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Número</p>
              <p className="font-mono font-semibold text-gray-900">{resultados.numero}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Data</p>
              <p className="font-semibold text-gray-900">{new Date(resultados.data).toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Origem</p>
              <p className="font-semibold text-gray-900">{resultados.origem}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Destino</p>
              <p className="font-semibold text-gray-900">{resultados.destino}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Duração</p>
              <p className="font-semibold text-gray-900">{resultados.duracao}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Partida</p>
              <p className="font-semibold text-gray-900">{resultados.partida}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Chegada</p>
              <p className="font-semibold text-gray-900">{resultados.chegada}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Valor</p>
              <p className="font-semibold text-gray-900">
                {(resultados.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div>
              <Label className="text-xs">Link do Voo</Label>
              <div className="relative mt-1">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="https://companhia.com/reserva"
                  value={resultados.linkVoo}
                  onChange={(e) => atualizarResultado({ linkVoo: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Documento Anexo</Label>
              <div className="mt-1">
                {resultados.documento ? (
                  <div className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg">
                    {resultados.documentoTipo === "pdf" ? (
                      <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                    ) : (
                      <Image className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{resultados.documentoNome}</p>
                      <p className="text-xs text-gray-500">
                        {resultados.documentoTipo === "pdf" ? "Documento PDF" : "Imagem"}
                      </p>
                    </div>
                    <button
                      onClick={() => removerDocumento("busca")}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => buscaFileInputRef.current?.click()}
                    className="border-2 border-dashed border-blue-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-100/60 transition-colors"
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500">Clique para anexar o documento do voo</p>
                    <p className="text-xs text-gray-400 mt-0.5">PDF, JPG ou PNG</p>
                  </div>
                )}
                <input
                  ref={buscaFileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentoUpload(e, "busca")}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          <Button onClick={adicionarVoo} className="w-full gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4" />
            Adicionar Voo {voos.length > 0 && "(com conexão)"}
          </Button>
        </Card>
      )}

      {/* Formulário Manual */}
      {mostrarManual && (
        <Card ref={formManualRef} className="p-4 border-2 border-dashed border-indigo-300 bg-indigo-50/50">
          <h4 className="font-semibold text-gray-900 mb-4">Adicionar Voo Manualmente</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div>
              <Label className="text-xs">CIA Aérea *</Label>
              <Input placeholder="Ex: LATAM" value={formManual.companhia} onChange={(e) => setFormManual({ ...formManual, companhia: e.target.value })} className="mt-1" list="companhias-aereas-list" />
            </div>
            <div>
              <Label className="text-xs">Nº Voo</Label>
              <Input placeholder="Ex: LA3210" value={formManual.numero} onChange={(e) => setFormManual({ ...formManual, numero: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Data *</Label>
              <Input type="date" value={formManual.data} onChange={(e) => setFormManual({ ...formManual, data: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Origem *</Label>
              <Input placeholder="Ex: São Paulo (GRU)" value={formManual.origem} onChange={(e) => setFormManual({ ...formManual, origem: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Destino *</Label>
              <Input placeholder="Ex: Paris (CDG)" value={formManual.destino} onChange={(e) => setFormManual({ ...formManual, destino: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Duração</Label>
              <Input placeholder="Ex: 11h 30min" value={formManual.duracao} onChange={(e) => setFormManual({ ...formManual, duracao: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Partida</Label>
              <Input type="time" value={formManual.partida} onChange={(e) => setFormManual({ ...formManual, partida: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Chegada</Label>
              <Input type="time" value={formManual.chegada} onChange={(e) => setFormManual({ ...formManual, chegada: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Valor</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formManual.valor ?? 0}
                onChange={(e) => setFormManual({ ...formManual, valor: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0,00"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs">Link do Voo</Label>
              <div className="relative mt-1">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="https://companhia.com/reserva"
                  value={formManual.linkVoo}
                  onChange={(e) => setFormManual({ ...formManual, linkVoo: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs">Documento Anexo</Label>
              <div className="mt-1">
                {formManual.documento ? (
                  <div className="flex items-center gap-3 p-3 bg-white border border-indigo-200 rounded-lg">
                    {formManual.documentoTipo === "pdf" ? (
                      <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                    ) : (
                      <Image className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{formManual.documentoNome}</p>
                      <p className="text-xs text-gray-500">
                        {formManual.documentoTipo === "pdf" ? "Documento PDF" : "Imagem"}
                      </p>
                    </div>
                    <button
                      onClick={() => removerDocumento("manual")}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => manualFileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-100/60 transition-colors"
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500">Clique para anexar o documento do voo</p>
                    <p className="text-xs text-gray-400 mt-0.5">PDF, JPG ou PNG</p>
                  </div>
                )}
                <input
                  ref={manualFileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentoUpload(e, "manual")}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}
          <div className="flex gap-2">
            <Button onClick={adicionarVooManual} className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Adicionar Voo
            </Button>
            <Button onClick={() => setMostrarManual(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de voos adicionados */}
      {voos.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Plane className="w-4 h-4 text-green-500" />
            Voos Adicionados ({voos.length})
          </h4>
          <div className="space-y-2">
            {voos.map((voo, idx) => (
              <div key={voo.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{voo.companhia}</span>
                    <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{voo.numero}</span>
                    {idx > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Conexão {idx}</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-1 mt-2 text-xs">
                    <div>
                      <p className="text-gray-400">Origem</p>
                      <p className="text-gray-700 font-medium">{voo.origem}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Destino</p>
                      <p className="text-gray-700 font-medium">{voo.destino}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Data</p>
                      <p className="text-gray-700 font-medium">{new Date(voo.data + 'T00:00:00').toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Horários</p>
                      <p className="text-gray-700 font-medium">{voo.partida} → {voo.chegada} {voo.duracao && `(${voo.duracao})`}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Valor</p>
                      <p className="text-gray-700 font-medium">
                        {(voo.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </div>
                  {(voo.linkVoo || voo.documentoNome) && (
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      {voo.linkVoo && (
                        <a
                          href={voo.linkVoo}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Abrir link do voo
                        </a>
                      )}
                      {voo.documento && voo.documentoNome && (
                        <a
                          href={voo.documento}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Ver anexo: {voo.documentoNome}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removerVoo(voo.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors ml-3 flex-shrink-0 self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {voos.length > 1 && (
            <p className="text-xs text-amber-600 mt-3 text-center">
              ⚠️ {voos.length - 1} conexão(ões) detectada(s)
            </p>
          )}
        </Card>
      )}

      {voos.length === 0 && !mostrarManual && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum voo adicionado. Busque e adicione voos acima.
        </div>
      )}
    </div>
  );
}
