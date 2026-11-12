/* =========================================================
   Zahra Laundry - Web Customer (statis, tanpa backend)
   Hosting: GitHub Pages. Data pelacakan dibaca dari data/pesanan.json
   ========================================================= */

/* ================== KONFIGURASI (edit di sini) ================== */
const NAMA_TOKO = "Zahra Laundry";
const NOMOR_WA_ADMIN = "6287886277532";
const ALAMAT_TOKO = "Jl. Contoh Alamat No. 1, Dumai"; // TODO: ganti alamat asli
const JAM_OPERASIONAL = "Setiap hari, 08.00 - 20.00";
const ESTIMASI = "Estimasi selesai reguler 1x24 jam.";

// Harga (samakan dengan harga di web kasir)
const KATEGORI = {
    kiloan: [
        { nama: "Cuci Setrika", harga: 6000, satuan: "kg" },
        { nama: "Cuci Lipat", harga: 5000, satuan: "kg" },
        { nama: "Setrika Saja", harga: 4000, satuan: "kg" }
    ],
    satuan: [
        { nama: "Selimut (Single)", harga: 15000, satuan: "pcs" },
        { nama: "Selimut (Queen)", harga: 20000, satuan: "pcs" },
        { nama: "Selimut (King)", harga: 25000, satuan: "pcs" },
        { nama: "Bed Cover (Single)", harga: 20000, satuan: "pcs" },
        { nama: "Bed Cover (Queen)", harga: 25000, satuan: "pcs" },
        { nama: "Bed Cover (King)", harga: 30000, satuan: "pcs" },
        { nama: "Set Sprei (Single)", harga: 15000, satuan: "set" },
        { nama: "Set Sprei (Queen)", harga: 20000, satuan: "set" },
        { nama: "Set Sprei (King)", harga: 25000, satuan: "set" }
    ],
    paket: [
        { nama: "Paket A (30kg)", harga: 150000, satuan: "paket" },
        { nama: "Paket B (50kg)", harga: 225000, satuan: "paket" },
        { nama: "Paket C (100kg)", harga: 400000, satuan: "paket" }
    ]
};

const TESTIMONIALS = [
    { nama: "Rina A.", rating: 5, teks: "Hasil cuciannya wangi banget dan rapi. Selalu selesai tepat waktu!" },
    { nama: "Budi S.", rating: 5, teks: "Kasirnya ramah, harga jelas di depan. Sudah langganan 6 bulan." },
    { nama: "Dewi P.", rating: 4, teks: "Paket 30kg-nya worth it buat kos-kosan, lebih hemat dibanding kiloan biasa." }
];

// Tahap pelacakan. "key" harus sama dengan status di pesanan.json / web kasir.
const TAHAP = [
    { key: "menunggu", judul: "Pesanan Diterima", ket: "Cucianmu sudah dicatat dan menunggu giliran diproses." },
    { key: "diproses", judul: "Sedang Diproses", ket: "Cucianmu sedang dicuci dan dikeringkan." },
    { key: "dipacking", judul: "Dirapikan & Dikemas", ket: "Cucian sedang disetrika/dilipat dan dikemas." },
    { key: "selesai", judul: "Siap Diambil", ket: "Cucianmu sudah selesai. Silakan diambil di outlet." }
];

/* ================== UTIL ================== */
const formatRupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const normKode = s => String(s).trim().toUpperCase().replace(/\s+/g, "");

let toastTimer = null;
function showToast(pesan) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = pesan;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ================== NAVIGASI ================== */
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const target = document.getElementById(pageId);
    if (target) target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelectorAll(".nav-links a").forEach(a => a.classList.toggle("active-link", a.dataset.page === pageId));
    const nl = document.getElementById("navLinks");
    if (nl) nl.classList.remove("open");
}

function toggleNav() {
    const nl = document.getElementById("navLinks");
    if (nl) nl.classList.toggle("open");
}

