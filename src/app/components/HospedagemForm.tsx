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
  FileText,
  Image,
  Upload,
  X,
  Building2,
  Star,
  ChevronDown,
  ChevronUp,
  Globe,
} from "lucide-react";

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
  voucher: string | null;
  voucherTipo: "pdf" | "imagem" | null;
  voucherNome: string;
}

interface HospedagemFormProps {
  hospedagens: Hospedagem[];
  onHospedagensChange: (hospedagens: Hospedagem[]) => void;
}

const destinosPopulares = [
  "Rio de Janeiro, Brasil",
  "São Paulo, Brasil",
  "Salvador, Brasil",
  "Florianópolis, Brasil",
  "Gramado, Brasil",
  "Foz do Iguaçu, Brasil",
  "Fortaleza, Brasil",
  "Recife, Brasil",
  "Manaus, Brasil",
  "Curitiba, Brasil",
  "Belo Horizonte, Brasil",
  "Brasília, Brasil",
  "Lisboa, Portugal",
  "Porto, Portugal",
  "Paris, França",
  "Roma, Itália",
  "Veneza, Itália",
  "Florença, Itália",
  "Nova York, EUA",
  "Orlando, EUA",
  "Miami, EUA",
  "Los Angeles, EUA",
  "Londres, Reino Unido",
  "Madri, Espanha",
  "Barcelona, Espanha",
  "Amsterdã, Holanda",
  "Berlim, Alemanha",
  "Atenas, Grécia",
  "Tóquio, Japão",
  "Buenos Aires, Argentina",
  "Cancún, México",
  "Dubai, Emirados Árabes Unidos",
  "Bangkok, Tailândia",
  "Sydney, Austrália",
];

// Configure suas chaves da API do Google Cloud
// Places API: https://console.cloud.google.com/apis/credentials
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
// Linha de depuração para verificar se a chave foi carregada
console.log("Verificando chave de API do Google Maps:", GOOGLE_API_KEY ? "CHAVE ENCONTRADA" : "CHAVE NÃO ENCONTRADA OU VAZIA");

