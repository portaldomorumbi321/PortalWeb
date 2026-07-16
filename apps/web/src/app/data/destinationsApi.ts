export interface DestinationApiResponseItem {
  id: number;
  data: Record<string, unknown>;
}

export interface HospedagemDestinoResultado {
  placeId: number;
  nome: string;
  local: string;
  endereco: string;
  classificacao: number;
  totalAvaliacoes: number;
  tiposQuarto: string[];
  amenidades: string[];
  precoBase: number;
  photos: string | null;
  linkOperadora: string;
}

export interface ExperienciaDestinoResultado {
  placeId: number;
  nome: string;
  local: string;
  endereco: string;
  classificacao: number;
  totalAvaliacoes: number;
  descricao: string;
  priceLevel: string | number;
}

export interface RestauranteDestinoResultado {
  placeId: number;
  nome: string;
  local: string;
  endereco: string;
  classificacao: number;
  totalAvaliacoes: number;
  telefone: string;
  website: string;
  priceLevel: string | number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || (import.meta.env.DEV ? '/api' : (() => { throw new Error('VITE_API_URL não configurada no deploy. Defina a URL do backend, por exemplo: https://seu-backend.up.railway.app/api.'); })());

async function request<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    throw new Error('Não foi possível conectar ao backend de destinos.');
  }

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();
  const isLikelyHtml = responseText.trimStart().startsWith('<!DOCTYPE') || responseText.trimStart().startsWith('<html');

  let parsedBody: any = null;
  if (responseText) {
    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    if (isLikelyHtml) {
      throw new Error('A rota da API de destinos retornou HTML. Verifique a configuração do backend NestJS.');
    }

    const apiMessage = Array.isArray(parsedBody?.message)
      ? parsedBody.message.join(', ')
      : parsedBody?.message;

    throw new Error(apiMessage || parsedBody?.error || `Erro ao comunicar com o servidor (${response.status}).`);
  }

  if (isLikelyHtml || !contentType.includes('application/json')) {
    throw new Error('Resposta inválida da API de destinos: esperado JSON.');
  }

  return parsedBody as T;
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getString(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function getNumber(data: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = data[key];
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return 0;
}

function getStringArray(data: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  }

  return [];
}

function buildSearchableText(data: Record<string, unknown>): string {
  return normalizeText(
    [
      data['nome'],
      data['name'],
      data['titulo'],
      data['title'],
      data['local'],
      data['cidade'],
      data['estado'],
      data['pais'],
      data['endereco'],
      data['descricao'],
      data['tipo'],
      data['categoria'],
    ]
      .filter(Boolean)
      .join(' '),
  );
}

async function fetchDestinations(query: string, limit = 200): Promise<DestinationApiResponseItem[]> {
  const items = await request<DestinationApiResponseItem[]>(`/destinations?limit=${limit}&offset=0`);
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => buildSearchableText(item.data).includes(normalizedQuery));
}

export async function buscarHospedagensDestino(query: string): Promise<HospedagemDestinoResultado[]> {
  const items = await fetchDestinations(query);

  return items.slice(0, 10).map((item) => {
    const nome = getString(item.data, ['nome', 'name', 'titulo', 'title']) || query;
    const local = getString(item.data, ['local', 'cidade', 'destino', 'nome', 'name']) || query;
    const endereco = getString(item.data, ['endereco', 'formattedAddress', 'address']) || local;
    const classificacao = getNumber(item.data, ['classificacao', 'rating', 'score']);
    const totalAvaliacoes = getNumber(item.data, ['totalAvaliacoes', 'userRatingCount', 'avaliacoes']);
    const amenidades = getStringArray(item.data, ['amenidades', 'amenities', 'facilidades']);
    const precoBase = getNumber(item.data, ['precoBase', 'preco', 'price']) || 150;
    const tiposQuarto = getStringArray(item.data, ['tiposQuarto', 'roomTypes']);

    return {
      placeId: item.id,
      nome,
      local,
      endereco,
      classificacao,
      totalAvaliacoes,
      tiposQuarto: tiposQuarto.length ? tiposQuarto : ['Standard', 'Superior', 'Suíte'],
      amenidades: amenidades.length ? amenidades : ['WiFi Grátis', 'Café da Manhã'],
      precoBase,
      photos: null,
      linkOperadora: getString(item.data, ['linkOperadora', 'website', 'url']),
    };
  });
}

export async function buscarExperienciasDestino(query: string): Promise<ExperienciaDestinoResultado[]> {
  const items = await fetchDestinations(query);

  return items.slice(0, 10).map((item) => ({
    placeId: item.id,
    nome: getString(item.data, ['nome', 'name', 'titulo', 'title']) || query,
    local: getString(item.data, ['local', 'cidade', 'destino', 'nome', 'name']) || query,
    endereco: getString(item.data, ['endereco', 'formattedAddress', 'address']) || query,
    classificacao: getNumber(item.data, ['classificacao', 'rating', 'score']),
    totalAvaliacoes: getNumber(item.data, ['totalAvaliacoes', 'userRatingCount', 'avaliacoes']),
    descricao: getString(item.data, ['descricao', 'description', 'resumo']),
    priceLevel: getString(item.data, ['priceLevel', 'faixaPreco']) || getNumber(item.data, ['priceLevel', 'price']),
  }));
}

export async function buscarRestaurantesDestino(query: string): Promise<RestauranteDestinoResultado[]> {
  const items = await fetchDestinations(query);

  return items.slice(0, 10).map((item) => ({
    placeId: item.id,
    nome: getString(item.data, ['nome', 'name', 'titulo', 'title']) || query,
    local: getString(item.data, ['local', 'cidade', 'destino', 'nome', 'name']) || query,
    endereco: getString(item.data, ['endereco', 'formattedAddress', 'address']) || query,
    classificacao: getNumber(item.data, ['classificacao', 'rating', 'score']),
    totalAvaliacoes: getNumber(item.data, ['totalAvaliacoes', 'userRatingCount', 'avaliacoes']),
    telefone: getString(item.data, ['telefone', 'phone', 'internationalPhoneNumber']),
    website: getString(item.data, ['website', 'websiteUri', 'url']),
    priceLevel: getString(item.data, ['priceLevel', 'faixaPreco']) || getNumber(item.data, ['priceLevel', 'price']),
  }));
}
