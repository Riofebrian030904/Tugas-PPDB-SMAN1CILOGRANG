# PPDB ONLINE — ADMIN PANEL (BACK-OFFICE)
# SMAN 1 CILOGRANG

Admin panel back-office untuk Sistem Penerimaan Peserta Didik Baru (PPDB) Online.
**Seluruh halaman** (dashboard, pendaftar, jurusan, verifikasi, laporan, pengaturan,
form, dan login) dirancang ulang mengikuti desain referensi Figma: modern, bersih,
profesional, responsive, dengan sidebar navy, header putih, dan kartu putih.

Aplikasi berjalan **murni di browser** dengan **HTML5, CSS3, JavaScript, Chart.js, dan
localStorage** — **tanpa database, tanpa backend, tanpa framework**.

## Fitur

- **UI konsisten di semua halaman** — sidebar navy (menu aktif biru, info sekolah &
  *tagline*), top header putih (search bar + `Ctrl + K`, lonceng notifikasi dengan badge,
  avatar & dropdown profil), kartu putih, tombol, tabel, form, modal, dan toast seragam
- **Dashboard**
  - Hero banner: "Selamat Datang", nama admin, tahun ajaran, status sistem
  - **Animasi hanya di latar hero** (gradien bergeser, logo bernapas, orb melayang,
    parallax kursor) — konten dashboard lain **statis**: angka tampil langsung,
    tanpa count-up, tanpa kartu terangkat, modal/toast tampil tanpa geser
  - 4 kartu statistik (Total, Verifikasi, Menunggu, Diterima) dengan persentase tren
  - Panel **Grafik Pendaftaran** (Chart.js, garis, rentang 7/14/30 hari)
  - Panel **Pendaftar Terbaru** (tabel 5 baris + tombol *Lihat Semua*)
  - 4 kartu **Akses Cepat** menuju fitur lain
- **Calon Peserta Didik** — lihat, cari, filter, tambah, edit, hapus, dan detail data
- **Verifikasi Berkas** — status kelengkapan KK, akta, ijazah, dan pas foto
- **Jurusan** — kelola nama jurusan dan kuota
- **Laporan** — rekap pendaftar per jurusan + detail pendaftar + cetak laporan
- **Pengaturan** — ubah informasi sekolah dan admin
- **Login & Logout** — sesi demo disimpan di localStorage
- Search, filter, modal, validasi form, toast notification, sidebar collapse/drawer, responsive

## Teknologi

- HTML5 · CSS3 · JavaScript Vanilla (ES6)
- Chart.js 4 (CDN)
- Font Awesome 6 (seluruh ikon, konsisten di semua halaman)
- Google Fonts — Inter (utama) & Poppins (fallback)
- localStorage + seed data (245 pendaftar) — **tanpa database**

## Struktur

```text
PPDB-ONLINE-ADMIN-SMAN-1-CILOGRANG/
├── login.html
├── index.html            ← dashboard (hero animasi, statistik, grafik)
├── pendaftar.html
├── form-pendaftar.html
├── jurusan.html
├── verifikasi.html
├── laporan.html
├── pengaturan.html
├── css/
│   ├── app.css            ← design system bersama (SEMUA halaman)
│   ├── dashboard.css      ← komponen khusus dashboard (hero, grafik, akses cepat)
│   └── style.css          ← gaya lama (legacy, tidak dipakai lagi)
├── js/
│   ├── data.js           ← data layer (localStorage / seed)
│   ├── app.js            ← shared: shell, dropdown, notifikasi, search, modal, toast, guard
│   ├── login.js
│   ├── dashboard.js      ← statistik, grafik, pendaftar terbaru, efek hero
│   ├── pendaftar.js
│   ├── form-pendaftar.js
│   ├── jurusan.js
│   ├── verifikasi.js
│   ├── laporan.js
│   └── pengaturan.js
├── assets/img/
│   ├── images.jpg
│   └── logosma.jpg
├── PERANCANGAN.md
└── README.md
```

## Menjalankan

### Cara 1 — VS Code + Live Server (direkomendasikan)

1. Buka folder proyek di VS Code.
2. Install extension **Live Server**.
3. Klik kanan `index.html`.
4. Pilih **Open with Live Server**.

### Cara 2 — Browser

Klik dua kali `index.html` pada browser.

### Login Demo

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

## Data (mode front-end)

Data disimpan di `localStorage` browser:

| Kunci | Isi |
|---|---|
| `ppdb_session` | Status login |
| `ppdb_pendaftar` | Data pendaftar (seed v2 — 245 siswa) |
| `ppdb_jurusan` | Data jurusan dan kuota |
| `ppdb_settings` | Informasi sekolah & admin |
| `ppdb_seed_version` | Versi seed (migrasi otomatis 1 → 2) |
| `ppdb_sidebar_collapsed` | Preferensi sidebar ringkas |

Semua angka di dashboard (**total, terverifikasi, menunggu, diterima, grafik, notifikasi,
tabel terbaru**) **dihitung dari data**, bukan hardcode — jadi otomatis berubah ketika
data pendaftar bertambah.

Untuk mengembalikan data ke kondisi awal, jalankan di console browser:

```javascript
localStorage.clear();
```

Lalu muat ulang halaman.

## Database

**Tidak diperlukan.** Seluruh data (pendaftar, jurusan, pengaturan, sesi login)
disimpan di `localStorage` browser, jadi aplikasi langsung jalan tanpa server,
tanpa MySQL, dan tanpa PHP.

## Responsive

Berlaku untuk **semua halaman**:

| Breakpoint | Perilaku |
|---|---|
| Desktop (> 1320px) | Sidebar 280px, statistik 4 kolom, grafik + tabel 2 kolom |
| 1180px | Statistik & akses cepat 2 kolom |
| 1100px | Panel grafik & tabel menumpuk (1 kolom) |
| 993–1180px | Sidebar bisa dilipat menjadi rail ikon (88px) lewat tombol menu |
| ≤ 992px | Sidebar menjadi drawer + overlay |
| ≤ 760px | Statistik/akses cepat 1 kolom, search bar pindah baris baru, dropdown menempel di bawah header, tabel scroll horizontal |
| Print | Sidebar, header, toolbar, tombol, dan toast disembunyikan; kop laporan (`.print-head`) tampil |

## Catatan

Panel ini dipakai untuk kebutuhan tugas Client-Side Programming. Login bersifat demo
lokal dan data hanya tersimpan di browser (`localStorage`). Untuk penggunaan PPDB
sebenarnya, tambahkan backend sendiri beserta autentikasi, otorisasi, validasi
server-side, serta perlindungan data pribadi.
