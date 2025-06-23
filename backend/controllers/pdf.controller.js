const { pool } = require('../services/db.service.js');
const { generatePDF } = require('../services/pdf.service.js');
const { createZip } = require('../services/zip.service.js');
const { renderTemplate } = require('../services/html.service.js');
const { generateQR } = require('../services/qr.service.js');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config.js'); // chứa baseUrl

async function exportPdfs(req, res) {
  try {
    const result = await pool.query('SELECT * FROM health_records');
    const records = result.rows;

    const outputDir = path.resolve(__dirname, '../outputs');
    await fs.mkdir(outputDir, { recursive: true });

    // ✅ Đọc logo.base64 từ thư mục templates
    const logoRaw = await fs.readFile(path.join(__dirname, '../templates/logo.base64'), 'utf8');
    const logoBase64 = `data:image/png;base64,${logoRaw.trim()}`; // trim để tránh lỗi xuống dòng

    const files = [];

    for (const record of records) {
      // ✅ Tạo QR code cho mỗi người
      // Đúng định dạng mong muốn
const qrUrl = `${config.baseUrl}/viewpdf/?ma_nv=${record.ma_nv}&token=token_${record.ma_nv}`;

      const qrCode = await generateQR(qrUrl);

      // ✅ Render HTML kèm QR và Logo
      const html = await renderTemplate({
        ...record,
        qrCode,
        logoBase64
      });

      // ✅ Xuất ra file PDF
      const pdfPath = path.join(outputDir, `${record.ma_nv}.pdf`);
      await generatePDF(html, pdfPath);
      files.push(pdfPath);
    }

    // ✅ Trả về 1 file PDF hoặc zip nhiều file
    if (files.length === 1) {
      res.sendFile(files[0]);
    } else {
      const zipPath = path.join(outputDir, 'output.zip');
      await createZip(files, zipPath);
      res.sendFile(zipPath);
    }

  } catch (error) {
    console.error('Error exporting PDFs:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

module.exports = { exportPdfs };
