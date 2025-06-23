// File: backend/services/pdf.service.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Khởi tạo browser một lần để tái sử dụng
let browserInstance = null;

// Hàm khởi tạo browser
async function initBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
      args: ['--disable-gpu', '--disable-dev-shm-usage'] // Thêm tùy chọn để tránh lỗi trên máy yếu
    });
  }
  return browserInstance;
}

// Hàm tạo PDF
async function generatePDF(html, outputPath) {
  const browser = await initBrowser();
  const page = await browser.newPage();
  // Tăng timeout và đảm bảo load hình ảnh
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
  // Đợi hình ảnh load hoàn toàn
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images).map(img => {
        if (img.complete && img.naturalHeight > 0) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', () => reject(new Error(`Image load failed for src: ${img.src}`)));
          setTimeout(() => reject(new Error(`Image timeout for src: ${img.src}`)), 10000);
        });
      })
    );
  }).catch(err => {
    console.error('Lỗi khi load hình ảnh:', err.message);
    throw err;
  });
  const pdfBuffer = await page.pdf({ 
    format: 'A4',
    printBackground: true
  });
  await page.close();
  if (outputPath) {
    await fs.writeFile(outputPath, pdfBuffer);
  }
  return pdfBuffer;
}

// Hàm đóng browser khi cần
async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

module.exports = { generatePDF, closeBrowser };