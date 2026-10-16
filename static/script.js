/* ================== KONFIGURASI (edit di sini) ================== */

const NAMA_TOKO = "Zahra Laundry";
const NOMOR_WA_ADMIN = "628123456789"; // nomor WA admin/kasir
const KASIR_PIN = "1234"; // PIN sederhana
const ALAMAT_TOKO = "Jl. Contoh Alamat No. 1, Dumai";
const JAM_OPERASIONAL = "Setiap hari, 08.00 - 20.00";

let KATEGORI = { kiloan: [], satuan: [], paket: [] };

// Testimoni contoh
const TESTIMONIALS = [
    { nama: "Rina A.", rating: 5, teks: "Hasil cuciannya wangi banget dan rapi. Selalu selesai tepat waktu!" },
    { nama: "Budi S.", rating: 5, teks: "Kasirnya ramah, harga jelas di depan. Sudah langganan 6 bulan." },
    { nama: "Dewi P.", rating: 4, teks: "Paket 30kg-nya worth it buat kos-kosan, lebih hemat dibanding kiloan biasa." },
];

/* ================== AMBIL DATA DARI SERVER ================== */

async function muatKategoriDariServer() {
    try {
        const res = await fetch('/api/kategori');
        KATEGORI = await res.json();
    } catch (err) {
        console.error('Gagal memuat kategori dari server:', err);
        showToast('Gagal memuat data kategori. Cek koneksi ke server.');
    }
}

/* ================== NAVIGASI HALAMAN ================== */

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active-link', a.dataset.page === pageId);
    });

    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('open');

    if (pageId === 'prices') renderPriceLists();
    if (pageId === 'kasir') renderRiwayat();
}

function toggleNav() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('open');
}

function openKasir() {
    if (sessionStorage.getItem('kasir_auth') === 'ok') {
        showPage('kasir');
        return;
    }
    const pin = prompt("Masukkan PIN Kasir:");
    if (pin === KASIR_PIN) {
        sessionStorage.setItem('kasir_auth', 'ok');
        showPage('kasir');
    } else if (pin !== null) {
        showToast("PIN salah.");
    }
}

function showKasirTab(tab) {
    document.querySelectorAll('#kasir .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.kasir-tab').forEach(t => t.classList.remove('active'));
    if (tab === 'input') {
        document.querySelectorAll('#kasir .tab-btn')[0].classList.add('active');
        document.getElementById('kasirInput').classList.add('active');
    } else {
        document.querySelectorAll('#kasir .tab-btn')[1].classList.add('active');
        document.getElementById('kasirRiwayat').classList.add('active');
        renderRiwayat();
    }
}

