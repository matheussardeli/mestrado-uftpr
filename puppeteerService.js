const puppeteer = require('puppeteer');

async function getPageData(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Definir a resolução para o tamanho de desktop
    await page.setViewport({ width: 1920, height: 1080 });

    // Navegar até a URL especificada
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extrair dados da página
    const data = await page.evaluate(() => {
        const sectionsData = [];

        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            const headers = [];
            const elementCount = section.querySelectorAll('*').length;

            // Extrair os headers (h1 a h6) da seção
            for (let i = 1; i <= 6; i++) {
                const elements = section.querySelectorAll(`h${i}`);
                const headerData = [];

                elements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    headerData.push({
                        tag: `h${i}`,
                        text: el.innerText,
                        size: { width: rect.width, height: rect.height },
                        position: { top: rect.top, left: rect.left },
                        html: el.outerHTML
                    });
                });

                if (headerData.length > 0) {
                    headers.push(...headerData);
                }
            }

            // Armazenar cada parágrafo individualmente em um array de paragraphs
            const paragraphs = Array.from(section.querySelectorAll('p'))
                .map(paragraph => paragraph.innerText);

            // Concatenar o texto de todos os parágrafos como mainText
            const mainText = paragraphs.join(' ');

            // Armazenar os dados da seção, incluindo o texto principal e parágrafos individuais
            sectionsData.push({
                sectionHtml: section.outerHTML,
                elementCount,
                headers,
                mainText,     // Texto principal (todos os parágrafos concatenados)
                paragraphs,   // Array de parágrafos individuais
                sectionRect: {
                    width: sectionRect.width,
                    height: sectionRect.height,
                    top: sectionRect.top,
                    left: sectionRect.left
                }
            });
        });

        return { sectionsData };
    });

    await browser.close();
    return data;
}

module.exports = { getPageData };
