function uploadExcel() {
  const fileInput = document.getElementById('excelFile');
  const status = document.getElementById('uploadStatus');
  const file = fileInput.files[0];

  if (!file) {
    status.textContent = '❌ Vui lòng chọn file Excel!';
    status.style.color = 'red';
    return;
  }

  if (!file.name.endsWith('.xlsx')) {
    status.textContent = '❌ Chỉ hỗ trợ file .xlsx!';
    status.style.color = 'red';
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    status.textContent = '❌ File quá lớn (tối đa 10MB)!';
    status.style.color = 'red';
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  fetch(`${API_BASE_URL}/upload-excel`, {
    method: 'POST',
    body: formData
  })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Lỗi ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Phản hồi không phải JSON');
      }
      return res.json();
    })
    .then(data => {
      status.textContent = '✅ Tải lên thành công!';
      status.style.color = 'green';
      fileInput.value = '';
    })
    .catch(err => {
      status.textContent = `❌ Lỗi tải lên: ${err.message}`;
      status.style.color = 'red';
      console.error('[Upload Error]', err);
    });
}

function downloadPDFs() {
  const url = `${API_BASE_URL}/export-pdfs`;
  window.open(url, '_blank');
}