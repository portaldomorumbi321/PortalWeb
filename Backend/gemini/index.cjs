const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY não encontrada.");
}

const ai = new GoogleGenAI({
    apiKey
});

async function generate(messages = []) {

    const prompt = messages
        .map(m => `${m.role}: ${m.content}`)
        .join("\n");

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
    });

    return response.text;

}

module.exports = {
    generate
};