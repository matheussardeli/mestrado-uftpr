const axios = require('axios');
const { geminiApiKey, geminiApiUrl } = require('./config');

async function sendToGemini(text) {
    try {
        const response = await axios.post(geminiApiUrl, {
            apiKey: geminiApiKey,
            label: 'h1',
            text: text
        });

        return response.data;
    } catch (error) {
        console.error(`Erro ao enviar para Gemini ${error.message}`);
        throw error;
    }
}

module.exports = { sendToGemini };
