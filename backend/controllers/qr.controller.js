// File: backend/controllers/qr.controller.js
const { pool } = require('../services/db.service.js');
const QRCode = require('qrcode');
const config = require('../config.js');

async function getQR(req, res) {
  try {
    const { ma_nv } = req.query;
    if (!ma_nv) {
      return res.status(400).json({ error: 'Mã NV is required' });
    }

    const result = await pool.query('SELECT * FROM health_records WHERE ma_nv = $1', [ma_nv]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Tạo link đúng định dạng
    const token = `token_${ma_nv}`;
    const url = `${config.baseUrl}/viewpdf.html?ma_nv=${ma_nv}&token=${token}`;

    // Sinh QR từ link
    const qrCode = await QRCode.toDataURL(url);

    res.status(200).json({ qrCode, ma_nv, url });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

module.exports = { getQR };