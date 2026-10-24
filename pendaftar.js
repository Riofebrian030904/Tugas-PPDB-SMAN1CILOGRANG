/* ==========================================================
   PPDB ONLINE — DATA PENDAFTAR
   Search, filter, detail, edit, hapus
   ========================================================== */

const body = document.getElementById("pendaftarBody");
const searchInput = document.getElementById("searchInput");
const filterJurusan = document.getElementById("filterJurusan");
const filterStatus = document.getElementById("filterStatus");
const tableCount = document.getElementById("tableCount");

let students = DB.getPendaftar();

/* ---------- Pencarian dari dashboard (?q=nama|nisn|nomor) ---------- */
const initialQuery = new URLSearchParams(location.search).get("q");
if (initialQuery) searchInput.value = initialQuery;

/* ---------- Isi filter jurusan ---------- */
DB.getJurusan().forEach((j) => {
  const option = document.createElement("option");
  option.value = j.nama;
  option.textContent = j.nama;
  filterJurusan.appendChild(option);
});

/* ---------- Render tabel ---------- */
function render() {
  const q = searchInput.value.toLowerCase().trim();
  const j = filterJurusan.value;
  const s = filterStatus.value;

  const filtered = students.filter((p) =>
    (!j || p.jurusan === j) &&
    (!s || p.status === s) &&
    (!q || [p.nama, p.nisn, p.asalSekolah, p.id]
      .some((v) => String(v).toLowerCase().includes(q)))
  );

  body.innerHTML = filtered.length
    ? filtered.map((p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${App.esc(p.nisn)}</td>
          <td><strong>${App.esc(p.nama)}</strong><br><span class="muted-sm">${App.esc(p.id)}</span></td>
          <td>${App.esc(p.asalSekolah)}</td>
          <td>${App.esc(p.jurusan)}</td>
          <td>${App.statusBadge(p.status)}</td>
          <td class="cell-aksi">
            <span class="row-actions">
              <button class="icon-btn sm" data-action="detail" data-id="${p.id}" title="Detail"><i class="fa-solid fa-eye"></i></button>
              <a class="icon-btn sm" href="form-pendaftar.html?edit=${encodeURIComponent(p.id)}" title="Edit"><i class="fa-solid fa-pen-to-square"></i></a>
              <button class="icon-btn sm danger" data-action="delete" data-id="${p.id}" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>
            </span>
          </td>
        </tr>`).join("")
    : `<tr><td colspan="7" class="table-empty">Data tidak ditemukan.</td></tr>`;

  tableCount.textContent = `Menampilkan ${filtered.length} dari ${students.length} data`;
}

/* ---------- Detail ---------- */
const berkasLabel = { kk: "Kartu Keluarga", akta: "Akta Kelahiran", ijazah: "Ijazah", foto: "Pas Foto" };

function showDetail(id) {
  const p = students.find((x) => x.id === id);
  if (!p) return;

  const item = (label, value, wide = false) =>
    `<div class="detail-item${wide ? " wide" : ""}"><span>${label}</span><strong>${value}</strong></div>`;

  const berkas = Object.entries(p.berkas || {}).map(([key, val]) =>
    `<span class="badge ${val ? "badge-success" : "badge-danger"}">${berkasLabel[key] || key}: ${val ? "Lengkap" : "Belum"}</span>`
  ).join("");

  document.getElementById("detailBody").innerHTML =
    item("ID Pendaftar", App.esc(p.id)) +
    item("NISN", App.esc(p.nisn)) +
    item("Nama Lengkap", App.esc(p.nama)) +
    item("Jenis Kelamin", App.esc(p.jenisKelamin)) +
    item("Asal Sekolah", App.esc(p.asalSekolah)) +
    item("Jurusan", App.esc(p.jurusan)) +
    item("Status", App.statusBadge(p.status)) +
    item("Tanggal Daftar", App.fmtDate(p.tanggal)) +
    `<div class="detail-item wide"><span>Kelengkapan Berkas</span><div class="berkas-list">${berkas}</div></div>`;

  App.openModal("detailModal");
}

/* ---------- Hapus ---------- */
async function removeStudent(id) {
  const p = students.find((x) => x.id === id);
  if (!p) return;

  const ok = await App.confirmDialog(
    `Data "${p.nama}" akan dihapus permanen. Lanjutkan?`,
    { title: "Hapus Pendaftar", okText: "Ya, Hapus", danger: true }
  );
  if (!ok) return;

  students = students.filter((x) => x.id !== id);
  DB.savePendaftar(students);
  render();
  App.toast("Data pendaftar berhasil dihapus.");
}

/* ---------- Events ---------- */
searchInput.addEventListener("input", render);
filterJurusan.addEventListener("change", render);
filterStatus.addEventListener("change", render);

body.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  if (btn.dataset.action === "detail") showDetail(btn.dataset.id);
  if (btn.dataset.action === "delete") removeStudent(btn.dataset.id);
});

render();

/* ---------- Notifikasi setelah tambal/edit ---------- */
if (new URLSearchParams(location.search).get("saved") === "1") {
  App.toast("Data pendaftar berhasil disimpan.");
  try {
    history.replaceState(null, "", location.pathname);
  } catch (error) {
    /* file:// tidak selalu mengizinkan history API */
  }
}
