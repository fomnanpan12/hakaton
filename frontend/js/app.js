const API = localStorage.getItem("API") || "http://localhost:5000";

async function register() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const res = await fetch(API + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  alert(data.msg || data.error || "done");
}

async function login() {
  const username = document.getElementById("log-username").value;
  const password = document.getElementById("log-password").value;
  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Logged in");
  } else {
    alert(data.error || "Login failed");
  }
}

async function registerProduct() {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first.");

  const body = {
    name: document.getElementById("p-name").value,
    producerAddress: document.getElementById("p-producer").value,
    harvestDate: document.getElementById("p-harvest").value,
    packagingDate: document.getElementById("p-packaging").value,
    expiryDate: document.getElementById("p-expiry").value,
  };

  const res = await fetch(API + "/product/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.qrCode) {
    const img = new Image();
    img.src = data.qrCode;
    img.alt = "QR Code";
    img.width = 220;
    const qr = document.getElementById("qr");
    qr.innerHTML = "";
    qr.appendChild(img);
    document.getElementById("result").textContent = JSON.stringify(data, null, 2);
  } else {
    alert(data.error || "Failed");
  }
}