function showHargaTab(tab) {
    document.querySelectorAll('#prices .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.harga-tab').forEach(t => t.classList.remove('active'));
    const idx = { kiloan: 0, satuan: 1, paket: 2 }[tab];
    document.querySelectorAll('#prices .tab-btn')[idx].classList.add('active');
    document.getElementById('harga' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

/* ================== TOAST ================== */

let toastTimer = null;
function showToast(pesan) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = pesan;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ================== HALAMAN HARGA ================== */

function formatRupiah(n) {
    return "Rp " + Number(n).toLocaleString('id-ID');
}

function renderPriceCards(list) {
    if (!list) return '';
    return list.map(item => `
        <div class="price-card">
            <h3>${item.nama}</h3>
            <p class="price">${formatRupiah(item.harga)} <span>/${item.satuan}</span></p>
        </div>
    `).join('');
}

function renderPriceLists() {
    const elKiloan = document.getElementById('priceGridKiloan');
    const elSatuan = document.getElementById('priceGridSatuan');
    const elPaket = document.getElementById('priceGridPaket');

    if (elKiloan) elKiloan.innerHTML = renderPriceCards(KATEGORI.kiloan);
    if (elSatuan) elSatuan.innerHTML = renderPriceCards(KATEGORI.satuan);
    if (elPaket) elPaket.innerHTML = renderPriceCards(KATEGORI.paket);
}

/* ================== HALAMAN BANTUAN ================== */

function isiInfoKontak() {
    const elAlamat = document.getElementById('infoAlamat');
    const elJam = document.getElementById('infoJam');
    const elWA = document.getElementById('infoWA');
    const ftAlamat = document.getElementById('footerAlamat');
    const ftJam = document.getElementById('footerJam');

    if (elAlamat) elAlamat.textContent = ALAMAT_TOKO;
    if (elJam) elJam.textContent = JAM_OPERASIONAL;
    if (elWA) elWA.textContent = "+" + NOMOR_WA_ADMIN;
    if (ftAlamat) ftAlamat.textContent = ALAMAT_TOKO;
    if (ftJam) ftJam.textContent = JAM_OPERASIONAL;
}

function renderTestimonials() {
    const grid = document.getElementById('testimonialGrid');
    if (!grid) return;
    grid.innerHTML = TESTIMONIALS.map(t => {
        const inisial = t.nama.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const bintang = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);
        return `
            <div class="testimonial-card">
                <div class="testimonial-head">
                    <div class="avatar-circle">${inisial}</div>
                    <div>
                        <div class="testimonial-name">${t.nama}</div>
                        <div class="testimonial-stars">${bintang}</div>
                    </div>
                </div>
                <p class="testimonial-text">"${t.teks}"</p>
            </div>
        `;
    }).join('');
}

function chatAdmin() {
    const pesan = encodeURIComponent(`Halo ${NAMA_TOKO}, saya ingin bertanya tentang laundry saya.`);
    window.open(`https://wa.me/${NOMOR_WA_ADMIN}?text=${pesan}`, '_blank');
}

/* ================== UKURAN KERTAS STRUK ================== */

function simpanUkuranKertas() {
    const val = document.getElementById('ukuranKertas').value;
    localStorage.setItem('zahra_paper_size', val);
}

function muatUkuranKertas() {
    const val = localStorage.getItem('zahra_paper_size') || '80mm';
    const select = document.getElementById('ukuranKertas');
    if (select) select.value = val;
    return val;
}

function terapkanUkuranKertasPrint(ukuran) {
    let styleTag = document.getElementById('printPageSize');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'printPageSize';
        document.head.appendChild(styleTag);
    }
    if (ukuran === 'a5') {
        styleTag.textContent = '@page { size: A5; margin: 10mm; }';
    } else if (ukuran === '58mm') {
        styleTag.textContent = '@page { size: 58mm auto; margin: 0; }';
    } else {
        styleTag.textContent = '@page { size: 80mm auto; margin: 0; }';
    }
}

function formatTelpDisplay(nomor) {
    return nomor.startsWith('62') ? '0' + nomor.slice(2) : nomor;
}

/* ================== BARIS ITEM (KASIR) ================== */

let rowCounter = 0;

function tambahBaris() {
    rowCounter++;
    const rowId = `row_${rowCounter}`;
    const container = document.getElementById('itemRows');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'item-row';
    row.id = rowId;
    row.innerHTML = `
        <select onchange="isiSubLayanan('${rowId}')">
            <option value="kiloan">Kiloan</option>
            <option value="satuan">Satuan</option>
            <option value="paket">Paket</option>
        </select>
        <select onchange="hitungTotal()"></select>
        <input type="number" min="0" step="0.1" placeholder="0" oninput="hitungTotal()">
        <span class="subtotal-mini">Rp 0</span>
        <button type="button" class="btn-remove" onclick="hapusBaris('${rowId}')">&times;</button>
    `;
    container.appendChild(row);
    isiSubLayanan(rowId);
    updateEmptyHint();
}

function hapusBaris(rowId) {
    const el = document.getElementById(rowId);
    if (el) el.remove();
    hitungTotal();
    updateEmptyHint();
}

function updateEmptyHint() {
    const container = document.getElementById('itemRows');
    const hint = document.getElementById('itemKosong');
    if (hint && container) hint.style.display = container.children.length === 0 ? 'block' : 'none';
}

function getListByKategori(tipe) {
    return KATEGORI[tipe] || [];
}

function isiSubLayanan(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const tipe = row.children[0].value;
    const subSelect = row.children[1];
    const list = getListByKategori(tipe);
    subSelect.innerHTML = list.map(item =>
        `<option value="${item.id}">${item.nama} (${formatRupiah(item.harga)}/${item.satuan})</option>`
    ).join('');

    const jumlahInput = row.children[2];
    jumlahInput.value = tipe === 'paket' ? 1 : '';

    hitungTotal();
}

