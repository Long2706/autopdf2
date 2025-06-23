const { pool } = require('../services/db.service.js');
const XLSX = require('xlsx');

async function uploadExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const headers = data[0];
    const jsonData = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    const query = `
      INSERT INTO health_records (
        stt, ma_nv, ten_nv, ngay_sinh, gioi_tinh, bo_phan, chieu_cao, can_nang, mach, huyet_ap,
        bmi, tuan_hoan, ho_hap, tieu_hoa, than_tiet_nieu, noi_tiet, co_xuong_khop,
        than_kinh, tam_than, ngoai_khoa, da_lieu, san_phu_khoa, mat, tai_mui_hong,
        rang_ham_mat, tong_hop_ket_qua, chup_x_quang, sieu_am_tuyen_giap, sieu_am_bung,
        phan_loai, kien_nghi, kien_nghi2
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
      ON CONFLICT (ma_nv) DO NOTHING
    `;

    for (const row of jsonData) {
      const values = [
        row['STT'] || null, row['MÃ NV'] || null, row['TÊN NV'] || null, row['NGÀY SINH'] || null,
        row['GIỚI TÍNH'] || null, row['BỘ PHẬN'] || null, row['Chiều cao'] || null,
        row['Cân nặng'] || null, row['Mạch'] || null, row['Huyết áp'] || null, row['BMI'] || null,
        row['Tuần hoàn'] || null, row['Hô hấp'] || null, row['Tiêu hóa'] || null,
        row['Thận tiết niệu'] || null, row['Nội tiết'] || null, row['Cơ xương khớp'] || null,
        row['Thần kinh'] || null, row['Tâm thần'] || null, row['Ngoại khoa'] || null,
        row['Da liễu'] || null, row['Sản phụ khoa'] || null, row['Mắt'] || null,
        row['Tai Mũi Họng'] || null, row['Răng Hàm Mặt'] || null, row['Tổng hợp kết quả xét nghiệm'] || null,
        row['Chụp X Quang tim phổi thẳng'] || null, row['Siêu âm tuyến giáp'] || null,
        row['Siêu âm Bụng TQ'] || null, row['Phân loại'] || null, row['Kiến Nghị'] || null,
        row['kiến nghị2'] || null
      ];
      await pool.query(query, values);
    }

    res.status(200).json({ message: 'Dữ liệu tải lên thành công' });
  } catch (error) {
    console.error('Lỗi khi upload Excel:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
}

async function getRecords(req, res) {
  try {
    const result = await pool.query('SELECT * FROM health_records');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Lỗi khi lấy records:', error);
    res.status(500).json({ error: 'Lỗi server nội bộ', details: error.message });
  }
}

async function getRecordByMaNV(req, res) {
  const { ma_nv } = req.params;
  const { token } = req.query;

  if (!ma_nv || !token) {
    return res.status(400).json({ error: 'Thiếu mã nhân viên hoặc token' });
  }

  if (token !== `token_${ma_nv}`) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }

  try {
    const result = await pool.query('SELECT * FROM health_records WHERE ma_nv = $1', [ma_nv]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Lỗi khi lấy record:', error);
    res.status(500).json({ error: 'Lỗi server nội bộ', details: error.message });
  }
}

module.exports = {
  uploadExcel,
  getRecords,
  getRecordByMaNV
};