/* =========================================================
   Zahra Laundry - Web Customer (statis, GitHub Pages)
   Pengaturan (alamat, jam, WA, key AI) ada di config.js
   ========================================================= */

const NAMA_TOKO = CONFIG.NAMA_TOKO;
const NOMOR_WA_ADMIN = CONFIG.NOMOR_WA_ADMIN;
const ALAMAT_TOKO = CONFIG.ALAMAT_TOKO;
const JAM_OPERASIONAL = CONFIG.JAM_OPERASIONAL;
const ESTIMASI = CONFIG.ESTIMASI;

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
const SEMUA_LAYANAN = [...KATEGORI.kiloan, ...KATEGORI.satuan, ...KATEGORI.paket];

const TESTIMONIALS = [
    { nama: "Rina A.", rating: 5, teks: "Hasil cuciannya wangi banget dan rapi. Selalu selesai tepat waktu!" },
    { nama: "Budi S.", rating: 5, teks: "Kasirnya ramah, harga jelas di depan. Sudah langganan 6 bulan." },
    { nama: "Dewi P.", rating: 4, teks: "Paket 30kg-nya worth it buat kos-kosan, lebih hemat dibanding kiloan biasa." }
];

const FAQ = [
    ["Berapa lama cucian selesai?", ESTIMASI + " Kamu bisa memantau statusnya lewat menu Lacak Pesanan."],
    ["Bagaimana cara mengecek status cucian?", "Buka menu Lacak Pesanan, lalu masukkan kode pesanan (contoh ZL-7K3P9Q). Kode ada di struk dan pesan WhatsApp dari kami."],
    ["Apa beda kiloan, satuan, dan paket?", "Kiloan dihitung per kg setelah ditimbang kasir. Satuan dihitung per item (selimut, bed cover, sprei). Paket berharga tetap sesuai kapasitas, cocok untuk kebutuhan rutin."],
    ["Bagaimana jika ada permintaan atau catatan khusus?", "Sampaikan ke kasir saat menyerahkan cucian. Kasir mencatatnya pada pesananmu."],
    ["Jam buka dan alamat?", `${JAM_OPERASIONAL}. Alamat: ${ALAMAT_TOKO}.`],
    ["Kode pesananku tidak ditemukan, kenapa?", "Periksa penulisan kodenya. Jika pesananmu baru masuk, data mungkin belum diperbarui beberapa menit. Hubungi admin lewat WhatsApp bila masih belum muncul."]
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
function simpanLokal(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
function bacaLokal(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }

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
function toggleNav() { const nl = document.getElementById("navLinks"); if (nl) nl.classList.toggle("open"); }

function showHargaTab(tab) {
    document.querySelectorAll("#prices .tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".harga-tab").forEach(t => t.classList.remove("active"));
    const idx = { kiloan: 0, satuan: 1, paket: 2 }[tab];
    document.querySelectorAll("#prices .tab-btn")[idx].classList.add("active");
    document.getElementById("harga" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");
}

/* ================== HARGA, KONTAK, TESTIMONI, FAQ ================== */
function renderPriceCards(list) {
    return list.map(i => `<div class="price-card"><h3>${i.nama}</h3><p class="price">${formatRupiah(i.harga)} <span>/${i.satuan}</span></p></div>`).join("");
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
        return `<div class="testimonial-card"><div class="testimonial-head"><div class="avatar-circle">${ini}</div>
            <div><div class="testimonial-name">${t.nama}</div><div class="testimonial-stars">${bintang}</div></div></div>
            <p class="testimonial-text">"${t.teks}"</p></div>`;
    }).join("");

    document.getElementById("faqList").innerHTML = FAQ.map(([q, a]) =>
        `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
}

function chatAdmin(pesan) {
    const teks = pesan || `Halo ${NAMA_TOKO}, saya ingin bertanya tentang laundry saya.`;
    window.open(`https://wa.me/${NOMOR_WA_ADMIN}?text=${encodeURIComponent(teks)}`, "_blank");
}

function kirimPesanAdmin() {
    const nama = document.getElementById("pesanNama").value.trim();
    const topik = document.getElementById("pesanTopik").value;
    const isi = document.getElementById("pesanIsi").value.trim();
    if (!isi) { showToast("Tulis pesanmu dulu."); return; }
    chatAdmin(`Halo ${NAMA_TOKO}, saya ${nama || "pelanggan"}.\nTopik: ${topik}\n${isi}`);
}

/* ================== KALKULATOR BIAYA ================== */
let calcId = 0;
function tambahBarisKalkulator() {
    calcId++;
    const opsi = (judul, list) => `<optgroup label="${judul}">` + list.map(i =>
        `<option value="${SEMUA_LAYANAN.indexOf(i)}">${i.nama} - ${formatRupiah(i.harga)}/${i.satuan}</option>`).join("") + "</optgroup>";
    const row = document.createElement("div");
    row.className = "calc-row";
    row.id = "calc-" + calcId;
    row.innerHTML = `
        <select onchange="hitungKalkulator()">${opsi("Kiloan", KATEGORI.kiloan)}${opsi("Satuan", KATEGORI.satuan)}${opsi("Paket Hemat", KATEGORI.paket)}</select>
        <input type="number" min="0.1" step="0.1" value="1" oninput="hitungKalkulator()">
        <span class="calc-sub">Rp 0</span>
        <button type="button" class="btn-hapus-item" onclick="this.parentElement.remove(); hitungKalkulator();" aria-label="Hapus">&times;</button>`;
    document.getElementById("calcRows").appendChild(row);
    hitungKalkulator();
}

function itemKalkulator() {
    return [...document.querySelectorAll("#calcRows .calc-row")].map(r => {
        const l = SEMUA_LAYANAN[Number(r.querySelector("select").value)];
        const q = Number(r.querySelector("input").value) || 0;
        return { l, q, sub: Math.round(l.harga * q), row: r };
    }).filter(x => x.l && x.q > 0);
}

function hitungKalkulator() {
    let total = 0;
    document.querySelectorAll("#calcRows .calc-row").forEach(r => {
        const l = SEMUA_LAYANAN[Number(r.querySelector("select").value)];
        const q = Number(r.querySelector("input").value) || 0;
        const sub = l ? Math.round(l.harga * q) : 0;
        r.querySelector(".calc-sub").textContent = formatRupiah(sub);
        total += sub;
    });
    document.getElementById("calcTotal").textContent = formatRupiah(total);
}

function pesanDariKalkulator() {
    const items = itemKalkulator();
    if (!items.length) { showToast("Tambahkan layanan dulu."); return; }
    const total = items.reduce((a, x) => a + x.sub, 0);
    chatAdmin(`Halo ${NAMA_TOKO}, saya ingin laundry:\n` +
        items.map(x => `- ${x.l.nama}: ${x.q} ${x.l.satuan} (${formatRupiah(x.sub)})`).join("\n") +
        `\nEstimasi total: ${formatRupiah(total)}`);
}

/* ================== LACAK PESANAN ================== */
const TAHAP = [
    { key: "menunggu", judul: "Pesanan Diterima", ket: "Cucianmu sudah dicatat dan menunggu giliran diproses." },
    { key: "diproses", judul: "Sedang Diproses", ket: "Cucianmu sedang dicuci dan dikeringkan." },
    { key: "dipacking", judul: "Dirapikan & Dikemas", ket: "Cucian sedang disetrika/dilipat dan dikemas." },
    { key: "selesai", judul: "Siap Diambil", ket: "Cucianmu sudah selesai. Silakan diambil di outlet." }
];

let DATA = null;
async function muatData() {
    const res = await fetch("data/pesanan.json?t=" + Date.now(), { cache: "no-store" }); // selalu data terbaru
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
    const langkah = TAHAP.map((t, i) => `<li class="${i < idx ? "done" : i === idx ? "now" : ""}">${t.judul}${i === idx ? `<small>${t.ket}</small>` : ""}</li>`).join("");
    return `<div class="hasil-lacak">
        <div class="meta">
            <p><strong>${esc(kode)}</strong> &middot; ${esc(p.nama)}</p>
            <p>${esc(p.layanan)}</p>
            <p>Masuk: ${esc(p.tanggal)}</p>
            <p style="margin-top:.6rem">Status: <span class="badge ${p.status === "selesai" ? "selesai" : ""}">${TAHAP[idx].judul}</span></p>
        </div>
        <ul class="timeline">${langkah}</ul>
        <p class="note-kecil">Data diperbarui: ${esc(diperbarui || "-")}. Jika status belum berubah, hubungi admin.</p>
        <button class="btn-secondary" style="margin-top:1rem" onclick="chatAdmin('Halo ${NAMA_TOKO}, saya mau tanya pesanan dengan kode ${esc(kode)}.')">Tanya Admin via WhatsApp</button>
    </div>`;
}

function renderRiwayatLacak() {
    const list = bacaLokal("zl_riwayat_lacak", []);
    const el = document.getElementById("riwayatLacak");
    el.innerHTML = list.length ? `<span class="note-kecil">Terakhir dicek:</span> ` +
        list.map(k => `<button type="button" class="chip" onclick="jalankanLacak('${esc(k)}')">${esc(k)}</button>`).join("") : "";
}

async function jalankanLacak(kode) {
    document.getElementById("kodeInput").value = kode;
    const out = document.getElementById("hasilLacak");
    out.innerHTML = "<p class='note-kecil'>Mencari...</p>";
    try {
        const r = await cariPesanan(kode);
        if (r) {
            out.innerHTML = htmlHasil(r.kode, r.p, r.diperbarui);
            simpanLokal("zl_riwayat_lacak", [r.kode, ...bacaLokal("zl_riwayat_lacak", []).filter(k => k !== r.kode)].slice(0, 5));
            renderRiwayatLacak();
        } else {
            out.innerHTML = `<p class="pesan-error">Kode tidak ditemukan. Periksa penulisannya. Jika pesananmu baru masuk, datanya mungkin belum diperbarui. Hubungi admin lewat WhatsApp.</p>`;
        }
    } catch (e) {
        out.innerHTML = `<p class="pesan-error">Data belum bisa dimuat. Periksa koneksi internetmu lalu coba lagi.</p>`;
    }
}

function lacakPesanan(e) { e.preventDefault(); jalankanLacak(document.getElementById("kodeInput").value); }

/* ================== ASISTEN CHAT ================== */
const adaAI = () => !!(CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY.trim());
let riwayatChat = [];
let jumlahAI = 0;

function toggleChat() {
    const box = document.getElementById("chatBox");
    box.classList.toggle("open");
    const body = document.getElementById("chatBody");
    document.getElementById("chatMode").textContent = adaAI() ? "Didukung AI" : "Asisten otomatis";
    if (box.classList.contains("open") && !body.children.length) {
        pesanChat("bot", "Halo! Aku asisten Zahra Laundry. Tanya soal harga, jam buka, layanan, atau kirim kode pesananmu (contoh: ZL-7K3P9Q) untuk cek status.");
    }
}

function pesanChat(dari, teks) {
    const el = document.createElement("div");
    el.className = "msg " + dari;
    el.textContent = teks;
    const body = document.getElementById("chatBody");
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
}

const hargaTeks = (judul, list) => `${judul}:\n` + list.map(i => `- ${i.nama}: ${formatRupiah(i.harga)}/${i.satuan}`).join("\n");

/* Asisten kata kunci: dipakai bila AI tidak aktif / gagal / kuota habis */
async function jawabKataKunci(q, faktaKode) {
    const t = q.toLowerCase();
    if (faktaKode) return faktaKode.teks;
    if (/selimut|bed ?cover|sprei|seprai|satuan/.test(t)) return hargaTeks("Harga satuan", KATEGORI.satuan);
    if (/paket|hemat/.test(t)) return hargaTeks("Paket hemat", KATEGORI.paket);
    if (/kiloan|per ?kilo|\bkg\b|cuci|setrika|lipat/.test(t)) return hargaTeks("Harga kiloan", KATEGORI.kiloan);
    if (/harga|tarif|biaya|berapa/.test(t)) return [hargaTeks("Kiloan", KATEGORI.kiloan), hargaTeks("Satuan", KATEGORI.satuan), hargaTeks("Paket", KATEGORI.paket)].join("\n\n");
    if (/jam|buka|tutup|operasional/.test(t)) return `Jam buka: ${JAM_OPERASIONAL}.\nAlamat: ${ALAMAT_TOKO}.`;
    if (/alamat|lokasi|dimana|di mana|tempat/.test(t)) return `Alamat: ${ALAMAT_TOKO}.\nJam buka: ${JAM_OPERASIONAL}.`;
    if (/lama|estimasi|berapa hari|kapan/.test(t)) return `${ESTIMASI} Untuk cek status, kirim kode pesananmu (contoh: ZL-7K3P9Q).`;
    if (/lacak|status|track|pesanan/.test(t)) return "Kirim kode pesananmu di sini (contoh: ZL-7K3P9Q), atau buka menu Lacak Pesanan. Kode ada di struk dan pesan WhatsApp dari kami.";
    if (/terima kasih|makasih|thanks/.test(t)) return "Sama-sama!";
    if (/halo|hai|\bhi\b|assalam|selamat/.test(t)) return "Halo! Mau tanya harga, jam buka, atau cek status pesanan?";
    return "Maaf, aku belum paham pertanyaan itu. Aku bisa jawab soal harga, jam buka, alamat, estimasi, dan status pesanan. Untuk hal lain, silakan chat admin lewat WhatsApp.";
}

function sistemPrompt() {
    return `Kamu adalah asisten virtual ${NAMA_TOKO}, laundry kiloan dan satuan. Jawab dalam bahasa Indonesia yang ramah, singkat, dan jelas (maksimal 4 kalimat).
Hanya jawab berdasarkan informasi berikut. Jika informasi tidak ada, katakan belum tahu dan sarankan menghubungi admin lewat WhatsApp (tombol hijau di halaman). Jangan mengarang harga, promo, kebijakan, atau layanan antar-jemput.
Jam buka: ${JAM_OPERASIONAL}. Alamat: ${ALAMAT_TOKO}. ${ESTIMASI}
Daftar harga:
${hargaTeks("Kiloan", KATEGORI.kiloan)}
${hargaTeks("Satuan", KATEGORI.satuan)}
${hargaTeks("Paket", KATEGORI.paket)}
Cek status pesanan: pelanggan memasukkan kode (format ZL-XXXXXX) di menu Lacak Pesanan. Tahap status: Pesanan Diterima, Sedang Diproses, Dirapikan & Dikemas, Siap Diambil.
Jika pesan berisi "[DATA PELACAKAN]", sampaikan status itu apa adanya. Jangan membahas data pelanggan lain.`;
}

/* Streaming dari Groq (efek mengetik). Mengembalikan teks lengkap, atau melempar error. */
async function tanyaGroq(q, faktaKode, el) {
    const user = faktaKode ? `${q}\n\n[DATA PELACAKAN]\n${faktaKode.teks}` : q;
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + CONFIG.GROQ_API_KEY.trim() },
        body: JSON.stringify({
            model: CONFIG.GROQ_MODEL, stream: true, temperature: 0.3, max_tokens: 350,
            messages: [{ role: "system", content: sistemPrompt() }, ...riwayatChat.slice(-8), { role: "user", content: user }]
        })
    });
    if (!res.ok) throw new Error("Groq " + res.status);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", teks = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const baris = buf.split("\n");
        buf = baris.pop();
        for (const b of baris) {
            if (!b.startsWith("data:")) continue;
            const isi = b.slice(5).trim();
            if (isi === "[DONE]") continue;
            try {
                const t = JSON.parse(isi).choices?.[0]?.delta?.content;
                if (t) { teks += t; el.textContent = teks; document.getElementById("chatBody").scrollTop = 1e9; }
            } catch (e) { /* potongan belum lengkap */ }
        }
    }
    if (!teks) throw new Error("kosong");
    return teks;
}

