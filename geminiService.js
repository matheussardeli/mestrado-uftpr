const { GoogleGenerativeAI } = require("@google/generative-ai");
const { apiKey } = require('./config');

console.log(apiKey);

// Inicializa o cliente com a chave da API do Google Gemini
const genAI = new GoogleGenerativeAI(apiKey);

async function sendToGemini({ text, mainText }) {
    try {
        // Definir o modelo específico

        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Texto fixo a ser enviado para o modelo
        const prompt = "Com base no texto a seguir, gere apenas um título que melhor se encaixe, levando em consideração o que está escrito: " + mainText;

        console.log(prompt)

        // Enviar o prompt para o modelo e aguardar a resposta
        const result = await model.generateContent(prompt);

        const response = await result.response;

        const text = response.text();

        return text;
    } catch (error) {
        console.error(`Erro ao gerar conteúdo: ${error.message}`);
    }
}

// Exporta a função para ser usada em outro lugar, se necessário
module.exports = { sendToGemini };