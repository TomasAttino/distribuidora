import fs from 'fs';
import * as xlsx from 'xlsx';

try {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet([
    ["A","B","C","D","E","F","G","H","I","J","K","L","M"],
    ["1", "CODE123", "Golosina Prueba", "4", "5", "6", "7", "8", "9", "10", "11", "12", "500.5"]
  ]);
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const formData = new FormData();
  formData.append('file', new Blob([buffer]), 'dummy.xlsx');

  const res = await fetch('http://localhost:3000/api/admin/import', {
    method: 'POST',
    headers: {
      Cookie: 'admin_token=authenticated'
    },
    body: formData
  });

  const text = await res.text();
  fs.writeFileSync('error.html', text);
  console.log('Status:', res.status, 'Saved error.html');
} catch (err) {
  console.error("Test error:", err);
}
