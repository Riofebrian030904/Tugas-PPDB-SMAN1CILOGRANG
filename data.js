/* ==========================================================
   PPDB ONLINE — DATA LAYER
   localStorage + mock data (tanpa backend / database server)
   ========================================================== */

const DB = (() => {
  const KEYS = {
    pendaftar: "ppdb_pendaftar",
    jurusan: "ppdb_jurusan",
    settings: "ppdb_settings",
    session: "ppdb_session",
    seedVersion: "ppdb_seed_version",
  };

  /* ---------- Mock Data: Jurusan ---------- */
  const jurusanDefault = [
    { id: "JR-001", nama: "IPA", kuota: 40 },
    { id: "JR-002", nama: "IPS", kuota: 40 },
    { id: "JR-003", nama: "Bahasa", kuota: 20 },
  ];

  /* ---------- Mock Data: Pendaftar (seed v2 — 245 data realistis) ----------
     Dibangkitkan secara deterministik (PRNG bersema) sehingga jumlah,
     statistik, dan grafik selalu konsisten di setiap perangkat.
     Struktur objek sederhana — semua data disimpan di localStorage, tanpa database. */
  const SEED_VERSION = 2;

  const NAMA_LAKI = [
    "Ahmad", "Budi", "Fajar", "Rizky", "Dimas", "Yusuf", "Bagas", "Agus",
    "Andi", "Dedi", "Galih", "Joko", "Lutfi", "Okta", "Rangga", "Hendra",
    "Irfan", "Bayu", "Teguh", "Wahyu",
  ];

  const NAMA_PEREMPUAN = [
    "Siti", "Rina", "Dewi", "Nabila", "Fitri", "Aulia", "Ayu", "Putri",
    "Indah", "Kartika", "Maya", "Nanda", "Hana", "Eka", "Sri", "Ratna",
    "Lestari", "Wulandari", "Salma", "Zahra",
  ];

  const NAMA_BELAKANG = [
    "Fauzi", "Nurhaliza", "Santoso", "Agustina", "Maulana", "Lestari",
    "Pratama", "Saputra", "Rahma", "Ramadhan", "Handayani", "Wijaya",
    "Kurniawan", "Setiawan", "Hidayat", "Nugroho", "Susanto", "Firmansyah",
    "Permana", "Rahayu", "Saputri", "Halim", "Maulida", "Sanjaya",
    "Ardiansyah", "Ningsih", "Pamungkas", "Gunawan", "Syahputra", "Hafidz",
  ];

  const ASAL_SEKOLAH = [
    "SMPN 1 Cilograng", "SMPN 2 Cilograng", "SMPN 3 Cilograng",
    "SMPN 1 Bayah", "SMPN 2 Bayah", "SMPN 1 Malingping",
    "MTs Al-Hikmah", "MTs Nurul Falah", "SMPIT Al-Hikmah", "SMPN 4 Cilograng",
  ];

  /** PRNG deterministik (mulberry32): hasil sama di semua perangkat. */
  function mulberry32(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** 5 pendaftar terbaru — tampil pada panel "Pendaftar Terbaru" dashboard. */
  const pendaftarUnggulan = [
    {
      id: "PD-001", nama: "Ahmad Fauzi", nisn: "0065427812",
      jenisKelamin: "Laki-laki", asalSekolah: "SMPN 1 Cilograng",
      jurusan: "IPA", status: "Diterima", tanggal: "2026-06-16", waktu: "18:30",
      berkas: { kk: true, akta: true, ijazah: true, foto: true },
    },
    {
      id: "PD-002", nama: "Siti Nurhaliza", nisn: "0065427813",
      jenisKelamin: "Perempuan", asalSekolah: "MTs Al-Hikmah",
      jurusan: "IPS", status: "Terverifikasi", tanggal: "2026-06-16", waktu: "18:10",
      berkas: { kk: true, akta: true, ijazah: true, foto: true },
    },
    {
      id: "PD-003", nama: "Budi Santoso", nisn: "0065427814",
      jenisKelamin: "Laki-laki", asalSekolah: "SMPN 2 Cilograng",
      jurusan: "Bahasa", status: "Menunggu", tanggal: "2026-06-16", waktu: "17:55",
      berkas: { kk: true, akta: true, ijazah: false, foto: false },
    },
    {
      id: "PD-004", nama: "Rina Agustina", nisn: "0065427815",
      jenisKelamin: "Perempuan", asalSekolah: "SMPN 1 Bayah",
      jurusan: "IPA", status: "Terverifikasi", tanggal: "2026-06-16", waktu: "17:40",
      berkas: { kk: true, akta: true, ijazah: true, foto: true },
    },
    {
      id: "PD-005", nama: "Fajar Maulana", nisn: "0065427816",
      jenisKelamin: "Laki-laki", asalSekolah: "SMPN 1 Cilograng",
      jurusan: "IPS", status: "Diterima", tanggal: "2026-06-16", waktu: "17:20",
      berkas: { kk: true, akta: true, ijazah: true, foto: true },
    },
  ];

  function berkasStatus(status, rand) {
    if (status === "Diterima" || status === "Terverifikasi") {
      return { kk: true, akta: true, ijazah: true, foto: true };
    }
    if (status === "Menunggu") {
      return { kk: true, akta: rand() > 0.35, ijazah: rand() > 0.6, foto: rand() > 0.3 };
    }
    return { kk: rand() > 0.3, akta: rand() > 0.5, ijazah: false, foto: rand() > 0.4 };
  }

  function bangkitkanPendaftar() {
    const rand = mulberry32(20260616);

    /* Sebaran pendaftaran per tanggal (240 data generatif + 5 unggulan = 245)
       → grafik "7 hari terakhir": 12, 32, 23, 28, 44, 41, 55 */
    const sebaran = [
      ["2026-06-16", 50], ["2026-06-15", 41], ["2026-06-14", 44],
      ["2026-06-13", 28], ["2026-06-12", 23], ["2026-06-11", 32],
      ["2026-06-10", 12], ["2026-06-09", 3], ["2026-06-08", 2],
      ["2026-06-07", 2], ["2026-06-06", 1], ["2026-06-04", 1], ["2026-06-02", 1],
    ];

    /* Kompensasi status 5 pendaftar unggulan sehingga total menjadi
       183 Terverifikasi + 32 Menunggu + 15 Diterima + 15 Ditolak = 245 */
    const poolStatus = [
      ...Array(13).fill("Diterima"),
      ...Array(15).fill("Ditolak"),
      ...Array(31).fill("Menunggu"),
      ...Array(181).fill("Terverifikasi"),
    ];
    for (let i = poolStatus.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [poolStatus[i], poolStatus[j]] = [poolStatus[j], poolStatus[i]];
    }

    const list = pendaftarUnggulan.map((p) => ({ ...p, berkas: { ...p.berkas } }));
    let urut = 0;   // pemilih nama
    let nomor = 6;  // penomoran ID (PD-006 dst.)
    let idxStatus = 0;

    sebaran.forEach(([tanggal, jumlah]) => {
      for (let i = 0; i < jumlah; i++) {
        const status = poolStatus[idxStatus++] || "Menunggu";
        const pool = urut % 2 === 0 ? NAMA_LAKI : NAMA_PEREMPUAN;
        const nama = `${pool[Math.floor(urut / 2) % pool.length]} ${NAMA_BELAKANG[(urut * 7) % NAMA_BELAKANG.length]}`;
        const jam = String(8 + Math.floor(rand() * 8)).padStart(2, "0");
        const menit = String(Math.floor(rand() * 60)).padStart(2, "0");

        list.push({
          id: `PD-${String(nomor).padStart(3, "0")}`,
          nama,
          nisn: String(65427817 + urut).padStart(10, "0"),
          jenisKelamin: urut % 2 === 0 ? "Laki-laki" : "Perempuan",
          asalSekolah: ASAL_SEKOLAH[urut % ASAL_SEKOLAH.length],
          jurusan: rand() < 0.52 ? "IPA" : rand() < 0.78 ? "IPS" : "Bahasa",
          status,
          tanggal,
          waktu: `${jam}:${menit}`,
          berkas: berkasStatus(status, rand),
        });

        urut++;
        nomor++;
      }
    });

    return list;
  }

  const pendaftarDefault = bangkitkanPendaftar();

  /* ---------- Mock Data: Pengaturan ---------- */
  const settingsDefault = {
    namaSekolah: "SMAN 1 CILOGRANG",
    tahunAjaran: "2026/2027",
    alamat: "Jl. Raya Cilograng, Lebak, Banten",
    namaAdmin: "Admin Sekolah",
    emailAdmin: "admin@sman1cilograng.sch.id",
    fotoProfil: "", // data URL hasil unggahan (kosong = tampilkan inisial)
  };

  /* ---------- Util ---------- */
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return clone(fallback);
      }
      const parsed = JSON.parse(raw);
      return parsed ?? clone(fallback);
    } catch (error) {
      console.warn("Gagal membaca localStorage:", error);
      return clone(fallback);
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Gagal menulis localStorage:", error);
      return false;
    }
  }

  /* ---------- Migrasi Seed (v1 → v2) ----------
     Data bawaan lama (10 record statis) otomatis diganti seed terbaru.
     Data hasil tambal/edit pengguna TIDAK akan disentuh. */
  function migrateSeed() {
    try {
      if (localStorage.getItem(KEYS.seedVersion) === String(SEED_VERSION)) return;

      const raw = localStorage.getItem(KEYS.pendaftar);
      if (raw !== null) {
        const stored = JSON.parse(raw);
        const isSeedLama =
          Array.isArray(stored) &&
          stored.length === 10 &&
          stored.every((item, index) => item.id === `PD-00${index + 1}`);

        if (isSeedLama) {
          localStorage.setItem(KEYS.pendaftar, JSON.stringify(pendaftarDefault));
        }
      }

      localStorage.setItem(KEYS.seedVersion, String(SEED_VERSION));
    } catch (error) {
      console.warn("Gagal migrasi seed:", error);
    }
  }

  migrateSeed();

  /* ---------- Public API ---------- */
  return {
    KEYS,

    getPendaftar: () => read(KEYS.pendaftar, pendaftarDefault),
    savePendaftar: (list) => write(KEYS.pendaftar, list),

    getJurusan: () => read(KEYS.jurusan, jurusanDefault),
    saveJurusan: (list) => write(KEYS.jurusan, list),

    getSettings() {
      const settings = read(KEYS.settings, settingsDefault);
      // Normalisasi nama sekolah versi lama (bawaan sebelumnya)
      if (settings.namaSekolah === "SMAN 1 Cilograng") {
        settings.namaSekolah = "SMAN 1 CILOGRANG";
        write(KEYS.settings, settings);
      }
      // Normalisasi nama admin versi lama (bawaan sebelumnya)
      if (settings.namaAdmin === "Administrator") {
        settings.namaAdmin = settingsDefault.namaAdmin;
        write(KEYS.settings, settings);
      }
      return settings;
    },
    saveSettings: (value) => write(KEYS.settings, value),

    isLoggedIn: () => localStorage.getItem(KEYS.session) === "1",
    login: () => localStorage.setItem(KEYS.session, "1"),
    logout: () => localStorage.removeItem(KEYS.session),

    /** ID unik berikutnya, contoh: nextId(list, "PD") -> "PD-011" */
    nextId(list, prefix) {
      const numbers = list
        .map((item) => parseInt(String(item.id).replace(/\D/g, ""), 10))
        .filter((n) => !isNaN(n));
      const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
      return `${prefix}-${String(next).padStart(3, "0")}`;
    },
  };
})();