function showHargaTab(tab) {
    document.querySelectorAll("#prices .tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".harga-tab").forEach(t => t.classList.remove("active"));
    const idx = { kiloan: 0, satuan: 1, paket: 2 }[tab];
    document.querySelectorAll("#prices .tab-btn")[idx].classList.add("active");
    document.getElementById("harga" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");
}

/* ================== HARGA, KONTAK, TESTIMONI ================== */
function renderPriceCards(list) {
    return list.map(i => `
        <div class="price-card">
            <h3>${i.nama}</h3>
            <p class="price">${formatRupiah(i.harga)} <span>/${i.satuan}</span></p>
        </div>`).join("");
}

function renderHalaman() {
    document.getElementById("priceGridKiloan").innerHTML = renderPriceCards(KATEGORI.kiloan);
    document.getElementById("priceGridSatuan").innerHTML = renderPriceCards(KATEGORI.satuan);
    document.getElementById("priceGridPaket").innerHTML = renderPriceCards(KATEGORI.paket);
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set("infoAlamat", ALAMAT_TOKO); set("infoJam", JAM_OPERASIONAL); set("infoWA", "+" + NOMOR_WA_ADMIN);
    set("footerAlamat", ALAMAT_TOKO); set("footerJam", JAM_OPERASIONAL);

    document.getElementById("testimonialGrid").innerHTML = TESTIMONIALS.map(t => {
        const ini = t.nama.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
        const bintang = "★".repeat(t.rating) + "☆".repeat(5 - t.rating);
        return `<div class="testimonial-card">
            <div class="testimonial-head"><div class="avatar-circle">${ini}</div>
                <div><div class="testimonial-name">${t.nama}</div><div class="testimonial-stars">${bintang}</div></div></div>
            <p class="testimonial-text">"${t.teks}"</p></div>`;
    }).join("");
}

function chatAdmin(pesan) {
    const teks = pesan || `Halo ${NAMA_TOKO}, saya ingin bertanya tentang laundry saya.`;
    window.open(`https://wa.me/${NOMOR_WA_ADMIN}?text=${encodeURIComponent(teks)}`, "_blank");
}

/* ================== LACAK PESANAN ================== */
let DATA = null;
async function muatData() {
    if (DATA) return DATA;
    const res = await fetch("data/pesanan.json?t=" + Date.now()); // ?t= supaya selalu data terbaru
    if (!res.ok) throw new Error("HTTP " + res.status);
    DATA = await res.json();
    return DATA;
}

async function cariPesanan(kodeMentah) {
    const kode = normKode(kodeMentah);
    const d = await muatData();
    const p = d.pesanan[kode];
    return p ? { kode, p, diperbarui: d.diperbarui } : null;
}

function htmlHasil(kode, p, diperbarui) {
    let idx = TAHAP.findIndex(t => t.key === p.status);
    if (idx < 0) idx = 0;
    const langkah = TAHAP.map((t, i) => {
        const cls = i < idx ? "done" : i === idx ? "now" : "";
        return `<li class="${cls}">${t.judul}${i === idx ? `<small>${t.ket}</small>` : ""}</li>`;
    }).join("");
    return `<div class="hasil-lacak">
        <div class="meta">
            <p><strong>${esc(kode)}</strong> &middot; ${esc(p.nama)}</p>
            <p>${esc(p.layanan)}</p>
            <p>Masuk: ${esc(p.tanggal)}</p>
            <p style="margin-top:.6rem">Status: <span class="badge ${p.status === "selesai" ? "selesai" : ""}">${TAHAP[idx].judul}</span></p>
        </div>
        <ul class="timeline">${langkah}</ul>
        <p class="note-kecil">Data diperbarui: ${esc(diperbarui || "-")}. Status diperbarui oleh kasir secara berkala. Jika belum berubah, hubungi admin.</p>
        <button class="btn-secondary" style="margin-top:1rem" onclick="chatAdmin('Halo ${NAMA_TOKO}, saya mau tanya pesanan dengan kode ${esc(kode)}.')">Tanya Admin via WhatsApp</button>
    </div>`;
}

async function jalankanLacak(kode) {
    const out = document.getElementById("hasilLacak");
    out.innerHTML = "<p class='note-kecil'>Mencari...</p>";
    try {
        const r = await cariPesanan(kode);
        out.innerHTML = r ? htmlHasil(r.kode, r.p, r.diperbarui)
            : `<p class="pesan-error">Kode tidak ditemukan. Periksa penulisannya. Jika pesananmu baru masuk, datanya mungkin belum diperbarui. Hubungi admin lewat WhatsApp.</p>`;
    } catch (e) {
        out.innerHTML = `<p class="pesan-error">Data belum bisa dimuat. Pastikan kamu membuka lewat alamat website (bukan membuka file langsung), lalu coba lagi.</p>`;
    }
}

function lacakPesanan(e) {
    e.preventDefault();
    jalankanLacak(document.getElementById("kodeInput").value);
}

/* ================== ASISTEN CHAT (kata kunci, tanpa server & tanpa API key) ================== */
function toggleChat() {
    const box = document.getElementById("chatBox");
    box.classList.toggle("open");
    const body = document.getElementById("chatBody");
    if (box.classList.contains("open") && !body.children.length) {
        pesanChat("bot", "Halo! Aku asisten Zahra Laundry. Tanya soal harga, jam buka, alamat, estimasi selesai, atau kirim kode pesananmu (contoh: ZL-7K3P9Q) untuk cek status.");
    }
}

function pesanChat(dari, teks) {
    const el = document.createElement("div");
    el.className = "msg " + dari;
    el.textContent = teks;
    const body = document.getElementById("chatBody");
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
}

const hargaTeks = (judul, list) => `${judul}:\n` + list.map(i => `- ${i.nama}: ${formatRupiah(i.harga)}/${i.satuan}`).join("\n");

async function jawab(q) {
    const t = q.toLowerCase();
    const kode = (q.toUpperCase().match(/ZL-[A-Z0-9]{4,8}/) || [])[0];
    if (kode) {
        try {
            const r = await cariPesanan(kode);
            if (!r) return `Kode ${kode} tidak ditemukan. Periksa penulisannya atau hubungi admin.`;
            const tahap = TAHAP.find(x => x.key === r.p.status) || TAHAP[0];
            return `Pesanan ${kode} (${r.p.nama}, ${r.p.layanan})\nStatus: ${tahap.judul}\n${tahap.ket}`;
        } catch (e) { return "Data pesanan belum bisa dimuat. Coba lagi nanti."; }
    }
    if (/selimut|bed ?cover|sprei|seprai|satuan/.test(t)) return hargaTeks("Harga satuan", KATEGORI.satuan);
    if (/paket|hemat/.test(t)) return hargaTeks("Paket hemat", KATEGORI.paket);
    if (/kiloan|per ?kilo|\bkg\b/.test(t)) return hargaTeks("Harga kiloan", KATEGORI.kiloan);
    if (/harga|tarif|biaya|berapa/.test(t)) return [hargaTeks("Kiloan", KATEGORI.kiloan), hargaTeks("Satuan", KATEGORI.satuan), hargaTeks("Paket", KATEGORI.paket)].join("\n\n");
    if (/jam|buka|tutup|operasional/.test(t)) return `Jam buka: ${JAM_OPERASIONAL}.`;
    if (/alamat|lokasi|dimana|di mana|tempat/.test(t)) return `Alamat: ${ALAMAT_TOKO}.`;
    if (/lama|estimasi|berapa hari|kapan/.test(t)) return `${ESTIMASI} Untuk cek status, kirim kode pesananmu (contoh: ZL-7K3P9Q).`;
    if (/lacak|status|track|pesanan|cucian/.test(t)) return "Kirim kode pesananmu di sini (contoh: ZL-7K3P9Q), atau buka menu Lacak Pesanan. Kode ada di struk dan pesan WhatsApp dari kami.";
    if (/terima kasih|makasih|thanks/.test(t)) return "Sama-sama!";
    if (/halo|hai|\bhi\b|assalam|selamat/.test(t)) return "Halo! Mau tanya harga, jam buka, atau cek status pesanan?";
    return "Maaf, aku belum paham pertanyaan itu. Aku bisa jawab soal harga, jam buka, alamat, estimasi, dan status pesanan. Untuk hal lain, silakan chat admin lewat WhatsApp.";
}

async function kirimChat(e) {
    e.preventDefault();
    const inp = document.getElementById("chatInput");
    const q = inp.value.trim();
    if (!q) return;
    pesanChat("user", q);
    inp.value = "";
    pesanChat("bot", await jawab(q));
}

/* ================== INIT ================== */
document.addEventListener("DOMContentLoaded", () => {
    renderHalaman();
    showPage("home");
    // Link dari WhatsApp: ...?kode=ZL-XXXXXX  -> langsung buka halaman lacak
    const kode = new URLSearchParams(location.search).get("kode");
    if (kode) {
        showPage("lacak");
        document.getElementById("kodeInput").value = kode;
        jalankanLacak(kode);
    }
});
