/* ==========================================================
   PPDB ONLINE — DATA JURUSAN
   CRUD nama jurusan dan kuota
   ========================================================== */

const grid = document.getElementById("jurusanGrid");
const modal = document.getElementById("jurusanModal");
const form = document.getElementById("jurusanForm");

let majors = DB.getJurusan();
let students = DB.getPendaftar();
let editId = null;

/* ---------- Render kartu ---------- */
function render() {
  if (!majors.length) {
    grid.innerHTML = `
      <div class="card" style="grid-column:1/-1">
        <div class="empty">
          <div class="empty-icon"><i class="fa-solid fa-school"></i></div>
          <h3>Belum ada jurusan</h3>
          <p>Klik tombol "Tambah Jurusan" untuk menambahkan jurusan pertama.</p>
        </div>
      </div>`;
    return;
  }

  grid.innerHTML = majors.map((j) => {
    const terdaftar = students.filter((p) => p.jurusan === j.nama).length;
    const persen = j.kuota > 0 ? Math.min(100, Math.round((terdaftar / j.kuota) * 100)) : 0;
    const sisa = Math.max(0, j.kuota - terdaftar);

    return `
      <div class="card jurusan-card">
        <div class="jurusan-top">
          <div class="jurusan-icon"><i class="fa-solid fa-school"></i></div>
          <div class="row-actions">
            <button class="icon-btn sm" data-action="edit" data-id="${j.id}" title="Edit jurusan"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="icon-btn sm danger" data-action="delete" data-id="${j.id}" title="Hapus jurusan"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
        <h3>${App.esc(j.nama)}</h3>
        <p>${terdaftar} pendaftar dari kuota ${j.kuota}</p>
        <div class="progress"><span style="width:${persen}%"></span></div>
        <div class="progress-meta">
          <span>${persen}% kuota terpakai</span>
          <span>Sisa ${sisa}</span>
        </div>
      </div>`;
  }).join("");
}

/* ---------- Modal ---------- */
function openForm(id = null) {
  editId = id;
  const major = id ? majors.find((j) => j.id === id) : null;

  document.getElementById("jurusanModalTitle").textContent = major ? "Edit Jurusan" : "Tambah Jurusan";
  document.getElementById("namaJurusan").value = major ? major.nama : "";
  document.getElementById("kuota").value = major ? major.kuota : "";
  form.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));
  document.querySelector("#field-namaJurusan .field-error").textContent = "Nama jurusan minimal 2 karakter.";

  App.openModal("jurusanModal");
  setTimeout(() => document.getElementById("namaJurusan").focus(), 120);
}

document.getElementById("addJurusan").addEventListener("click", () => openForm());

grid.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const major = majors.find((j) => j.id === btn.dataset.id);
  if (!major) return;

  if (btn.dataset.action === "edit") openForm(major.id);

  if (btn.dataset.action === "delete") {
    const terdaftar = students.filter((p) => p.jurusan === major.nama).length;
    const pesan = terdaftar > 0
      ? `Jurusan "${major.nama}" dipakai ${terdaftar} pendaftar. Jurusan akan dihapus dari daftar. Lanjutkan?`
      : `Jurusan "${major.nama}" akan dihapus. Lanjutkan?`;

    const ok = await App.confirmDialog(pesan, {
      title: "Hapus Jurusan", okText: "Ya, Hapus", danger: true,
    });
    if (!ok) return;

    majors = majors.filter((j) => j.id !== major.id);
    DB.saveJurusan(majors);
    render();
    App.toast("Jurusan berhasil dihapus.");
  }
});

/* ---------- Simpan ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputNama = document.getElementById("namaJurusan");
  const inputKuota = document.getElementById("kuota");
  const fieldNama = document.getElementById("field-namaJurusan");
  const fieldKuota = document.getElementById("field-kuota");

  const nama = inputNama.value.trim();
  const kuota = parseInt(inputKuota.value, 10);
  const namaValid = nama.length >= 2;
  const kuotaValid = !isNaN(kuota) && kuota > 0;

  fieldNama.classList.toggle("invalid", !namaValid);
  fieldKuota.classList.toggle("invalid", !kuotaValid);

  if (!namaValid || !kuotaValid) {
    App.toast("Periksa kembali isian form jurusan.", "error");
    return;
  }

  const duplikat = majors.some((j) => j.nama.toLowerCase() === nama.toLowerCase() && j.id !== editId);
  if (duplikat) {
    fieldNama.classList.add("invalid");
    fieldNama.querySelector(".field-error").textContent = "Nama jurusan sudah digunakan.";
    App.toast("Nama jurusan sudah ada.", "error");
    return;
  }
  fieldNama.querySelector(".field-error").textContent = "Nama jurusan minimal 2 karakter.";

  if (editId) {
    const before = majors.find((j) => j.id === editId);
    majors = majors.map((j) => (j.id === editId ? { ...j, nama, kuota } : j));

    // Sinkronkan nama jurusan lama pada data pendaftar
    if (before && before.nama !== nama) {
      students = students.map((p) => (p.jurusan === before.nama ? { ...p, jurusan: nama } : p));
      DB.savePendaftar(students);
    }
    App.toast("Jurusan berhasil diperbarui.");
  } else {
    majors.push({ id: DB.nextId(majors, "JR"), nama, kuota });
    App.toast("Jurusan berhasil ditambahkan.");
  }

  DB.saveJurusan(majors);
  render();
  App.closeModal("jurusanModal");
});

render();
