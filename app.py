"""
Zahra Laundry - Backend Flask
Sesuai rancangan Bab III (ERD & flowchart proposal):
  - Tabel Kategori_Cucian, Transaksi, Detail_Transaksi
  - Data kategori & transaksi disimpan di database (SQLite), bukan localStorage
  - Ditambahkan fitur: Laporan (Harian, Mingguan, Bulanan) & Hapus Transaksi
"""

import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from flask import Flask, g, jsonify, render_template, request

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "instance" / "zahra_laundry.db"

app = Flask(__name__)


# ---------------------------------------------------------------------------
# Koneksi & inisialisasi database
# ---------------------------------------------------------------------------

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    DB_PATH.parent.mkdir(exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS kategori_cucian (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipe TEXT NOT NULL,               -- 'kiloan' | 'satuan' | 'paket'
            nama_kategori TEXT NOT NULL,
            satuan TEXT NOT NULL,              -- kg / pcs / set / paket
            harga INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transaksi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tanggal TEXT NOT NULL,             -- Format: DD/MM/YYYY HH:MM
            nama_pelanggan TEXT NOT NULL,
            no_wa TEXT NOT NULL,
            catatan TEXT,
            total_harga INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS detail_transaksi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_transaksi INTEGER NOT NULL,
            id_kategori INTEGER NOT NULL,
            nama_kategori TEXT NOT NULL,       -- disalin saat transaksi, jaga histori jika harga kategori berubah
            satuan TEXT NOT NULL,
            harga_satuan INTEGER NOT NULL,
            jumlah REAL NOT NULL,
            subtotal INTEGER NOT NULL,
            FOREIGN KEY (id_transaksi) REFERENCES transaksi (id) ON DELETE CASCADE,
            FOREIGN KEY (id_kategori) REFERENCES kategori_cucian (id)
        );
        """
    )

    # Seed data kategori awal, HANYA jika tabel masih kosong
    count = db.execute("SELECT COUNT(*) FROM kategori_cucian").fetchone()[0]
    if count == 0:
        seed = [
            ("kiloan", "Cuci Setrika", "kg", 6000),
            ("kiloan", "Cuci Lipat", "kg", 5000),
            ("kiloan", "Setrika Saja", "kg", 4000),
            ("satuan", "Selimut (Single)", "pcs", 15000),
            ("satuan", "Selimut (Queen)", "pcs", 20000),
            ("satuan", "Selimut (King)", "pcs", 25000),
            ("satuan", "Bed Cover (Single)", "pcs", 20000),
            ("satuan", "Bed Cover (Queen)", "pcs", 25000),
            ("satuan", "Bed Cover (King)", "pcs", 30000),
            ("satuan", "Set Sprei (Single)", "set", 15000),
            ("satuan", "Set Sprei (Queen)", "set", 20000),
            ("satuan", "Set Sprei (King)", "set", 25000),
            ("paket", "Paket A (30kg)", "paket", 150000),
            ("paket", "Paket B (50kg)", "paket", 225000),
            ("paket", "Paket C (100kg)", "paket", 400000),
        ]
        db.executemany(
            "INSERT INTO kategori_cucian (tipe, nama_kategori, satuan, harga) VALUES (?, ?, ?, ?)",
            seed,
        )
        db.commit()
    db.close()


# ---------------------------------------------------------------------------
# Halaman utama
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------------------------
# API: Kategori & Harga
# ---------------------------------------------------------------------------

@app.route("/api/kategori")
def api_kategori():
    db = get_db()
    rows = db.execute(
        "SELECT id, tipe, nama_kategori, satuan, harga FROM kategori_cucian ORDER BY tipe, id"
    ).fetchall()

    hasil = {"kiloan": [], "satuan": [], "paket": []}
    for r in rows:
        hasil[r["tipe"]].append(
            {
                "id": r["id"],
                "nama": r["nama_kategori"],
                "satuan": r["satuan"],
                "harga": r["harga"],
            }
        )
    return jsonify(hasil)


@app.route("/api/kategori", methods=["POST"])
def tambah_kategori():
    data = request.get_json(force=True)
    tipe = data.get("tipe")
    nama = data.get("nama", "").strip()
    satuan = data.get("satuan", "").strip()
    harga = data.get("harga")

    if tipe not in ("kiloan", "satuan", "paket") or not nama or not satuan or not harga:
        return jsonify({"error": "Data kategori tidak lengkap"}), 400

    db = get_db()
    cur = db.execute(
        "INSERT INTO kategori_cucian (tipe, nama_kategori, satuan, harga) VALUES (?, ?, ?, ?)",
        (tipe, nama, satuan, int(harga)),
    )
    db.commit()
    return jsonify({"id": cur.lastrowid}), 201


@app.route("/api/kategori/<int:kategori_id>", methods=["DELETE"])
def hapus_kategori(kategori_id):
    db = get_db()
    db.execute("DELETE FROM kategori_cucian WHERE id = ?", (kategori_id,))
    db.commit()
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# API: Transaksi
# ---------------------------------------------------------------------------

@app.route("/api/transaksi", methods=["POST"])
def buat_transaksi():
    data = request.get_json(force=True)
    nama = data.get("nama", "").strip()
    wa = data.get("wa", "").strip()
    catatan = data.get("catatan", "").strip()
    items = data.get("items", [])

    if not nama or not wa:
        return jsonify({"error": "Nama dan nomor WhatsApp wajib diisi"}), 400
    if not items:
        return jsonify({"error": "Minimal satu item cucian"}), 400

    total = sum(int(it["subtotal"]) for it in items)
    tanggal = datetime.now().strftime("%d/%m/%Y %H:%M")

    db = get_db()
    cur = db.execute(
        "INSERT INTO transaksi (tanggal, nama_pelanggan, no_wa, catatan, total_harga) VALUES (?, ?, ?, ?, ?)",
        (tanggal, nama, wa, catatan, total),
    )
    transaksi_id = cur.lastrowid

    for it in items:
        db.execute(
            """INSERT INTO detail_transaksi
               (id_transaksi, id_kategori, nama_kategori, satuan, harga_satuan, jumlah, subtotal)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                transaksi_id,
                it["id_kategori"],
                it["nama"],
                it["satuan"],
                int(it["harga_satuan"]),
                float(it["jumlah"]),
                int(it["subtotal"]),
            ),
        )
    db.commit()

    transaksi = ambil_transaksi_lengkap(transaksi_id)
    return jsonify(transaksi), 201


