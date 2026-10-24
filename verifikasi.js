/* ==========================================================
   PPDB ONLINE — VERIFIKASI BERKAS
   Melihat & memperbarui status kelengkapan dokumen
   ========================================================== */

const body = document.getElementById("verifikasiBody");
const searchInput = document.getElementById("searchInput");
const berkasFilter = document.getElementById("berkasFilter");
const tableCount = document.getElementById("tableCount");

const DOCS = [
  { key: "kk", label: "Kartu Keluarga" },
  { key: "akta", label: "Akta Kelahiran" },
  { key: "ijazah", label: "Ijazah SD/SMP" },
  { key: "foto", label: "Pas Foto" },
];

let students = DB.getPendaftar();

const isComplete = (p) => DOCS.every((d) => p.berkas && p.berkas[d.key]);

function render() {
  const q = searchInput.value.toLowerCase().trim();
  const filter = berkasFilter.value;

  const filtered = students.filter((p) => {
    const cocokCari = !q || [p.nama, p.nisn].some((v) => String(v).toLowerCase().includes(q));
    const lengkap = isComplete(p);
    const cocokFilter = !filter || (filter === "lengkap" ? lengkap : !lengkap);
    return cocokCari && cocokFilter;
  });

  body.innerHTML = filtered.length
    ? filtered.map((p, i) => {
        const lengkap = isComplete(p);
        const jumlah = DOCS.filter((d) => p.berkas && p.berkas[d.key]).length;

        const cell = (doc) => {
          const on = p.berkas && p.berkas[doc.key];
          return `
            <td>
              <button class="berkas-pill ${on ? "" : "off"}"
                      data-id="${p.id}" data-key="${doc.key}"
                      title="Klik untuk mengubah status ${doc.label}">
                <i class="fa-solid ${on ? "fa-circle-check" : "fa-circle"}"></i>
                ${on ? "Lengkap" : "Belum"}
              </button>
            </td>`;
        };

        return `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${App.esc(p.nama)}</strong><br><span class="muted-sm">${App.esc(p.jurusan)}</span></td>
            <td>${App.esc(p.nisn)}</td>
            ${DOCS.map(cell).join("")}
            <td>
              <span class="badge ${lengkap ? "badge-success" : "badge-warning"}">
                ${lengkap ? "Lengkap" : `Belum Lengkap (${jumlah}/4)`}
              </span>
            </td>
          </tr>`;
      }).join("")
    : `<tr><td colspan="8" class="table-empty">Data tidak ditemukan.</td></tr>`;

  tableCount.textContent = `Menampilkan ${filtered.length} dari ${students.length} data`;
}

/* ---------- Toggle status dokumen ---------- */
body.addEventListener("click", (e) => {
  const btn = e.target.closest(".berkas-pill");
  if (!btn) return;

  const student = students.find((p) => p.id === btn.dataset.id);
  if (!student) return;

  const key = btn.dataset.key;
  student.berkas[key] = !student.berkas[key];

  DB.savePendaftar(students);
  render();

  const doc = DOCS.find((d) => d.key === key);
  App.toast(
    `${doc.label} ${student.nama}: ${student.berkas[key] ? "Lengkap" : "Belum Lengkap"}.`,
    student.berkas[key] ? "success" : "info"
  );
});

searchInput.addEventListener("input", render);
berkasFilter.addEventListener("change", render);

render();
