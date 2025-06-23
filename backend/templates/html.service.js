// File: backend/services/html.service.js
const fs = require('fs').promises;
const path = require('path');

async function renderTemplate(data) {
  const templatePath = path.join(__dirname, '../templates/mau_pdf.html');
  let template = await fs.readFile(templatePath, 'utf-8');

  // Thay tất cả các {{key}} nếu tồn tại trong data
  for (const [key, value] of Object.entries(data)) {
    const safeValue = (value !== null && value !== undefined) ? value : '';
    // Giữ nguyên định dạng, chỉ thay \n thành <br>, giữ các ký tự đặc biệt
    const formattedValue = typeof safeValue === 'string' ? safeValue.replace(/\n/g, '<br>') : safeValue;
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, formattedValue);
  }

  // Xóa bỏ các placeholder còn sót lại
  template = template.replace(/{{\s*[\w\.]+\s*}}/g, '');

  return template;
}

module.exports = { renderTemplate };