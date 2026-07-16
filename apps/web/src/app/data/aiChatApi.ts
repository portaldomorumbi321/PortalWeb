export type AIChatRole = "user" | "assistant";

export interface AIChatApiMessage {
  role: AIChatRole;
  content: string;
}

interface AIChatResponse {
  reply: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || (import.meta.env.DEV ? '/api' : (() => { throw new Error('VITE_API_URL não configurada no deploy. Defina a URL do backend, por exemplo: https://seu-backend.up.railway.app/api.'); })());

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error("Não foi possível conectar ao backend de IA. Verifique se o servidor está rodando.");
  }

  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  const isLikelyHtml = responseText.trimStart().startsWith("<!DOCTYPE") || responseText.trimStart().startsWith("<html");

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
      throw new Error("A rota da API retornou HTML. Configure corretamente o backend para /api/ai/chat.");
    }

    throw new Error(parsedBody?.error || `Erro ao comunicar com o servidor (${response.status}).`);
  }

  if (isLikelyHtml || !contentType.includes("application/json")) {
    throw new Error("Resposta inválida da API de IA: esperado JSON.");
  }

  return parsedBody as T;
}

export function enviarMensagemIA(messages: AIChatApiMessage[]) {
  return request<AIChatResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}