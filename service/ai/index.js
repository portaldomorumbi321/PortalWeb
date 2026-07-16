const Gemini = require("./gemini.js");

async function generate(messages) {
    return Gemini.generate(messages);
}

module.exports = {
    generate
};