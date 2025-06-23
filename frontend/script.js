function uploadExcel() {
    const fileInput = document.getElementById('excelFile');
    const status = document.getElementById('uploadStatus');
    const file = fileInput.files[0];
  
    if (!file) {
      alert('Vui lòng chọn file Excel!');
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
          const error = await res.json();
          throw new Error(error.message || 'Upload failed');
        }
        return res.json();
      })
      .then(data => {
        console.log('Upload response:', data);
        status.textContent = '✅ Tải lên thành công!';
        status.style.color = 'green';
        fileInput.value = ''; // reset file
      })
      .catch(err => {
        status.textContent = '❌ Lỗi tải lên!';
        status.style.color = 'red';
        console.error('[Upload Error]', err);
      });
  }
  
  function downloadPDFs() {
    const url = `${API_BASE_URL}/export-pdfs`;
    window.open(url, '_blank'); // ✅ Trình duyệt sẽ xử lý file ZIP/PDF
  }
  