export default function HospedagemForm({
  hospedagens,
  onHospedagensChange,
}: HospedagemFormProps) {
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscou, setBuscou] = useState(false);
  const [selecionado, setSelecionado] = useState<any | null>(null);
  const [mostrarManual, setMostrarManual] = useState(false);
  const [formQuarto, setFormQuarto] = useState({
    tipoQuarto: "",
    checkin: "",
    checkout: "",
    noites: 1,
  });
  const [formManual, setFormManual] = useState({
    nome: "",
    local: "",
    endereco: "",
    tipoQuarto: "",
    precoNoite: 0,
    classificacao: 0,
  });
  const [voucher, setVoucher] = useState<{
    base64: string;
    tipo: "pdf" | "imagem";
    nome: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formManualRef = useRef<HTMLDivElement>(null);
  // Buscar no Google Places API
  const buscarHospedagem = async () => {
    if (!busca.trim()) {
      setErro("Digite um local para buscar");
      return;
    }

    setCarregando(true);
    setErro("");
    setResultados([]);
    setBuscou(false);
    setMostrarManual(false);

    try {
      // Tenta buscar via Google Places API
      if (GOOGLE_API_KEY) {
        await buscarGooglePlaces(busca);
      } else {
        // Sem API key configurada - mostrar mensagem e opção manual
        setErro(
          "API do Google Maps não configurada. Configure VITE_GOOGLE_MAPS_API_KEY no .env ou adicione manualmente."
        );
        setBuscou(true);
        setMostrarManual(true);
      }
    } catch (err) {
      console.error("Erro ao buscar hospedagens:", err);
      setErro("Erro ao buscar hospedagens. Verifique o console (F12) para mais detalhes. Você pode adicionar manualmente.");
      setMostrarManual(true);
    } finally {
      setCarregando(false);
      setBuscou(true);
    }
  };

  const buscarGooglePlaces = async (query: string) => {
    // Tenta buscar via Places API (novo endpoint)
    try {
      const placesResponse = await fetch(
        `https://places.googleapis.com/v1/places:searchText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_API_KEY,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.types,places.id,places.photos"
          },
          body: JSON.stringify({
            textQuery: `${query} hotel`,
            languageCode: "pt-BR",
            maxResultCount: 10
          })
        }
      );
      const placesData = await placesResponse.json();

      if (placesData.places && placesData.places.length > 0) {
        setResultados(formatarResultadosNovo(placesData.places));
        return;
      }
    } catch (e) {
      console.warn("Places API (New) failed, trying legacy API", e);
    }

    // Fallback: tenta API Places legada
    try {
      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          query + " hotel"
        )}&key=${GOOGLE_API_KEY}&language=pt-BR`
      );
      const placesData = await placesResponse.json();

      if (placesData.status === "OK" && placesData.results.length > 0) {
        setResultados(formatarResultados(placesData.results));
        return;
      }
    } catch (e) {
      console.warn("Places legacy API also failed", e);
    }

    // Se tudo falhar, abrir formulário manual com mensagem clara
    setErro(
      "APIs do Google Maps não habilitadas. Para usar a busca automática:\n" +
      "1. Acesse https://console.cloud.google.com/apis/dashboard e ative: Places API e Geocoding API.\n" +
      "2. Verifique se a chave VITE_GOOGLE_MAPS_API_KEY está no arquivo .env e reinicie o servidor.\n" +
      "3. Ou clique em 'Adicionar Manualmente' abaixo."
    );
    setMostrarManual(true);
  };

  const formatarResultadosNovo = (places: any[]) => {
    return places.slice(0, 10).map((place: any) => {
      const tiposQuarto = ["Standard", "Superior", "Suíte"];
      if (place.priceLevel && ["PRICE_LEVEL_EXPENSIVE", "PRICE_LEVEL_VERY_EXPENSIVE"].includes(place.priceLevel)) {
        tiposQuarto.push("Suíte Presidencial");
      }

      const amenidades: string[] = ["WiFi Grátis", "Café da Manhã"];
      if (place.rating && place.rating > 4) amenidades.push("Bem Avaliado");

      const priceMap: Record<string, number> = {
        "PRICE_LEVEL_FREE": 0,
        "PRICE_LEVEL_INEXPENSIVE": 100,
        "PRICE_LEVEL_MODERATE": 200,
        "PRICE_LEVEL_EXPENSIVE": 350,
        "PRICE_LEVEL_VERY_EXPENSIVE": 500,
      };
      const precoBase = priceMap[place.priceLevel] || 150;

      return {
        placeId: place.id,
        nome: place.displayName?.text || "",
        local: busca,
        endereco: place.formattedAddress || "",
        classificacao: place.rating || 0,
        totalAvaliacoes: place.userRatingCount || 0,
        tiposQuarto,
        amenidades,
        precoBase: precoBase + Math.floor(Math.random() * 80),
        photos: null,
      };
    });
  };

  const formatarResultados = (results: any[]) => {
    return results.slice(0, 10).map((place: any) => {
      // Generate mock room types based on rating/price level
      const tiposQuarto = ["Standard", "Superior", "Suíte"];
      if (place.price_level && place.price_level >= 3) {
        tiposQuarto.push("Suíte Presidencial");
      }

      // Generate mock amenities based on place types
      const amenidades: string[] = [];
      if (place.types?.includes("lodging")) amenidades.push("Hospedagem");
      if (place.rating && place.rating > 4) amenidades.push("WiFi Grátis");
      amenidades.push("Café da Manhã");
      if (place.price_level && place.price_level >= 2)
        amenidades.push("Restaurante");

      // Estimate price per night based on price_level
      const priceLevel = place.price_level || 1;
      const precoBase = priceLevel * 150 + Math.floor(Math.random() * 100);

      return {
        placeId: place.place_id,
        nome: place.name,
        local: place.formatted_address?.split(",")[0] || busca,
        endereco: place.formatted_address || "",
        classificacao: place.rating || 0,
        totalAvaliacoes: place.user_ratings_total || 0,
        tiposQuarto,
        amenidades: amenidades.length > 0 ? amenidades : ["WiFi Grátis"],
        precoBase,
        photos: place.photos
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
          : null,
      };
    });
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

  const calcularNoites = (checkin: string, checkout: string) => {
    if (!checkin || !checkout) return 1;
    const inicio = new Date(checkin);
    const fim = new Date(checkout);
    const noites = Math.ceil(
      (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
    );
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
      amenidades: selecionado.amenidades || [],
      voucher: voucher?.base64 || null,
      voucherTipo: voucher?.tipo || null,
      voucherNome: voucher?.nome || "",
    };

    onHospedagensChange([...hospedagens, novaHospedagem]);

    // Limpar formulário
    setSelecionado(null);
    setFormQuarto({ tipoQuarto: "", checkin: "", checkout: "", noites: 1 });
    setResultados([]);
    setBusca("");
    setVoucher(null);
    setBuscou(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const adicionarHospedagemManual = () => {
    if (
      !formManual.nome.trim() ||
      !formManual.local.trim() ||
      !formQuarto.checkin ||
      !formQuarto.checkout
    ) {
      setErro("Preencha os campos obrigatórios: Nome, Local, Check-in e Check-out.");
      return;
    }

    const noites = calcularNoites(formQuarto.checkin, formQuarto.checkout);
    const precoTotal = formManual.precoNoite * noites;

    const novaHospedagem: Hospedagem = {
      id: Date.now(),
      nome: formManual.nome,
      local: formManual.local,
      endereco: formManual.endereco,
      tipoQuarto: formManual.tipoQuarto || "Standard",
      checkin: formQuarto.checkin,
      checkout: formQuarto.checkout,
      noites,
      preco: precoTotal,
      classificacao: formManual.classificacao,
      amenidades: [],
      voucher: voucher?.base64 || null,
      voucherTipo: voucher?.tipo || null,
      voucherNome: voucher?.nome || "",
    };

    onHospedagensChange([...hospedagens, novaHospedagem]);

    // Limpar formulário
    setFormManual({
      nome: "",
      local: "",
      endereco: "",
      tipoQuarto: "",
      precoNoite: 0,
      classificacao: 0,
    });
    setFormQuarto({ tipoQuarto: "", checkin: "", checkout: "", noites: 1 });
    setVoucher(null);
    setMostrarManual(false);
    setErro("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removerHospedagem = (id: number) => {
    onHospedagensChange(hospedagens.filter((h) => h.id !== id));
  };

  // Abrir formulário de detalhes de um resultado da busca
  const abrirDetalhes = (hotel: any) => {
    setSelecionado(hotel);
    setErro("");
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
          <Search className="w-4 h-4 inline-block mr-2 text-indigo-500" />
          Buscar Hospedagem
        </h4>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Local / Cidade / Hotel</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Ex: Rio de Janeiro, Lisboa, Paris..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && buscarHospedagem()
                }
                className="flex-1"
                list="destinos-populares-list"
              />
              <datalist id="destinos-populares-list">
                {destinosPopulares.map((destino) => (
                  <option key={destino} value={destino} />
                ))}
              </datalist>
              <Button 
                onClick={buscarHospedagem}
                disabled={carregando}
                size="icon"
                className="w-auto gap-2 px-4"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {!GOOGLE_API_KEY && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ API do Google Maps não configurada. Configure VITE_GOOGLE_MAPS_API_KEY no .env com uma chave válida.
            </p>
          )}
          {erro && (
            <p className="text-xs text-red-500">{erro}</p>
          )}
        </div>
      </Card>
      <div className="text-center">
        <Button variant="link" onClick={abrirFormManual} className="text-indigo-600 text-sm">
          Não encontrou a hospedagem? Adicionar manualmente
        </Button>
      </div>

      {/* Resultados da busca via API */}
      {resultados.length > 0 && !selecionado && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              <Globe className="w-4 h-4 inline-block mr-1 text-blue-500" />
              Hospedagens Encontradas ({resultados.length})
            </h4>
            {buscou && resultados.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrarManual(true)}
                className="text-xs"
              >
                + Adicionar manualmente
              </Button>
            )}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {resultados.map((hotel, idx) => (
              <button
                key={hotel.placeId || idx}
                onClick={() => abrirDetalhes(hotel)}
                className="w-full text-left p-3 border rounded-lg hover:bg-white hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="font-medium text-gray-900 truncate">
                        {hotel.nome}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{hotel.endereco}</span>
                    </p>
                    {hotel.amenidades && hotel.amenidades.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {hotel.amenidades.slice(0, 4).join(" • ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    {hotel.classificacao > 0 && (
                      <p className="font-semibold text-indigo-600 text-sm">
                        <Star className="w-3 h-3 inline-block text-yellow-500" />{" "}
                        {hotel.classificacao.toFixed(1)}
                        {hotel.totalAvaliacoes && (
                          <span className="text-xs text-gray-400 font-normal">
                            {" "}
                            ({hotel.totalAvaliacoes})
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">a partir de</p>
                    <p className="font-bold text-gray-900">
                      R$ {hotel.precoBase}
                    </p>
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
                Não encontrou o ideal? <strong className="ml-1">Adicionar manualmente</strong>
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Mensagem quando não encontra resultados */}
      {buscou && resultados.length === 0 && !selecionado && !mostrarManual && (
        <Card className="p-6 text-center">
          <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500 mb-3">
            Nenhuma hospedagem encontrada para "{busca}".
          </p>
          <Button
            onClick={() => setMostrarManual(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Manualmente
          </Button>
        </Card>
      )}

      {/* Formulário de detalhes (quando seleciona um resultado) */}
      {selecionado && (
        <Card className="p-4 bg-green-50 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3">
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
                {selecionado.amenidades &&
                  selecionado.amenidades.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {selecionado.amenidades.join(" • ")}
                    </span>
                  )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">Tipo de Quarto</Label>
              <select
                value={formQuarto.tipoQuarto}
                onChange={(e) =>
                  setFormQuarto({ ...formQuarto, tipoQuarto: e.target.value })
                }
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
                type="number"
                min="0"
                step="0.01"
                value={selecionado.precoBase || ""}
                onChange={(e) =>
                  setSelecionado({
                    ...selecionado,
                    precoBase: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-1"
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
                    const noites = calcularNoites(
                      e.target.value,
                      formQuarto.checkout
                    );
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
                    const noites = calcularNoites(
                      formQuarto.checkin,
                      e.target.value
                    );
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
                {formQuarto.noites} noite{formQuarto.noites !== 1 ? "s" : ""} ={" "}
                R${" "}
                {(
                  (selecionado.precoBase || 0) * formQuarto.noites
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Voucher */}
          <div className="mb-3">
            <Label className="text-xs">Voucher (PDF ou Imagem)</Label>
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

      {/* Formulário manual (quando não encontra resultados ou clica em "Adicionar manualmente") */}
      {mostrarManual && !selecionado && (
        <Card ref={formManualRef} className="p-4 border-2 border-dashed border-indigo-300 bg-indigo-50/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              <Building2 className="w-4 h-4 inline-block mr-1 text-indigo-500" />
              Adicionar Hospedagem Manualmente
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
                Nome do Hotel / Propriedade <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Hotel Exemplo"
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
                placeholder="Ex: São Paulo, Brasil"
                value={formManual.local}
                onChange={(e) =>
                  setFormManual({ ...formManual, local: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Endereço</Label>
              <Input
                placeholder="Ex: Av. Paulista, 1000"
                value={formManual.endereco}
                onChange={(e) =>
                  setFormManual({ ...formManual, endereco: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Tipo de Quarto</Label>
              <Input
                placeholder="Ex: Standard, Suíte"
                value={formManual.tipoQuarto}
                onChange={(e) =>
                  setFormManual({ ...formManual, tipoQuarto: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Preço por Noite (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={formManual.precoNoite || ""}
                onChange={(e) =>
                  setFormManual({
                    ...formManual,
                    precoNoite: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Classificação (0-5)</Label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="Ex: 4.5"
                value={formManual.classificacao || ""}
                onChange={(e) =>
                  setFormManual({
                    ...formManual,
                    classificacao: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Check-in</Label>
              <Input
                type="date"
                value={formQuarto.checkin}
                onChange={(e) => {
                  setFormQuarto({ ...formQuarto, checkin: e.target.value });
                  if (formQuarto.checkout) {
                    const noites = calcularNoites(
                      e.target.value,
                      formQuarto.checkout
                    );
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
                    const noites = calcularNoites(
                      formQuarto.checkin,
                      e.target.value
                    );
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
                {formQuarto.noites} noite{formQuarto.noites !== 1 ? "s" : ""} ={" "}
                R${" "}
                {(formManual.precoNoite * formQuarto.noites).toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2 }
                )}
              </p>
            </div>
          )}

          {/* Voucher */}
          <div className="mb-3">
            <Label className="text-xs">Voucher (PDF ou Imagem)</Label>
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
              onClick={adicionarHospedagemManual}
              className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Hospedagem
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

      {/* Lista de hospedagens adicionadas */}
      {hospedagens.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            <Building2 className="w-4 h-4 inline-block mr-1 text-green-500" />
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
                    <span className="font-semibold text-gray-900 text-sm">
                      {hosp.nome}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {hosp.local}
                    </span>
                    {hosp.classificacao > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 inline-block mr-0.5" />
                        {hosp.classificacao.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {hosp.tipoQuarto} • {hosp.checkin} → {hosp.checkout} •{" "}
                    {hosp.noites} noite{hosp.noites !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{hosp.endereco}</p>
                  {hosp.amenidades && hosp.amenidades.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {hosp.amenidades.join(" • ")}
                    </p>
                  )}
                  {hosp.voucher && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {hosp.voucherTipo === "pdf" ? (
                        <FileText className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Image className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {hosp.voucherNome}
                      </span>
                      <button
                        onClick={() => {
                          if (hosp.voucher) {
                            const win = window.open("");
                            win?.document.write(
                              hosp.voucherTipo === "pdf"
                                ? `<iframe src="${hosp.voucher}" style="width:100%;height:100%;border:none;"></iframe>`
                                : `<img src="${hosp.voucher}" style="max-width:100%;max-height:100vh;display:block;margin:auto;" />`
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
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="font-bold text-indigo-700 text-sm">
                    R${" "}
                    {hosp.preco.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
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

      {hospedagens.length === 0 && !selecionado && !mostrarManual && !carregando && (
        <div className="text-center py-8 text-gray-500 text-sm">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          Nenhuma hospedagem adicionada. Busque acima ou{" "}
          <button
            onClick={() => {
              setMostrarManual(true);
              setBuscou(false);
            }}
            className="text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            adicione manualmente
          </button>
          .
        </div>
      )}
    </div>
  );
}