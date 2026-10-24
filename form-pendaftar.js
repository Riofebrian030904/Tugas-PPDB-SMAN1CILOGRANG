/* ==========================================================
   PPDB ONLINE — FORM PENDAFTAR
   Tambah & edit data dengan validasi form
   ========================================================== */

const form = document.getElementById("pendaftarForm");
const editId = new URLSearchParams(location.search).get("edit");

let students = DB.getPendaftar();
const editing = editId ? students.find((p) => p.id === editId) : null;

/* ---------- Isi select jurusan ---------- */
const selectJurusan = document.getElementById("jurusan");
DB.getJurusan().forEach((j) => {
  const option = document.createElement("option");
  option.value = j.nama;
  option.textContent = `${j.nama} (kuota ${j.kuota})`;
  selectJurusan.appendChild(option);
});

/* ---------- Mode edit ---------- */
if (editing) {
  document.getElementById("formTitle").textContent = "Edit Pendaftar";
  document.getElementById("formSubtitle").textContent = `Mengubah data ${editing.nama}.`;
  document.getElementById("submitLabel").textContent = "Simpan Perubahan";

  document.getElementById("nama").value = editing.nama;
  document.getElementById("nisn").value = editing.nisn;
  document.getElementById("jeniskelamin").value = editing.jenisKelamin;
  document.getElementById("asal_sekolah").value = editing.asalSekolah;
  document.getElementById("jurusan").value = editing.jurusan;
  document.getElementById("status").value = editing.status;
}

/* ---------- Validasi ---------- */
const rules = {
  nama: (v) => v.trim().length >= 3,
  nisn: (v) => /^\d{10}$/.test(v.trim()),
  jeniskelamin: (v) => v !== "",
  asal_sekolah: (v) => v.trim().length >= 3,
  jurusan: (v) => v !== "",
};

function validateField(name) {
  const input = document.getElementById(name);
  const field = document.getElementById(`field-${name.replace("_", "")}`) || input.closest(".field");
  const valid = rules[name](input.value);
  field.classList.toggle("invalid", !valid);
  return valid;
}

/* Validasi realtime setelah kesalahan pertama */
Object.keys(rules).forEach((name) => {
  const input = document.getElementById(name);
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("invalid")) validateField(name);
  });
  input.addEventListener("change", () => validateField(name));
});

/* ---------- Simpan ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const valid = Object.keys(rules).map(validateField).every(Boolean);
  if (!valid) {
    App.toast("Periksa kembali isian form yang belum benar.", "error");
    return;
  }

  const data = {
    id: editing ? editing.id : DB.nextId(students, "PD"),
    nama: document.getElementById("nama").value.trim(),
    nisn: document.getElementById("nisn").value.trim(),
    jenisKelamin: document.getElementById("jeniskelamin").value,
    asalSekolah: document.getElementById("asal_sekolah").value.trim(),
    jurusan: document.getElementById("jurusan").value,
    status: document.getElementById("status").value,
    tanggal: editing ? editing.tanggal : new Date().toISOString().slice(0, 10),
    waktu: editing
      ? editing.waktu || ""
      : new Date().toTimeString().slice(0, 5),
    berkas: editing
      ? editing.berkas
      : { kk: false, akta: false, ijazah: false, foto: false },
  };

  if (editing) {
    students = students.map((p) => (p.id === editing.id ? data : p));
  } else {
    students.unshift(data);
  }

  DB.savePendaftar(students);
  window.location.href = "pendaftar.html?saved=1";
});
