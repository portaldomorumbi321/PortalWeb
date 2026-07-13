import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Plus, Trash2, Search, Plane } from "lucide-react";

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
    duracao: "",
  });
  const formManualRef = useRef<HTMLDivElement>(null);

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
        duracao: "1h 30min",
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
    setFormManual({ companhia: "", numero: "", data: "", origem: "", destino: "", partida: "", chegada: "", duracao: "" });
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-xs">
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
                  </div>
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
