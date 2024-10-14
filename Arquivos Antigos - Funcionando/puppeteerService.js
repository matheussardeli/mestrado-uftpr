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

            // Limpar os dados de headers a cada iteração de section
            for (let i = 1; i <= 6; i++) {
                const elements = section.querySelectorAll(`h${i}`);
                const headerData = [];

                // Capturar somente os headers da seção atual
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

                // Adiciona somente se houver headers para a tag hX
                if (headerData.length > 0) {
                    headers.push(...headerData);
                }
            }

            // Armazenar os dados da seção atual
            sectionsData.push({
                sectionHtml: section.outerHTML,
                elementCount,
                headers, // headers relacionados apenas à section atual
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
