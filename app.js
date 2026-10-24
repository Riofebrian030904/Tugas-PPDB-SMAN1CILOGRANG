/* ==========================================================
   PPDB ONLINE — APP SHARED
   Sidebar, session guard, toast, modal, konfirmasi, util
   ========================================================== */

const App = (() => {
  const page = document.body.dataset.page || "";

  /* ---------- Session Guard ---------- */
  if (page !== "login" && !DB.isLoggedIn()) {
    window.location.replace("login.html");
  }

  /* ---------- Escape HTML ---------- */
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[c]));
  }

  /* ---------- Badge Status ---------- */
  function statusBadge(status) {
    const map = {
      Terverifikasi: "badge-info",
      Menunggu: "badge-warning",
      Diterima: "badge-success",
      Ditolak: "badge-danger",
    };
    return `<span class="badge ${map[status] || "badge-warning"}">${esc(status)}</span>`;
  }

  /* ---------- Format Tanggal ---------- */
  function fmtDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(message, type = "success") {
    let el = document.getElementById("appToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "appToast";
      el.className = "toast";
      el.innerHTML = '<i class="fa-solid toast-icon"></i><span class="toast-text"></span>';
      document.body.appendChild(el);
    }
    const icons = {
      success: "fa-circle-check",
      error: "fa-circle-exclamation",
      info: "fa-circle-info",
    };
    el.className = `toast toast-${type}`;
    el.querySelector(".toast-icon").className =
      `fa-solid toast-icon ${icons[type] || icons.success}`;
    el.querySelector(".toast-text").textContent = message;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
  }

  /* ---------- Konfirmasi (modal dinamis) ---------- */
  function confirmDialog(message, options = {}) {
    const {
      title = "Konfirmasi",
      okText = "Lanjutkan",
      cancelText = "Batal",
      danger = false,
    } = options;

    return new Promise((resolve) => {
      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop show";
      backdrop.innerHTML = `
        <div class="modal modal-sm">
          <div class="modal-head">
            <h2>${esc(title)}</h2>
            <button class="icon-btn" data-act="cancel" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <p class="modal-text">${esc(message)}</p>
          <div class="modal-foot">
            <button class="btn" data-act="cancel">${esc(cancelText)}</button>
            <button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-act="ok">${esc(okText)}</button>
          </div>
        </div>`;
      document.body.appendChild(backdrop);

      const finish = (result) => {
        backdrop.remove();
        document.removeEventListener("keydown", onKey);
        resolve(result);
      };
      const onKey = (e) => { if (e.key === "Escape") finish(false); };

      backdrop.addEventListener("click", (e) => {
        const act = e.target.closest("[data-act]")?.dataset.act;
        if (act === "ok") finish(true);
        else if (act === "cancel") finish(false);
        else if (e.target === backdrop) finish(false);
      });
      document.addEventListener("keydown", onKey);
    });
  }

  /* ---------- Modal terbuka / tertutup ---------- */
  const openModal = (id) => document.getElementById(id)?.classList.add("show");
  const closeModal = (id) => document.getElementById(id)?.classList.remove("show");

  document.addEventListener("click", (e) => {
    const closer = e.target.closest("[data-close]");
    if (closer) closeModal(closer.dataset.close);
    if (e.target.classList.contains("modal-backdrop")) e.target.classList.remove("show");
  });

  /* ---------- Sidebar: buka drawer (mobile) ---------- */
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const drawerQuery = window.matchMedia("(max-width: 992px)");

  document.getElementById("menuToggle")?.addEventListener("click", () => {
    // Di desktop, tombol dipakai untuk collapse sidebar (lihat di bawah).
    if (!drawerQuery.matches) return;
    sidebar?.classList.add("open");
    overlay?.classList.add("show");
  });

  const closeSidebar = () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("show");
  };

  overlay?.addEventListener("click", closeSidebar);
  document.getElementById("sidebarClose")?.addEventListener("click", closeSidebar);

  /* ---------- Settings Hydrate ---------- */
  function applySettings() {
    const s = DB.getSettings();
    document.querySelectorAll(".js-school-name").forEach((el) => (el.textContent = s.namaSekolah));
    document.querySelectorAll(".js-school-year").forEach((el) => (el.textContent = s.tahunAjaran));
    document.querySelectorAll(".js-school-address").forEach((el) => (el.textContent = s.alamat));
    document.querySelectorAll(".js-admin-name").forEach((el) => (el.textContent = s.namaAdmin));
    document.querySelectorAll(".js-admin-email").forEach((el) => (el.textContent = s.emailAdmin));
    document.querySelectorAll(".avatar").forEach((el) => {
      if (s.fotoProfil) {
        el.style.backgroundImage = `url("${s.fotoProfil}")`;
        el.textContent = "";
        el.classList.add("has-photo");
      } else {
        el.style.backgroundImage = "";
        el.textContent = (s.namaAdmin || "A").trim().charAt(0).toUpperCase();
        el.classList.remove("has-photo");
      }
    });
  }

  applySettings();

  const year = new Date().getFullYear();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = year;
  const yearFooterEl = document.getElementById("yearFooter");
  if (yearFooterEl) yearFooterEl.textContent = year;

  /* ---------- Logout (sidebar & dropdown profil) ---------- */
  async function doLogout() {
    const ok = await confirmDialog("Anda yakin ingin keluar dari akun admin?", {
      title: "Logout",
      okText: "Ya, Logout",
      danger: true,
    });
    if (ok) {
      DB.logout();
      window.location.href = "login.html";
    }
  }

  document.getElementById("logoutBtn")?.addEventListener("click", doLogout);
  document.getElementById("profileLogout")?.addEventListener("click", doLogout);

  /* ---------- Dropdown (notifikasi & profil) ---------- */
  const dropdowns = [
    { root: document.getElementById("notifDropdown"), button: document.getElementById("notifBtn") },
    { root: document.getElementById("profileDropdown"), button: document.getElementById("profileBtn") },
  ];

  function closeDropdowns(except) {
    dropdowns.forEach(({ root }) => {
      if (root && root !== except) root.classList.remove("open");
    });
  }

  dropdowns.forEach(({ root, button }) => {
    if (!root || !button) return;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = !root.classList.contains("open");
      closeDropdowns(root);
      root.classList.toggle("open", willOpen);
    });
    root.addEventListener("click", (event) => event.stopPropagation());
  });

  document.addEventListener("click", () => closeDropdowns());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDropdowns();
  });

  /* ---------- Notifikasi (dihitung dari data) ---------- */
  const notifList = document.getElementById("notifList");
  const notifCount = document.getElementById("notifCount");

  if (notifList && notifCount) {
    const list = DB.getPendaftar();
    const countStatus = (status) => list.filter((p) => p.status === status).length;
    const stats = {
      total: list.length,
      pending: countStatus("Menunggu"),
      accepted: countStatus("Diterima"),
    };
    const latest = list.map((p) => p.tanggal).filter(Boolean).sort().pop();
    const toneClass = {
      blue: "si-blue",
      green: "si-green",
      orange: "si-orange",
      violet: "si-violet",
    };

    const items = [];
    if (stats.pending > 0) {
      items.push({
        icon: "fa-file-clock",
        tone: "orange",
        title: `${stats.pending} berkas menunggu verifikasi`,
        note: "Periksa kelengkapan berkas calon peserta didik",
        href: "verifikasi.html",
      });
    }
    if (stats.accepted > 0) {
      items.push({
        icon: "fa-graduation-cap",
        tone: "violet",
        title: `${stats.accepted} pendaftar diterima`,
        note: "Hasil seleksi calon peserta didik",
        href: "laporan.html",
      });
    }
    items.push({
      icon: "fa-user-group",
      tone: "blue",
      title: `${stats.total} total pendaftar tercatat`,
      note: latest ? `Data terakhir diperbarui ${fmtDate(latest)}` : "Belum ada data",
      href: "pendaftar.html",
    });
    items.push({
      icon: "fa-calendar-check",
      tone: "green",
      title: `Tahun ajaran ${DB.getSettings().tahunAjaran} aktif`,
      note: "Sistem PPDB berjalan normal",
      href: "pengaturan.html",
    });

    notifCount.textContent = items.length;
    notifList.innerHTML = items
      .map(
        (item) => `
        <a class="notif-item" href="${item.href}">
          <span class="n-icon ${toneClass[item.tone]}"><i class="fa-solid ${item.icon}"></i></span>
          <span>
            <strong>${esc(item.title)}</strong>
            <small>${esc(item.note)}</small>
          </span>
        </a>`
      )
      .join("");

    document.getElementById("notifClear")?.addEventListener("click", () => {
      notifCount.textContent = "0";
      notifCount.style.display = "none";
      toast("Semua notifikasi ditandai sudah dibaca.");
    });
  }

  /* ---------- Pencarian global (Ctrl/⌘ + K) ---------- */
  const searchForm = document.getElementById("searchForm");
  const globalSearch = document.getElementById("globalSearch");

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = globalSearch.value.trim();
    window.location.href = query
      ? `pendaftar.html?q=${encodeURIComponent(query)}`
      : "pendaftar.html";
  });

  if (globalSearch) {
    document.addEventListener("keydown", (event) => {
      const isK = event.key.toLowerCase() === "k";
      if ((event.ctrlKey || event.metaKey) && isK) {
        event.preventDefault();
        globalSearch.focus();
        globalSearch.select();
      }
      if (event.key === "Escape" && document.activeElement === globalSearch) {
        globalSearch.value = "";
        globalSearch.blur();
      }
    });
  }

  /* ---------- Sidebar: collapse (desktop) ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const COLLAPSE_KEY = "ppdb_sidebar_collapsed";

  try {
    if (!drawerQuery.matches && localStorage.getItem(COLLAPSE_KEY) === "1") {
      document.body.classList.add("sidebar-collapsed");
    }
  } catch (error) {
    /* localStorage tidak tersedia — abaikan */
  }

  menuToggle?.addEventListener("click", () => {
    // Di mobile, drawer sudah ditangani di atas (menuToggle drawer).
    if (drawerQuery.matches) return;

    document.body.classList.toggle("sidebar-collapsed");
    sidebar?.classList.remove("open");
    overlay?.classList.remove("show");

    try {
      localStorage.setItem(
        COLLAPSE_KEY,
        document.body.classList.contains("sidebar-collapsed") ? "1" : "0"
      );
    } catch (error) {
      /* abaikan */
    }
  });

  return {
    esc, statusBadge, fmtDate, toast, confirmDialog,
    openModal, closeModal, applySettings,
  };
})();