function getDataLayanan(id) {
    const idNum = Number(id);
    return KATEGORI.kiloan.find(i => i.id === idNum)
        || KATEGORI.satuan.find(i => i.id === idNum)
        || KATEGORI.paket.find(i => i.id === idNum);
}

function ambilSemuaItem() {
    const rows = document.querySelectorAll('#itemRows .item-row');
    const items = [];
    rows.forEach(row => {
        const layananId = row.children[1].value;
        const jumlah = parseFloat(row.children[2].value) || 0;
        const data = getDataLayanan(layananId);
        const subtotalEl = row.querySelector('.subtotal-mini');
        const subtotal = data ? data.harga * jumlah : 0;

        if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);

        if (data && jumlah > 0) {
            items.push({
                id_kategori: data.id,
                nama: data.nama,
                satuan: data.satuan,
                harga_satuan: data.harga,
                jumlah,
                subtotal
            });
        }
    });
    return items;
}

function hitungTotal() {
    const items = ambilSemuaItem();
    const total = items.reduce((sum, it) => sum + it.subtotal, 0);
    const displayTotal = document.getElementById('displayTotal');
    if (displayTotal) displayTotal.innerText = formatRupiah(total);
    return { items, total };
}

/* ================== SIMPAN & CETAK ================== */

let transaksiTerakhir = null;

async function simpanDanCetak() {
    const nama = document.getElementById('nama').value.trim();
    const wa = document.getElementById('wa').value.trim();
    const catatan = document.getElementById('catatan').value.trim();
    const { items } = hitungTotal();

    if (!nama || !wa) {
        showToast("Mohon isi nama dan nomor WhatsApp customer.");
        return;
    }
    if (items.length === 0) {
        showToast("Mohon tambahkan minimal satu item cucian.");
        return;
    }

    try {
        const res = await fetch('/api/transaksi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, wa, catatan, items }),
        });

        if (!res.ok) {
            const err = await res.json();
            showToast(err.error || 'Gagal menyimpan transaksi.');
            return;
        }

        const transaksi = await res.json();
        transaksiTerakhir = transaksi;
        cetakStruk(transaksi);

        const afterPrint = document.getElementById('afterPrintActions');
        if (afterPrint) afterPrint.style.display = 'block';

        renderRiwayat();
        showToast("Transaksi tersimpan ke database.");

        // Reset form
        document.getElementById('nama').value = '';
        document.getElementById('wa').value = '';
        document.getElementById('catatan').value = '';
        document.getElementById('itemRows').innerHTML = '';
        tambahBaris();
    } catch (err) {
        console.error(err);
        showToast('Tidak bisa terhubung ke server.');
    }
}

function bangunHtmlStruk(t) {
    const baris = t.items.map(it => `
        <div class="struk-item-name">${it.nama}</div>
        <div class="struk-item-detail">
            <span>${it.jumlah} ${it.satuan} x ${formatRupiah(it.harga_satuan)}</span>
            <span>${formatRupiah(it.subtotal)}</span>
        </div>
    `).join('');

    return `
        <div class="struk-center struk-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/>
                <path d="M3 9a2.5 2.5 0 0 0 5 0M8 9a2.5 2.5 0 0 0 5 0M13 9a2.5 2.5 0 0 0 5 0"/>
            </svg>
        </div>
        <div class="struk-center struk-storename">${NAMA_TOKO}</div>
        <div class="struk-center struk-small">${ALAMAT_TOKO}</div>
        <div class="struk-center struk-small">Telp: ${formatTelpDisplay(NOMOR_WA_ADMIN)}</div>
        <div class="struk-line"></div>
        <div>${t.tanggal}</div>
        <div>Nama: ${t.nama}</div>
        <div>WA: ${t.wa}</div>
        <div class="struk-line"></div>
        ${baris}
        <div class="struk-line"></div>
        <div class="struk-total"><span>TOTAL</span><span>${formatRupiah(t.total)}</span></div>
        ${t.catatan ? `<div class="struk-line"></div><div>Catatan: ${t.catatan}</div>` : ''}
        <div class="struk-line"></div>
        <div class="struk-center">Terima kasih sudah laundry di sini!</div>
        <div class="struk-center struk-small">ID: ${t.id}</div>
    `;
}

