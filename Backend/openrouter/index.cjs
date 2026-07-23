const OpenAI = require("openai");

const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
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

    const response = await openrouter.chat.completions.create({
        model: "openai/gpt-4o-mini",
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