# Cara Menjalankan Zahra Laundry (Flask + Database)

## 1. Install Python (kalau belum ada)
Cek dulu dengan buka terminal/command prompt, ketik:
```
python --version
```
Kalau belum ada, download di python.org (pilih versi 3.10 ke atas).

## 2. Install Flask
Di folder project ini, buka terminal lalu jalankan:
```
pip install flask
```

## 3. Jalankan server
Masih di folder yang sama, jalankan:
```
python app.py
```
Kalau berhasil, akan muncul tulisan kira-kira:
```
Running on http://127.0.0.1:5000
```

## 4. Buka web-nya
Buka browser, ketik di address bar:
```
http://127.0.0.1:5000
```
Web-nya akan tampil sama persis kayak sebelumnya, tapi sekarang:
- Data kategori & harga diambil dari database (`instance/zahra_laundry.db`), bukan hardcode
- Transaksi yang disimpan lewat halaman Kasir benar-benar masuk ke database, bukan cuma localStorage browser
- Riwayat transaksi diambil dari database juga

## 5. PIN Kasir
Sama seperti sebelumnya: `1234` (bisa diganti di `static/script.js`, cari `KASIR_PIN`)

## Struktur folder
```
zahra_laundry/
├── app.py                 <- Backend Flask + semua route API
├── instance/
│   └── zahra_laundry.db   <- Database SQLite (otomatis dibuat saat pertama run)
├── templates/
│   └── index.html         <- Halaman web
└── static/
    ├── style.css           <- Sama persis kayak sebelumnya
    └── script.js           <- Sudah disambungkan ke API Flask (bukan lagi data hardcode)
```

## Kalau mau reset data (hapus semua transaksi & kategori)
Hapus file `instance/zahra_laundry.db`, lalu jalankan `python app.py` lagi —
database baru otomatis dibuat dengan data kategori awal (seed) yang sama
seperti sebelumnya.

## Kalau nanti sudah punya printer thermal fisik
Lihat komentar di bagian bawah `app.py` (bagian "Titik integrasi thermal
printer") — di situ sudah disiapkan contoh kode `python-escpos` yang tinggal
diaktifkan dan disesuaikan Vendor ID/Product ID printer kamu.

## Kenapa masih pakai window.print() untuk struk, bukan langsung ke thermal printer?
Supaya kamu bisa test dan demo sistemnya SEKARANG tanpa perlu beli printer
dulu — cukup print ke PDF atau printer biasa buat lihat hasilnya. Nanti
kalau printer fisik sudah ada, tinggal aktifkan kode `python-escpos` yang
sudah disiapkan.
