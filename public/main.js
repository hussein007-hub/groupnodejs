const backendURL = "http://localhost:5000";

// Handle registration
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      fullnames: form.fullnames.value,
      username: form.username.value,
      password: form.password.value,
    };

    const res = await fetch(`${backendURL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const message = await res.text();
    document.getElementById("message").innerText = message;
  });
}

// Handle login
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      username: form.username.value,
      password: form.password.value,
    };

    const res = await fetch(`${backendURL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await res.json();
    if (result.user) {
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("message").innerText = result;
    }
  });
}

// Get user info for dashboard
async function getUser() {
  const res = await fetch(`${backendURL}/user`, {
    credentials: "include",
  });

  if (res.ok) {
    const user = await res.json();
    document.getElementById("userInfo").innerText = `Welcome, ${user.fullnames}`;
  } else {
    window.location.href = "login.html";
  }
}

// Logout
async function logout() {
  await fetch(`${backendURL}/logout`, { credentials: "include" });
  window.location.href = "login.html";
}
