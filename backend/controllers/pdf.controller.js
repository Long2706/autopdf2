// File: backend/controllers/pdf.controller.js
const { pool } = require('../services/db.service.js');
const { generatePDF, closeBrowser } = require('../services/pdf.service.js');
const { createZip } = require('../services/zip.service.js');
const { renderTemplate } = require('../services/html.service.js');
const { generateQR } = require('../services/qr.service.js');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config.js');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Hàm tạo PDF trong worker thread
const generatePDFWorker = async (html) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: { html }
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

// Hàm chính xử lý export PDF
async function exportPdfs(req, res) {
  try {
    // Lấy tất cả bản ghi từ database
    const result = await pool.query('SELECT * FROM health_records');
    const records = result.rows;

    // Kiểm tra và đọc file logo.png
    const logoPath = path.join(__dirname, '../templates/logo.png');
    let logoBase64;
    try {
      await fs.access(logoPath); // Kiểm tra file tồn tại
      const logoBuffer = await fs.readFile(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      console.log('Logo base64 length:', logoBase64.length); // Debug độ dài base64
    } catch (error) {
      console.error('Lỗi khi đọc logo.png:', error.message);
      return res.status(500).json({ error: 'Không thể đọc file logo', details: error.message });
    }

    // Tạo tất cả QR code trước
    const qrPromises = records.map(record => 
      generateQR(`${config.baseUrl}/viewpdf/?ma_nv=${record.ma_nv}&token=token_${record.ma_nv}`)
    );
    const qrCodes = await Promise.all(qrPromises);

    // Tạo tất cả HTML template
    const htmlPromises = records.map((record, index) =>
      renderTemplate({
        ...record,
        qrCode: qrCodes[index],
        logoBase64
      })
    );
    const htmls = await Promise.all(htmlPromises);

    // Tạo PDF hàng loạt bằng worker threads
    const pdfPromises = htmls.map((html) => generatePDFWorker(html));
    const pdfBuffers = await Promise.all(pdfPromises);

    // Trả về file PDF đơn hoặc file zip
    if (pdfBuffers.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${records[0].ma_nv}.pdf`);
      res.send(pdfBuffers[0]);
    } else {
      const zipBuffer = await createZip(pdfBuffers, records.map(record => `${record.ma_nv}.pdf`));
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=output.zip');
      res.send(zipBuffer);
    }

  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error.message);
    res.status(500).json({ error: 'Lỗi server nội bộ', details: error.message });
  } finally {
    // Đóng browser sau khi hoàn tất
    await closeBrowser();
  }
}

// Xử lý trong worker thread
if (!isMainThread) {
  const { generatePDF } = require('../services/pdf.service.js');
  generatePDF(workerData.html, null)
    .then(buffer => parentPort.postMessage(buffer))
    .catch(err => parentPort.postMessage({ error: err.message }));
}

module.exports = { exportPdfs };