@app.route("/api/riwayat")
def api_riwayat():
    """Mengambil riwayat transaksi berdasarkan filter tanggal & periode yang dipilih."""
    filter_type = request.args.get("filter", "semua")
    tgl_param = request.args.get("tanggal", "")  # Format YYYY-MM-DD dari HTML

    db = get_db()
    rows = db.execute(
        "SELECT id, tanggal, nama_pelanggan, total_harga FROM transaksi ORDER BY id DESC"
    ).fetchall()

    hasil = []
    total_omset = 0

    # Parse tanggal filter dari frontend jika ada
    target_date = None
    if tgl_param:
        try:
            target_date = datetime.strptime(tgl_param, "%Y-%m-%d").date()
        except ValueError:
            target_date = None

    for r in rows:
        t_dict = dict(r)

        # Parse tanggal transaksi dari database (Format: DD/MM/YYYY HH:MM)
        try:
            tgl_transaksi = datetime.strptime(r["tanggal"], "%d/%m/%Y %H:%M").date()
        except ValueError:
            continue

        # Evaluasi Filter
        pass_filter = True

        if target_date and filter_type != "semua":
            if filter_type == "harian":
                # Harus tepat di tanggal yang sama persis
                if tgl_transaksi != target_date:
                    pass_filter = False

            elif filter_type == "mingguan":
                # Rentang 7 hari ke belakang dari tanggal yang dipilih
                batas_awal = target_date - timedelta(days=6)
                if not (batas_awal <= tgl_transaksi <= target_date):
                    pass_filter = False

            elif filter_type == "bulanan":
                # Bulan dan tahun harus sama persis
                if tgl_transaksi.year != target_date.year or tgl_transaksi.month != target_date.month:
                    pass_filter = False

        if pass_filter:
            hasil.append(t_dict)
            total_omset += r["total_harga"]

    return jsonify({"transaksi": hasil, "total_omset": total_omset})


@app.route("/api/transaksi/<int:transaksi_id>")
def api_transaksi_detail(transaksi_id):
    transaksi = ambil_transaksi_lengkap(transaksi_id)
    if transaksi is None:
        return jsonify({"error": "Transaksi tidak ditemukan"}), 404
    return jsonify(transaksi)


@app.route("/api/transaksi/<int:transaksi_id>", methods=["DELETE"])
def hapus_transaksi(transaksi_id):
    """Menghapus transaksi jika ada kesalahan input di kasir."""
    db = get_db()
    db.execute("DELETE FROM transaksi WHERE id = ?", (transaksi_id,))
    db.commit()
    return jsonify({"ok": True, "message": "Transaksi berhasil dihapus"})


def ambil_transaksi_lengkap(transaksi_id):
    db = get_db()
    t = db.execute("SELECT * FROM transaksi WHERE id = ?", (transaksi_id,)).fetchone()
    if t is None:
        return None
    items = db.execute(
        "SELECT nama_kategori AS nama, satuan, harga_satuan, jumlah, subtotal "
        "FROM detail_transaksi WHERE id_transaksi = ?",
        (transaksi_id,),
    ).fetchall()
    return {
        "id": t["id"],
        "tanggal": t["tanggal"],
        "nama": t["nama_pelanggan"],
        "wa": t["no_wa"],
        "catatan": t["catatan"],
        "total": t["total_harga"],
        "items": [dict(i) for i in items],
    }


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)