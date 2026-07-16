const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function generate(messages = []) {

    const prompt = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return response.text;
}

module.exports = {
    generate
};