function cetakStruk(t) {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;
    printArea.className = '';
    const ukuran = muatUkuranKertas();
    printArea.classList.add(ukuran === 'a5' ? 'paper-a5' : (ukuran === '58mm' ? 'paper-58' : 'paper-80'));
    printArea.innerHTML = bangunHtmlStruk(t);
    terapkanUkuranKertasPrint(ukuran);
    window.print();
}

function kirimWACustomer() {
    if (!transaksiTerakhir) return;
    const t = transaksiTerakhir;
    const rincian = t.items.map(it => `${it.nama} x${it.jumlah}${it.satuan}: ${formatRupiah(it.subtotal)}`).join('%0A');
    const pesan = `Halo ${t.nama}!%0A%0ATerima kasih sudah laundry di ${NAMA_TOKO}.%0A%0ARincian:%0A${rincian}%0A%0ATotal: ${formatRupiah(t.total)}%0A%0APakaian bisa diambil sesuai estimasi ya. Terima kasih!`;
    let nomor = t.wa.replace(/\D/g, '');
    if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1);
    window.open(`https://wa.me/${nomor}?text=${pesan}`, '_blank');
}

/* ================== RIWAYAT LAPORAN & HAPUS ================== */

async function renderRiwayat() {
    try {
        const tanggal = document.getElementById("filterTanggal")?.value || "";
        const periode = document.getElementById("filterPeriode")?.value || "harian";

        const res = await fetch(`/api/riwayat?tanggal=${tanggal}&filter=${periode}`);
        const data = await res.json();
        
        const body = document.getElementById('riwayatBody');
        const kosong = document.getElementById('riwayatKosong');
        const displayOmset = document.getElementById('displayOmset');

        const semua = Array.isArray(data) ? data : (data.transaksi || []);
        const totalOmset = data.total_omset !== undefined ? data.total_omset : semua.reduce((acc, curr) => acc + (curr.total_harga || 0), 0);

        if (displayOmset) {
            displayOmset.innerText = formatRupiah(totalOmset);
        }

        if (!body) return;

        if (semua.length === 0) {
            body.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:15px;">Tidak ada transaksi pada tanggal/periode ini.</td></tr>';
            if (kosong) kosong.style.display = 'block';
            return;
        }
        if (kosong) kosong.style.display = 'none';

        body.innerHTML = semua.map(t => `
            <tr>
                <td>${t.tanggal}</td>
                <td><strong>${t.nama_pelanggan}</strong></td>
                <td>${formatRupiah(t.total_harga)}</td>
                <td style="display:flex; gap:6px; justify-content:center;">
                    <button onclick="cetakUlang(${t.id})" style="padding:4px 8px; cursor:pointer;">Cetak</button>
                    <button onclick="hapusTransaksi(${t.id})" style="background:#dc3545; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Hapus</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Gagal memuat riwayat:', err);
    }
}

async function cetakUlang(id) {
    try {
        const res = await fetch(`/api/transaksi/${id}`);
        const t = await res.json();
        cetakStruk(t);
    } catch (err) {
        showToast('Gagal memuat data transaksi.');
    }
}

async function hapusTransaksi(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

    try {
        const res = await fetch(`/api/transaksi/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Transaksi berhasil dihapus.");
            renderRiwayat();
        } else {
            showToast("Gagal menghapus transaksi.");
        }
    } catch (err) {
        showToast("Error koneksi ke server.");
    }
}

/* ================== INIT ================== */

document.addEventListener('DOMContentLoaded', async () => {
    // Set default tanggal filter ke Hari Ini
    const today = new Date().toISOString().split('T')[0];
    const filterTglInput = document.getElementById("filterTanggal");
    if (filterTglInput && !filterTglInput.value) {
        filterTglInput.value = today;
    }

    await muatKategoriDariServer();
    renderPriceLists();
    isiInfoKontak();
    renderTestimonials();
    muatUkuranKertas();
    tambahBaris();
    showPage('home');
});