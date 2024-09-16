const puppeteer = require('puppeteer');

async function getPageData(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extrair dados da página
    const data = await page.evaluate(() => {
        const sectionsData = [];

        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            const headers = [];
            const elementCount = section.querySelectorAll('*').length;

            for (let i = 1; i <= 6; i++) {
                const elements = section.querySelectorAll(`h${i}`);
                elements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    headers.push({
                        tag: `h${i}`,
                        text: el.innerText,
                        size: { width: rect.width, height: rect.height },
                        position: { top: rect.top, left: rect.left },
                        html: el.outerHTML
                    });
                });
            }

            sectionsData.push({
                sectionHtml: section.outerHTML,
                elementCount,
                headers,
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
