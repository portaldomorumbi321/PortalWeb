import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Plus, Trash2, Search } from "lucide-react";

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

export default function VoosForm({ voos, onVoosChange }: VoosFormProps) {
  const [busca, setBusca] = useState({ companhia: "", numero: "", data: "" });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<Voo | null>(null);

  const buscarVoo = async () => {
    if (!busca.companhia || !busca.numero || !busca.data) {
      setErro("Preencha todos os campos");
      return;
    }

    setCarregando(true);
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
  };

  const removerVoo = (id: number) => {
    onVoosChange(voos.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Busca */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Buscar Voo</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <Label className="text-xs">CIA Aérea</Label>
            <Input
              placeholder="Ex: TAP, TAM, LATAM"
              value={busca.companhia}
              onChange={(e) => setBusca({ ...busca, companhia: e.target.value })}
              className="mt-1"
            />
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

      {/* Lista de voos adicionados */}
      {voos.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Voos Adicionados ({voos.length})</h4>
          <div className="space-y-2">
            {voos.map((voo, idx) => (
              <div key={voo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600">{voo.numero}</span>
                    <span className="text-xs text-gray-500">{voo.companhia}</span>
                    {idx > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Conexão {idx}</span>}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {voo.origem} → {voo.destino} | {voo.partida} → {voo.chegada} ({voo.duracao})
                  </p>
                </div>
                <button
                  onClick={() => removerVoo(voo.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors ml-2 flex-shrink-0"
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

      {voos.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhum voo adicionado. Busque e adicione voos acima.
        </div>
      )}
    </div>
  );
}
