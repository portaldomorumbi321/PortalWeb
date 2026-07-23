export type AIChatRole = "user" | "assistant";

export interface AIChatApiMessage {
  role: AIChatRole;
  content: string;
}

interface AIChatResponse {
  reply: string;
}

interface AIChatErrorResponse {
  error?: string;
  code?: string;
}

function mapAiError(code: string, fallback: string): string {
  switch (code) {
    case "OPENAI_KEY_MISSING":
    case "OPENAI_INVALID_KEY":
      return "A chave da OpenAI esta invalida ou ausente no backend. Verifique OPENAI_API_KEY.";
    case "OPENAI_QUOTA_EXCEEDED":
      return "Seu limite de cota da OpenAI foi atingido. Verifique faturamento e creditos.";
    case "OPENAI_RATE_LIMIT":
      return "Muitas requisicoes em sequencia. Aguarde alguns segundos e tente novamente.";
    case "OPENAI_MODEL_NOT_FOUND":
      return "O modelo configurado em OPENAI_MODEL nao existe ou nao esta disponivel para sua conta.";
    case "OPENAI_TIMEOUT":
      return "A resposta da OpenAI demorou demais. Tente novamente.";
    default:
      return fallback;
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV
    ? "/api"
    : (() => {
        throw new Error(
          "VITE_API_URL nao configurada no deploy. Defina a URL do backend, por exemplo: https://seu-backend.up.railway.app/api.",
        );
      })());

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
    throw new Error("Nao foi possivel conectar ao backend de IA.");
  }

  const responseText = await response.text();
  let parsedBody: AIChatResponse | AIChatErrorResponse | null = null;

  if (responseText) {
    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    const backendCode =
      parsedBody && "code" in parsedBody && typeof parsedBody.code === "string"
        ? parsedBody.code
        : "";
    const fallbackMessage =
      parsedBody && "error" in parsedBody && typeof parsedBody.error === "string"
        ? parsedBody.error
        : `Erro ao comunicar com o servidor (${response.status}).`;

    throw new Error(mapAiError(backendCode, fallbackMessage));
  }

  if (!parsedBody || !("reply" in parsedBody) || typeof parsedBody.reply !== "string") {
    throw new Error("Resposta invalida da API de IA.");
  }

  return parsedBody as T;
}

export function enviarMensagemIA(
  messages: AIChatApiMessage[],
  provedor?: "openai" | "groq" | "gemini" | "openrouter" | "cloudflare"
) {
  return request<AIChatResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages, provedor }),
  });
}
