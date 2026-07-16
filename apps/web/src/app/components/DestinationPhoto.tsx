import { useEffect, useMemo, useState } from "react";
import { buscarFotoDestino } from "../data/placePhotoApi";

type DestinationPhotoProps = {
  destination: string;
};

const photoCache = new Map<string, string | null>();
const inFlightCache = new Map<string, Promise<string | null>>();

const DEFAULT_TRAVEL_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80";

function normalizeDestination(destination: string) {
  return String(destination || "").trim().toLowerCase();
}

async function getDestinationPhoto(destination: string) {
  const cacheKey = normalizeDestination(destination);

  if (!cacheKey) {
    return null;
  }

  if (photoCache.has(cacheKey)) {
    return photoCache.get(cacheKey) ?? null;
  }

  const currentRequest = inFlightCache.get(cacheKey);
  if (currentRequest) {
    return currentRequest;
  }

  const request = buscarFotoDestino(destination)
    .then((photoUrl) => {
      photoCache.set(cacheKey, photoUrl);
      inFlightCache.delete(cacheKey);
      return photoUrl;
    })
    .catch((error) => {
      inFlightCache.delete(cacheKey);
      throw error;
    });

  inFlightCache.set(cacheKey, request);
  return request;
}

export default function DestinationPhoto({ destination }: DestinationPhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasDestination = useMemo(() => normalizeDestination(destination).length > 0, [destination]);

  useEffect(() => {
    let active = true;

    async function loadPhoto() {
      if (!hasDestination) {
        setPhotoUrl(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const photo = await getDestinationPhoto(destination);
        if (active) {
          setPhotoUrl(photo);
        }
      } catch (err) {
        if (active) {
          setPhotoUrl(null);
          setError(err instanceof Error ? err.message : "Erro ao carregar foto do destino.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPhoto();

    return () => {
      active = false;
    };
  }, [destination, hasDestination]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="h-56 w-full animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      <img
        src={photoUrl || DEFAULT_TRAVEL_IMAGE}
        alt={destination ? `Foto de ${destination}` : "Foto de destino"}
        className="h-56 w-full object-cover"
        loading="lazy"
      />
      {error && (
        <div className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Não foi possível carregar a foto da API. Exibindo imagem padrão.
        </div>
      )}
    </div>
  );
}
