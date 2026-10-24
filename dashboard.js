/* ==========================================================
   PPDB ONLINE — DASHBOARD ADMIN
   Statistik · Grafik pendaftaran (Chart.js) · Pendaftar terbaru
   Efek parallax hero
   Catatan: dropdown, pencarian, notifikasi, sidebar collapse
   dan logout profil ditangani bersama oleh js/app.js.
   ========================================================== */

const pendaftar = DB.getPendaftar();

/* ----------------------------------------------------------
   1. STATISTIK
   Angka dihitung langsung dari data (bukan hardcode),
   sehingga otomatis berubah saat ada pendaftar baru.
   ---------------------------------------------------------- */
const countStatus = (status) => pendaftar.filter((p) => p.status === status).length;

const stats = {
  total: pendaftar.length,
  verified: countStatus("Terverifikasi") + countStatus("Diterima"),
  pending: countStatus("Menunggu"),
  accepted: countStatus("Diterima"),
};

/* Perbandingan terhadap periode sebelumnya.
   Nilai `delta` dikonfigurasi di sini (bukan dihitung otomatis) —
   ganti dengan persentase yang diinginkan bila perlu. */
const trends = {
  trendTotal: { delta: 12, label: "dari periode sebelumnya" },
  trendVerified: { delta: 8, label: "sudah diverifikasi" },
  trendPending: { delta: -3, label: "belum diverifikasi" },
  trendAccepted: { delta: 5, label: "lolos seleksi" },
};

/* Tampilan statis: angka ditampilkan langsung tanpa animasi
   menghitung, agar dashboard tidak bergerak. */
function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderStats() {
  setValue("statTotal", stats.total);
  setValue("statVerified", stats.verified);
  setValue("statPending", stats.pending);
  setValue("statAccepted", stats.accepted);

  Object.entries(trends).forEach(([id, config]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const up = config.delta >= 0;
    el.className = `stat-trend ${up ? "up" : "down"}`;
    el.innerHTML =
      `<span class="delta"><i class="fa-solid fa-arrow-${up ? "up" : "down"}"></i> ` +
      `${up ? "+" : ""}${config.delta}%</span><em>${config.label}</em>`;
  });
}

renderStats();

/* ----------------------------------------------------------
   2. GRAFIK PENDAFTARAN (line chart, rentang bisa diubah)
   ---------------------------------------------------------- */
const rangeSelect = document.getElementById("rangeSelect");
const chartSubtitle = document.getElementById("chartSubtitle");

const toISO = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const shortDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

/** Susun label & nilai pendaftar per hari (dihitung dari data). */
function buildSeries(days) {
  const counts = {};
  pendaftar.forEach((p) => {
    if (p.tanggal) counts[p.tanggal] = (counts[p.tanggal] || 0) + 1;
  });

  const known = Object.keys(counts).sort();
  const anchor = known.length
    ? new Date(`${known[known.length - 1]}T00:00:00`)
    : new Date();

  const labels = [];
  const values = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() - i);
    const iso = toISO(date);
    labels.push(shortDate(iso));
    values.push(counts[iso] || 0);
  }

  return { labels, values };
}

function areaGradient(chart) {
  const { ctx, chartArea } = chart;
  if (!chartArea) return "rgba(37, 99, 235, 0.15)";
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, "rgba(37, 99, 235, 0.28)");
  gradient.addColorStop(1, "rgba(37, 99, 235, 0)");
  return gradient;
}

let registrationChart = null;

function renderChart() {
  const days = parseInt(rangeSelect.value, 10) || 7;
  const series = buildSeries(days);

  chartSubtitle.textContent = `Jumlah pendaftar dalam ${days} hari terakhir`;

  if (typeof Chart === "undefined") {
    document.getElementById("chartBox").innerHTML =
      '<div class="empty"><h3>Grafik tidak dapat dimuat</h3>' +
      "<p>Chart.js gagal dimuat. Pastikan perangkat terhubung ke internet lalu muat ulang halaman.</p></div>";
    return;
  }

  Chart.defaults.font.family = "Inter, Poppins, sans-serif";

  if (registrationChart) {
    registrationChart.data.labels = series.labels;
    registrationChart.data.datasets[0].data = series.values;
    registrationChart.update();
    return;
  }

  registrationChart = new Chart(document.getElementById("registrationChart"), {
    type: "line",
    data: {
      labels: series.labels,
      datasets: [
        {
          label: "Jumlah Pendaftar",
          data: series.values,
          borderColor: "#2563EB",
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          backgroundColor: (context) => areaGradient(context.chart),
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "#2563EB",
          pointBorderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0F1B33",
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
          titleFont: { family: "Inter", weight: "600", size: 12.5 },
          bodyFont: { family: "Inter", size: 13, weight: "600" },
          callbacks: {
            label: (context) => `${context.parsed.y} pendaftar`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: "#8A96AE", font: { size: 11.5 }, padding: 8 },
          grid: { color: "#EFF3F9", drawTicks: false },
          border: { display: false },
        },
        x: {
          ticks: { color: "#8A96AE", font: { size: 11.5 } },
          grid: { display: false },
          border: { display: false },
        },
      },
    },
  });
}

if (stats.total === 0) {
  document.getElementById("chartBox").innerHTML =
    '<div class="empty"><h3>Belum ada data pendaftar</h3>' +
    "<p>Grafik akan tampil setelah ada pendaftar yang tercatat.</p></div>";
} else {
  renderChart();
}
rangeSelect.addEventListener("change", () => {
  if (stats.total > 0) renderChart();
});

/* ----------------------------------------------------------
   3. PENDAFTAR TERBARU
   ---------------------------------------------------------- */
const recentBody = document.getElementById("recentBody");

const stamp = (p) => `${p.tanggal || ""} ${p.waktu || ""}`;

function renderRecent() {
  const recent = [...pendaftar]
    .sort((a, b) => stamp(b).localeCompare(stamp(a)))
    .slice(0, 5);

  recentBody.innerHTML = recent.length
    ? recent
        .map(
          (p, index) => `
        <tr>
          <td>${index + 1}</td>
          <td class="cell-name">
            <strong>${App.esc(p.nama)}</strong>
            <small>${App.esc(p.id)}</small>
          </td>
          <td>${App.esc(p.nisn)}</td>
          <td>${App.esc(p.jurusan)}</td>
          <td>${App.statusBadge(p.status)}</td>
          <td>${App.fmtDate(p.tanggal)}</td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="table-empty">Belum ada pendaftar.</td></tr>`;
}

renderRecent();

/* ----------------------------------------------------------
   4. EFEK LAPAT BELAKANG HERO (parallax halus)
   Logo background & orb sedikit bergeser mengikuti kursor
   agar banner terasa hidup namun tetap profesional.
   ---------------------------------------------------------- */
const heroBanner = document.getElementById("heroBanner");
const canHover = window.matchMedia("(hover: hover)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroBanner && canHover && !prefersReducedMotion) {
  heroBanner.addEventListener("pointermove", (event) => {
    const rect = heroBanner.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    heroBanner.style.setProperty("--parallax-x", `${(-x * 22).toFixed(1)}px`);
    heroBanner.style.setProperty("--parallax-y", `${(-y * 16).toFixed(1)}px`);
  });

  heroBanner.addEventListener("pointerleave", () => {
    heroBanner.style.setProperty("--parallax-x", "0px");
    heroBanner.style.setProperty("--parallax-y", "0px");
  });
}
