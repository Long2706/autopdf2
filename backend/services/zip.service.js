// File: backend/services/zip.service.js
const AdmZip = require('adm-zip');

async function createZip(buffers, fileNames) {
  const zip = new AdmZip();
  buffers.forEach((buffer, index) => {
    zip.addFile(fileNames[index], buffer);
  });
  return zip.toBuffer();
}

module.exports = { createZip };