const { getPageData } = require('./puppeteerService');
const { sendToGemini } = require('./geminiService');
const { urls } = require('./config');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const url = require('url');

(async () => {
    for (const siteUrl of urls) {
        // Extrair o nome do domínio da URL para usar como nome da pasta
        const parsedUrl = new url.URL(siteUrl);
        const domainName = parsedUrl.hostname.replace(/\./g, '_'); // Substituir pontos por sublinhados para evitar problemas com nomes de arquivos

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dirPath = path.join(__dirname, domainName);

        // Cria uma pasta única para o site, se ela ainda não existir
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
            console.log(`Pasta criada: ${dirPath}`);
        }

        // Lança o navegador e extrai dados da página
        const data = await getPageData(siteUrl);

        // Para cada seção, enviar o texto puro para a API do Gemini
        for (const section of data.sectionsData) {
            const text = section.headers.map(header => header.text).join(' ');
            const mainText = section.mainText;
            if (text) {
                try {
                    // Envia o texto para a API do Gemini

                    const geminiResponse = await sendToGemini({ text, mainText });

                    // Nome do arquivo para armazenar a resposta
                    const responseFileName = `${timestamp}-gemini-resposta.json`;

                    // Armazenar o texto e a resposta do Gemini
                    const responseData = {
                        textoBase: text,
                        mainText: mainText,
                        respostaGemini: geminiResponse
                    };

                    fs.writeFileSync(
                        path.join(dirPath, responseFileName),
                        JSON.stringify(responseData, null, 2)
                    );

                    console.log(`Resposta do Gemini salva: ${responseFileName}`);
                } catch (error) {
                    console.error(`Erro ao enviar para o Gemini para a seção: ${error.message}`);
                }
            }
        }

        // Salvar os dados extraídos em arquivos
        const dataFileName = `${timestamp}-dados.json`;

        fs.writeFileSync(path.join(dirPath, dataFileName), JSON.stringify(data, null, 2));
        console.log(`Dados salvos para a URL: ${siteUrl}`);

        // Salvar uma captura de tela da página
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });



        await page.goto(siteUrl, { waitUntil: 'networkidle2' });
        const screenshotPath = path.join(dirPath, `${timestamp}-screenshot.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot salva: ${screenshotPath}`);

        const pageHtml = await page.content();
        // Salvar o código HTML completo em um arquivo
        const htmlFileName = `${timestamp}-pagina-completa.html`;
        fs.writeFileSync(path.join(dirPath, htmlFileName), pageHtml);
        console.log(`HTML completo salvo em: ${path.join(dirPath, htmlFileName)}`);

        await browser.close();
    }
})();
