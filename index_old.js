const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const url = 'https://www.uol.com.br/';

    // Lança o navegador
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Função para extrair dados
    const data = await page.evaluate(() => {
        const headings = [];
        const sections = [];

        // Procurar elementos heading (H1-H6)
        for (let i = 1; i <= 6; i++) {
            const elements = document.querySelectorAll(`h${i}`);

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
                    }
                });
            });
        }

        // Procurar elementos section e extrair textos
        const sectionElements = document.querySelectorAll('section');
        sectionElements.forEach(el => {
            sections.push({
                html: el.innerHTML,
                text: el.innerText
            });
        });

        return { headings, sections };
    });

    // Salva os dados extraídos em um arquivo JSON
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

    // Salva o código HTML em um arquivo
    const html = await page.content();
    fs.writeFileSync('page.html', html);

    // Salva um screenshot da página
    await page.screenshot({ path: 'screenshot.png', fullPage: true });

    await browser.close();
})();
