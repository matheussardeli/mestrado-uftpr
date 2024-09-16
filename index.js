const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const urls = [
        'https://www.uol.com.br/',
        // Adicione mais URLs aqui
    ];

    for (const url of urls) {
        // Lança o navegador
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Função para extrair dados
        const data = await page.evaluate(() => {
            const headings = [];

            // Procurar elementos section
            const sections = document.querySelectorAll('section');

            sections.forEach(section => {
                // Procurar elementos heading (H1-H6) dentro de section
                for (let i = 1; i <= 6; i++) {
                    const elements = section.querySelectorAll(`h${i}`);

                    elements.forEach(el => {
                        const rect = el.getBoundingClientRect();
                        headings.push({
                            tag: `h${i}`,
                            text: el.innerText,
                            size: {
                                width: rect.width,
                                height: rect.height
                            },
                            position: {
                                top: rect.top,
                                left: rect.left
                            },
                            html: el.outerHTML
                        });
                    });
                }
            });

            return { headings };
        });

        // Criar um nome de arquivo único
        const urlHash = new Buffer.from(url).toString('base64');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${urlHash}-${timestamp}`;

        // Salva os dados extraídos em um arquivo JSON
        fs.writeFileSync(path.join(__dirname, `${fileName}-data.json`), JSON.stringify(data, null, 2));

        // Salva o código HTML em um arquivo
        const html = await page.content();
        fs.writeFileSync(path.join(__dirname, `${fileName}-page.html`), html);

        // Salva um screenshot da página
        await page.screenshot({ path: path.join(__dirname, `${fileName}-screenshot.png`), fullPage: true });

        await browser.close();
    }
})();
