const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const DEFAULT_OPENAI_SYSTEM_PROMPT =
  process.env.OPENAI_SYSTEM_PROMPT ||
  'Você é o Agente IA do PortalWeb. Responda em português do Brasil, com objetividade e foco em produtividade comercial.';

function normalizeAiMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  const allowedRoles = new Set(['user', 'assistant']);

  return rawMessages
    .map((item) => ({
      role: typeof item?.role === 'string' ? item.role : '',
      content: typeof item?.content === 'string' ? item.content.trim() : '',
    }))
    .filter((item) => item.content && allowedRoles.has(item.role))
    .slice(-20);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY não configurada no backend.' });
  }

  const normalizedMessages = normalizeAiMessages(req.body?.messages);

  if (!normalizedMessages.length) {
    return res.status(400).json({ error: 'Envie pelo menos uma mensagem válida.' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const openAiResponse = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'system', content: DEFAULT_OPENAI_SYSTEM_PROMPT }, ...normalizedMessages],
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    const rawText = await openAiResponse.text();
    let parsedBody = null;

    if (rawText) {
      try {
        parsedBody = JSON.parse(rawText);
      } catch (_) {
        parsedBody = null;
      }
    }

    if (!openAiResponse.ok) {
      const apiError = parsedBody?.error?.message || 'Falha ao comunicar com a OpenAI.';
      return res.status(502).json({ error: apiError });
    }

    const reply = parsedBody?.choices?.[0]?.message?.content;

    if (typeof reply !== 'string' || !reply.trim()) {
      return res.status(502).json({ error: 'Resposta da OpenAI veio vazia.' });
    }

    return res.status(200).json({ reply: reply.trim(), model: OPENAI_MODEL });
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({ error: 'Tempo limite atingido ao consultar a OpenAI.' });
    }

    return res.status(500).json({ error: 'Erro interno ao processar a mensagem da IA.' });
  } finally {
    clearTimeout(timeoutId);
  }
}
