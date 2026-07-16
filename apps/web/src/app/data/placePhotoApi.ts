interface PlacePhotoResponse {
  photo: string | null;
  error?: string;
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

export async function buscarFotoDestino(destination: string): Promise<string | null> {
  const normalizedDestination = String(destination || "").trim();
  console.info("[PlacePhotoFE] Buscar foto", { destination, normalizedDestination });

  if (!normalizedDestination) {
    console.info("[PlacePhotoFE] Destino vazio, retornando null");
    return null;
  }

  let response: Response;

  try {
    console.info("[PlacePhotoFE] Request", {
      url: `${API_BASE_URL}/place-photo?place=${encodeURIComponent(normalizedDestination)}`,
      destination: normalizedDestination,
    });
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
  let body: PlacePhotoResponse = { photo: null };

  if (text) {
    try {
      body = JSON.parse(text) as PlacePhotoResponse;
    } catch {
      body = { photo: null };
    }
  }

  if (!response.ok) {
    console.error("[PlacePhotoFE] Erro response", {
      status: response.status,
      body,
      destination: normalizedDestination,
    });
    throw new Error(body?.error || "Erro ao buscar foto do destino.");
  }

  console.info("[PlacePhotoFE] Response OK", {
    status: response.status,
    destination: normalizedDestination,
    photo: body.photo ?? null,
  });

  return body.photo ?? null;
}
