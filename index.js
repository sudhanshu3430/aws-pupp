const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.handler = async (event, context) => {
    let browser = null;

    try {
        // Launch Puppeteer with the appropriate Chromium executable
        browser = await puppeteer.launch({
            args: [...chromium.args,
                '--hide-scrollbars',
                '--disable-web-security',
                '--no-sandbox', // Add no-sandbox if necessary
                '--disable-setuid-sandbox', // Add this too for some environments
                '--disable-dev-shm-usage'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: true,
        });

        const page = await browser.newPage();
        await page.goto("https://www.amazon.in/BRUTON-Lite-Sport-Shoes-Running/dp/B0DHH7TMQ1");

        // Extract product details
        const productTitle = await page.$eval('#productTitle', el => el.innerText.trim());
        const productPrice = await page.$eval('.a-price .a-offscreen', el => el.innerText.trim());
        const productDesc = await page.$$eval('.a-list-item', items => {
            return items.map(item => item.innerText.trim()).filter(text => text);
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ productTitle, productDesc, productPrice }),
        };

    } catch (error) {
        console.error('Error fetching details:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Not fetching the details" }),
        };
    } finally {
        if (browser) {
            await browser.close(); // Ensure the browser is closed in case of success or error
        }
    }
};
