const AdmZip = require('adm-zip');

async function createZip(files, outputPath) {
  const zip = new AdmZip();
  for (const file of files) {
    zip.addLocalFile(file);
  }
  zip.writeZip(outputPath);
}

module.exports = { createZip };