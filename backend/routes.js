const express = require('express');
const { uploadExcel, getRecords, getRecordByMaNV } = require('./controllers/excel.controller.js');
const { getQR } = require('./controllers/qr.controller.js');
const { exportPdfs } = require('./controllers/pdf.controller.js');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/upload-excel', upload.single('file'), uploadExcel);
router.get('/records', getRecords);
router.get('/records/:ma_nv', getRecordByMaNV); // ✅ mới
router.get('/get-qr', getQR);
router.get('/export-pdfs', exportPdfs);

module.exports = router;
