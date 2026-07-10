import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Plus, Trash2, Search, MapPin } from "lucide-react";

interface Hospedagem {
  id: number;
  nome: string;
  local: string;
  endereco: string;
  checkin: string;
  checkout: string;
  tipoQuarto: string;
  preco: number;
  noites: number;
  classificacao: number;
  amenidades: string[];
}

interface HospedagemFormProps {
  hospedagens: Hospedagem[];
  onHospedagensChange: (hospedagens: Hospedagem[]) => void;
}

// Dados simulados de hospedagens (em produção seria via API)
const hospedagensDisponiveis = [
  {
    nome: "Hotel Copacabana Palace",
    local: "Rio de Janeiro",
    endereco: "Av. Atlântica, 1702, Copacabana",
    classificacao: 4.8,
    tiposQuarto: ["Standard", "Suíte", "Suíte Presidencial"],
    amenidades: ["Piscina", "Spa", "Academia", "Restaurante", "Bar"],
    precoBase: 450,
  },
  {
    nome: "Pestana Lisboa",
    local: "Lisboa, Portugal",
    endereco: "Rua 1º de Dezembro, 89",
    classificacao: 4.5,
    tiposQuarto: ["Standard", "Superior", "Suíte"],
    amenidades: ["Terraço", "Restaurante", "Bar", "WiFi Grátis"],
    precoBase: 120,
  },
  {
    nome: "Hilton São Paulo",
    local: "São Paulo",
    endereco: "Av. Paulista, 2424",
    classificacao: 4.6,
    tiposQuarto: ["Standard", "Club", "Suíte"],
    amenidades: ["Piscina", "Academia", "Negócios", "Restaurante"],
    precoBase: 280,
  },
  {
    nome: "Memmo Alfama Hotel",
    local: "Lisboa, Portugal",
    endereco: "Tejo, Rua da Querida",
    classificacao: 4.7,
    tiposQuarto: ["Standard", "Suíte"],
    amenidades: ["Spa", "Restaurante", "Vista para o Tejo"],
    precoBase: 200,
  },
];

