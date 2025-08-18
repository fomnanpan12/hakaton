const API = "https://hakaton-1lu4.onrender.com/";

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

  try {
    const res = await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.token) {
      // Save JWT token
      localStorage.setItem("token", data.token);

      // Redirect to product page
      window.location.href = "/productview";  // <-- redirect after login

      // Optional alert
      // alert("Logged in");
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred during login");
  }
}



