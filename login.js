/* ==========================================================
   PPDB ONLINE — LOGIN
   ========================================================== */

if (DB.isLoggedIn()) {
  window.location.replace("index.html");
}

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const fieldUsername = document.getElementById("fieldUsername");
  const fieldPassword = document.getElementById("fieldPassword");

  fieldUsername.classList.remove("invalid");
  fieldPassword.classList.remove("invalid");

  if (!username || !password) {
    if (!username) fieldUsername.classList.add("invalid");
    if (!password) fieldPassword.classList.add("invalid");
    App.toast("Username dan password wajib diisi.", "error");
    return;
  }

  if (username !== "admin" || password !== "admin123") {
    App.toast("Username atau password salah.", "error");
    return;
  }

  DB.login();
  App.toast("Berhasil masuk. Selamat datang, Admin!");
  setTimeout(() => (window.location.href = "index.html"), 700);
});
