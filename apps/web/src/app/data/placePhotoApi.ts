interface PlacePhotoResponse {
  photo: string | null;
  error?: string;
  totalPlaces?: number;
  options?: Array<{
    name: string;
    address?: string | null;
  }>;
}

export interface DestinationPlaceOption {
  name: string;
  address?: string | null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV
    ? "/api"
    : (() => {
        throw new Error(
          "VITE_API_URL não configurada no deploy. Defina a URL do backend, por exemplo: https://seu-backend.up.railway.app/api."
        );
      })());

async function requestPlacePhoto(destination: string): Promise<PlacePhotoResponse> {
  const normalizedDestination = String(destination || "").trim();

  if (!normalizedDestination) {
    return { photo: null, totalPlaces: 0, options: [] };
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/place-photo?place=${encodeURIComponent(normalizedDestination)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    throw new Error("Não foi possível conectar ao backend para buscar a foto do destino.");
  }

  const text = await response.text();
  let body: PlacePhotoResponse = { photo: null, totalPlaces: 0, options: [] };

  if (text) {
    try {
      body = JSON.parse(text) as PlacePhotoResponse;
    } catch {
      body = { photo: null, totalPlaces: 0, options: [] };
    }
  }

  if (!response.ok) {
    throw new Error(body?.error || "Erro ao buscar foto do destino.");
  }

  return body;
}

export async function buscarFotoDestino(destination: string): Promise<string | null> {
  const body = await requestPlacePhoto(destination);
  return body.photo ?? null;
}

export async function buscarOpcoesDestino(destination: string): Promise<{ totalPlaces: number; options: DestinationPlaceOption[] }> {
  const body = await requestPlacePhoto(destination);
  const options = Array.isArray(body.options) ? body.options : [];
  const totalPlaces = typeof body.totalPlaces === "number" ? body.totalPlaces : options.length;

  return {
    totalPlaces,
    options,
  };
}
