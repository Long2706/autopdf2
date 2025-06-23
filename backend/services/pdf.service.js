const puppeteer = require('puppeteer');

async function generatePDF(html, outputPath) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' }); // chờ load hết tài nguyên
  await page.pdf({ path: outputPath, format: 'A4' });
  await browser.close();
}

module.exports = { generatePDF };

