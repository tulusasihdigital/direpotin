# Qiscus Leads Dashboard

Dashboard HTML/CSS/JS yang siap dipublish gratis melalui GitHub Pages.

## Mode semi-dinamis
Dashboard bisa membaca Google Sheets sebagai CSV. Anda cukup mengubah spreadsheet, lalu refresh website.

1. Import file report ke Google Sheets.
2. Pastikan struktur report tetap memuat baris `Total Leads/Bulan`, `CLOSING`, dan `SUCCESS RATE`.
3. Publish sheet: **File → Share → Publish to web**.
4. Gunakan URL:
`https://docs.google.com/spreadsheets/d/ID_SHEET/export?format=csv&gid=GID`
5. Buka `app.js` dan isi:
`const SHEET_CSV_URL = "URL_CSV_ANDA";`
6. Upload `index.html`, `app.js`, dan `data.json` ke repository GitHub.
7. GitHub: **Settings → Pages → Deploy from branch → main → /root**.

## Catatan
- `data.json` adalah fallback dari data file yang Anda upload, sehingga dashboard tetap bisa dicoba tanpa Google Sheets.
- GitHub Pages gratis dan cocok untuk dashboard static seperti ini.
- Jika ingin auto-refresh tanpa reload, ubah script agar mengambil data ulang setiap 5–15 menit.
- Jangan publish data pribadi/sensitif di Google Sheets publik.
