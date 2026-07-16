const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function generate(messages = []) {

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.4,
    });

    return response.choices[0].message.content;
}

module.exports = {
    generate
};