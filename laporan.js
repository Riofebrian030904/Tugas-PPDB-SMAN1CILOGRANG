/* ==========================================================
   PPDB ONLINE — LAPORAN
   Rekap pendaftar + cetak laporan
   ========================================================== */

const students = DB.getPendaftar();
const majors = DB.getJurusan();

const count = (status) => students.filter((p) => p.status === status).length;

document.getElementById("repTotal").textContent = students.length;
document.getElementById("repAccepted").textContent = count("Diterima");
document.getElementById("repPending").textContent = count("Menunggu");
document.getElementById("repRejected").textContent = count("Ditolak");

/* ---------- Rekap per jurusan ---------- */
document.getElementById("rekapBody").innerHTML = majors.length
  ? majors.map((j, i) => {
      const total = students.filter((p) => p.jurusan === j.nama).length;
      const sisa = Math.max(0, j.kuota - total);
      return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${App.esc(j.nama)}</strong></td>
          <td>${j.kuota}</td>
          <td>${total}</td>
          <td>${sisa}</td>
        </tr>`;
    }).join("")
  : `<tr><td colspan="5" class="table-empty">Belum ada data jurusan.</td></tr>`;

/* ---------- Detail pendaftar ---------- */
document.getElementById("detailBody").innerHTML = students.length
  ? students.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${App.esc(p.nisn)}</td>
        <td><strong>${App.esc(p.nama)}</strong></td>
        <td>${App.esc(p.asalSekolah)}</td>
        <td>${App.esc(p.jurusan)}</td>
        <td>${App.statusBadge(p.status)}</td>
        <td>${App.fmtDate(p.tanggal)}</td>
      </tr>`).join("")
  : `<tr><td colspan="7" class="table-empty">Belum ada data pendaftar.</td></tr>`;

/* ---------- Tanggal cetak ---------- */
document.getElementById("printDate").textContent = new Date().toLocaleDateString("id-ID", {
  day: "2-digit", month: "long", year: "numeric",
});

/* ---------- Cetak ---------- */
document.getElementById("printBtn").addEventListener("click", () => window.print());
