/* ==========================================================
   PPDB ONLINE — PENGATURAN
   Informasi sekolah & admin (localStorage)
   ========================================================== */

const settingsForm = document.getElementById("settingsForm");
const settings = DB.getSettings();

/* ---------- Muat data saat ini ---------- */
document.getElementById("namaSekolah").value = settings.namaSekolah;
document.getElementById("tahunAjaran").value = settings.tahunAjaran;
document.getElementById("alamat").value = settings.alamat;
document.getElementById("namaAdmin").value = settings.namaAdmin;
document.getElementById("emailAdmin").value = settings.emailAdmin;

/* ---------- Simpan ---------- */
settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const namaSekolah = document.getElementById("namaSekolah").value.trim();
  const tahunAjaran = document.getElementById("tahunAjaran").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const namaAdmin = document.getElementById("namaAdmin").value.trim();
  const emailAdmin = document.getElementById("emailAdmin").value.trim();
  const fieldSekolah = document.getElementById("field-namaSekolah");
  const fieldTahun = document.getElementById("field-tahunAjaran");
  const fieldAdmin = document.getElementById("field-namaAdmin");
  const fieldEmail = document.getElementById("field-emailAdmin");

  const validSekolah = namaSekolah.length > 0;
  const validTahun = tahunAjaran.length > 0;
  const validAdmin = namaAdmin.length > 0;
  const validEmail = emailAdmin === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAdmin);

  fieldSekolah.classList.toggle("invalid", !validSekolah);
  fieldTahun.classList.toggle("invalid", !validTahun);
  fieldAdmin.classList.toggle("invalid", !validAdmin);
  fieldEmail.classList.toggle("invalid", !validEmail);

  if (!validSekolah || !validTahun || !validAdmin || !validEmail) {
    App.toast("Periksa kembali isian pengaturan.", "error");
    return;
  }

  // Pertahankan foto profil yang sudah tersimpan (di luar field form)
  DB.saveSettings({ ...DB.getSettings(), namaSekolah, tahunAjaran, alamat, namaAdmin, emailAdmin });
  App.applySettings();
  App.toast("Pengaturan berhasil disimpan.");
});

/* ---------- Foto Profil ---------- */
const photoInput = document.getElementById("photoInput");
const removePhotoBtn = document.getElementById("removePhotoBtn");

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PREVIEW_SIZE = 320; // sisi terpanjang hasil kompresi

function syncPhotoButtons() {
  removePhotoBtn.disabled = !DB.getSettings().fotoProfil;
}
syncPhotoButtons();

/** Kompres & ubah foto menjadi data URL JPEG agar hemat penyimpanan browser. */
function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, PREVIEW_SIZE / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; // latar putih untuk PNG transparan
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      dataUrl.length > 100 ? resolve(dataUrl) : reject(new Error("Hasil konversi kosong"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak dapat dibaca"));
    };
    img.src = url;
  });
}

function savePhoto(dataUrl) {
  const saved = DB.saveSettings({ ...DB.getSettings(), fotoProfil: dataUrl });
  if (saved) App.applySettings();
  syncPhotoButtons();
  return saved;
}

document.getElementById("pickPhotoBtn").addEventListener("click", () => photoInput.click());

photoInput.addEventListener("change", async () => {
  const file = photoInput.files && photoInput.files[0];
  photoInput.value = ""; // reset agar file yang sama bisa dipilih lagi

  if (!file) return;
  if (!ALLOWED_TYPES.includes(file.type)) {
    App.toast("Format foto harus JPG, PNG, atau WEBP.", "error");
    return;
  }
  if (file.size > MAX_PHOTO_BYTES) {
    App.toast("Ukuran foto maksimal 2 MB.", "error");
    return;
  }

  try {
    const dataUrl = await compressPhoto(file);
    if (!savePhoto(dataUrl)) {
      App.toast("Gagal menyimpan: penyimpanan browser penuh.", "error");
      return;
    }
    App.toast("Foto profil berhasil diperbarui.");
  } catch (error) {
    App.toast("Foto tidak dapat diproses. Coba gambar lain.", "error");
  }
});

removePhotoBtn.addEventListener("click", async () => {
  if (!DB.getSettings().fotoProfil) return;
  const ok = await App.confirmDialog(
    "Hapus foto profil dan kembali menampilkan inisial nama?",
    { title: "Hapus Foto Profil", okText: "Ya, Hapus", danger: true }
  );
  if (!ok) return;
  if (savePhoto("")) App.toast("Foto profil dihapus.");
  else App.toast("Gagal menyimpan perubahan.", "error");
});
