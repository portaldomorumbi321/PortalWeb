const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

async function generate(messages = []) {
    const systemMessage = {
        role: "system",
        content: `
Você é o Agente IA do PortalWeb.

Regras:
- Responda sempre em português do Brasil.
- Nunca responda em inglês.
- Seja objetivo, profissional e amigável.
- Ajude com produtividade, atendimento comercial, vendas e suporte.
`
    };

    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
            systemMessage,
            ...messages
        ],
        temperature: 0.4,
    });

    return response.choices[0].message.content;
}

module.exports = {
    generate
};