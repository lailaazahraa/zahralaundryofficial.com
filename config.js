/* =========================================================
   PENGATURAN WEB CUSTOMER - edit file ini saja.
   (Salin alamat, jam buka, dan estimasi dari script.js lama kamu.)
   ========================================================= */
const CONFIG = {
    NAMA_TOKO: "Zahra Laundry",
    NOMOR_WA_ADMIN: "6287886277532",
    ALAMAT_TOKO: "Jl. Janur Kuning No.85",   // GANTI dengan alamat asli
    JAM_OPERASIONAL: "Setiap hari, 08.00 - 12.00 & 16.00 - 21.00",    // GANTI bila berbeda
    ESTIMASI: "Estimasi selesai reguler 1x24 jam.",   // GANTI bila berbeda

    // Chat AI (Groq). Buat key gratis di https://console.groq.com/keys lalu tempel di bawah.
    // Kosongkan untuk memakai asisten kata kunci biasa. CATATAN: key di web statis terlihat publik.
    GROQ_API_KEY: "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",
    GROQ_MODEL: "llama-3.1-8b-instant",
    GROQ_MAKS_PESAN: 20            // batas pesan AI per pengunjung per sesi (hemat kuota)
};