export default function HospedagemForm({ hospedagens, onHospedagensChange }: HospedagemFormProps) {
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [selecionado, setSelecionado] = useState<any | null>(null);
  const [formQuarto, setFormQuarto] = useState({
    tipoQuarto: "",
    checkin: "",
    checkout: "",
    noites: 1,
  });

  const buscarHospedagem = async () => {
    if (!busca.trim()) {
      setErro("Digite um local para buscar");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Filtrar hospedagens que correspondem à busca
      const filtrados = hospedagensDisponiveis.filter((h) =>
        h.local.toLowerCase().includes(busca.toLowerCase()) ||
        h.nome.toLowerCase().includes(busca.toLowerCase())
      );

      if (filtrados.length === 0) {
        setErro("Nenhuma hospedagem encontrada para este local");
        setResultados([]);
      } else {
        setResultados(filtrados);
      }
    } catch (err) {
      setErro("Erro ao buscar hospedagens. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const calcularNoites = (checkin: string, checkout: string) => {
    if (!checkin || !checkout) return 1;
    const inicio = new Date(checkin);
    const fim = new Date(checkout);
    const noites = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, noites);
  };

  const adicionarHospedagem = () => {
    if (!selecionado || !formQuarto.tipoQuarto || !formQuarto.checkin || !formQuarto.checkout) {
      setErro("Preencha todos os campos");
      return;
    }

    const noites = calcularNoites(formQuarto.checkin, formQuarto.checkout);
    const precoTotal = selecionado.precoBase * noites;

    const novaHospedagem: Hospedagem = {
      id: Date.now(),
      nome: selecionado.nome,
      local: selecionado.local,
      endereco: selecionado.endereco,
      tipoQuarto: formQuarto.tipoQuarto,
      checkin: formQuarto.checkin,
      checkout: formQuarto.checkout,
      noites,
      preco: precoTotal,
      classificacao: selecionado.classificacao,
      amenidades: selecionado.amenidades,
    };

    onHospedagensChange([...hospedagens, novaHospedagem]);
    
    // Limpar formulário
    setSelecionado(null);
    setFormQuarto({ tipoQuarto: "", checkin: "", checkout: "", noites: 1 });
    setResultados([]);
    setBusca("");
  };

  const removerHospedagem = (id: number) => {
    onHospedagensChange(hospedagens.filter((h) => h.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Busca */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Buscar Hospedagem</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Local / Cidade</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Ex: Rio de Janeiro, Lisboa, São Paulo"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && buscarHospedagem()}
                className="flex-1"
              />
              <Button onClick={buscarHospedagem} disabled={carregando} size="icon" className="w-auto gap-2 px-4">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {erro && !selecionado && <p className="text-xs text-red-500">{erro}</p>}
        </div>
      </Card>

      {/* Resultados de busca */}
      {resultados.length > 0 && !selecionado && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">Hospedagens Disponíveis</h4>
          <div className="space-y-2">
            {resultados.map((hotel, idx) => (
              <button
                key={idx}
                onClick={() => setSelecionado(hotel)}
                className="w-full text-left p-3 border rounded-lg hover:bg-white hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{hotel.nome}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {hotel.endereco}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {hotel.amenidades.slice(0, 3).join(" • ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">⭐ {hotel.classificacao}</p>
                    <p className="text-xs text-gray-500">a partir de</p>
                    <p className="font-bold text-gray-900">R$ {hotel.precoBase}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Formulário de detalhes */}
      {selecionado && (
        <Card className="p-4 bg-green-50 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3">{selecionado.nome}</h4>
          
          <div className="bg-white p-3 rounded mb-3 text-sm">
            <p className="font-medium text-gray-900">{selecionado.local}</p>
            <p className="text-xs text-gray-500">{selecionado.endereco}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                ⭐ {selecionado.classificacao}
              </span>
              <span className="text-xs text-gray-600">
                {selecionado.amenidades.join(" • ")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">Tipo de Quarto</Label>
              <select
                value={formQuarto.tipoQuarto}
                onChange={(e) => setFormQuarto({ ...formQuarto, tipoQuarto: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Selecione um quarto</option>
                {selecionado.tiposQuarto.map((tipo: string) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Preço/Noite</Label>
              <Input
                type="text"
                disabled
                value={`R$ ${selecionado.precoBase.toLocaleString("pt-BR")}`}
                className="mt-1 bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">Check-in</Label>
              <Input
                type="date"
                value={formQuarto.checkin}
                onChange={(e) => {
                  setFormQuarto({ ...formQuarto, checkin: e.target.value });
                  if (formQuarto.checkout) {
                    const noites = calcularNoites(e.target.value, formQuarto.checkout);
                    setFormQuarto((f) => ({ ...f, noites }));
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Check-out</Label>
              <Input
                type="date"
                value={formQuarto.checkout}
                onChange={(e) => {
                  setFormQuarto({ ...formQuarto, checkout: e.target.value });
                  if (formQuarto.checkin) {
                    const noites = calcularNoites(formQuarto.checkin, e.target.value);
                    setFormQuarto((f) => ({ ...f, noites }));
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>

          {formQuarto.checkin && formQuarto.checkout && (
            <div className="text-sm text-gray-600 mb-3 p-2 bg-white rounded">
              <p className="font-medium">
                {formQuarto.noites} noite{formQuarto.noites !== 1 ? "s" : ""} = R$ {(selecionado.precoBase * formQuarto.noites).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {erro && selecionado && <p className="text-xs text-red-500 mb-3">{erro}</p>}

          <div className="flex gap-2">
            <Button
              onClick={adicionarHospedagem}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Hospedagem
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

      {/* Lista de hospedagens adicionadas */}
      {hospedagens.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Hospedagens Adicionadas ({hospedagens.length})
          </h4>
          <div className="space-y-2">
            {hospedagens.map((hosp, idx) => (
              <div
                key={hosp.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{hosp.nome}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {hosp.local}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {hosp.tipoQuarto} • {hosp.checkin} → {hosp.checkout} • {hosp.noites} noite
                    {hosp.noites !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{hosp.endereco}</p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="font-bold text-indigo-700 text-sm">
                    R$ {hosp.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => removerHospedagem(hosp.id)}
                    className="mt-1 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-semibold text-gray-900">
              Total Hospedagem: R${" "}
              {hospedagens
                .reduce((sum, h) => sum + h.preco, 0)
                .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </Card>
      )}

      {hospedagens.length === 0 && resultados.length === 0 && !selecionado && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Nenhuma hospedagem adicionada. Busque e adicione hospedagens acima.
        </div>
      )}
    </div>
  );
}