async function faktaPelacakan(q) {
    const kode = (q.toUpperCase().match(/ZL-[A-Z0-9]{4,8}/) || [])[0];
    if (!kode) return null;
    try {
        const r = await cariPesanan(kode);
        if (!r) return { teks: `Kode ${kode} tidak ditemukan. Periksa penulisannya atau hubungi admin.` };
        const tahap = TAHAP.find(x => x.key === r.p.status) || TAHAP[0];
        return { teks: `Pesanan ${kode} (${r.p.nama}, ${r.p.layanan})\nStatus: ${tahap.judul}\n${tahap.ket}\nData diperbarui: ${r.diperbarui}` };
    } catch (e) { return { teks: "Data pesanan belum bisa dimuat. Coba lagi nanti." }; }
}

async function prosesChat(q) {
    pesanChat("user", q);
    const el = pesanChat("bot", "Sedang berpikir...");
    el.classList.add("typing");
    const fakta = await faktaPelacakan(q);
    let jawaban = "";
    if (adaAI() && jumlahAI < (CONFIG.GROQ_MAKS_PESAN || 20)) {
        try { jumlahAI++; jawaban = await tanyaGroq(q, fakta, el); }
        catch (e) { jawaban = await jawabKataKunci(q, fakta); el.textContent = jawaban; }
    } else {
        jawaban = await jawabKataKunci(q, fakta);
        el.textContent = jawaban;
    }
    el.classList.remove("typing");
    riwayatChat.push({ role: "user", content: q }, { role: "assistant", content: jawaban });
    riwayatChat = riwayatChat.slice(-12);
    document.getElementById("chatBody").scrollTop = 1e9;
}

function kirimChat(e) {
    e.preventDefault();
    const inp = document.getElementById("chatInput");
    const q = inp.value.trim();
    if (!q) return;
    inp.value = "";
    prosesChat(q);
}

function kirimCepat(q) {
    const box = document.getElementById("chatBox");
    if (!box.classList.contains("open")) toggleChat();
    prosesChat(q);
}

/* ================== INIT ================== */
document.addEventListener("DOMContentLoaded", () => {
    renderHalaman();
    tambahBarisKalkulator();
    renderRiwayatLacak();
    showPage("home");
    const kode = new URLSearchParams(location.search).get("kode"); // link dari WhatsApp: ?kode=ZL-XXXXXX
    if (kode) { showPage("lacak"); jalankanLacak(kode); }
});
