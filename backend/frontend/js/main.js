const API = "http://localhost:5000";


async function registerProduct() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first.");

    // if harvest date is empty, send "Not Applicable"
    const harvestDate = document.getElementById("p-harvest").value || "Not Applicable";

    const body = {
    name: document.getElementById("p-name").value,
    producerAddress: document.getElementById("p-producer").value,
    harvestDate: harvestDate,
    packagingDate: document.getElementById("p-packaging").value,
    expiryDate: document.getElementById("p-expiry").value,
    };

    // Show loader
    const qr = document.getElementById("qr");
    qr.innerHTML = `<p>⏳ Registering product on chain... please wait</p>`;
    document.getElementById("result").innerHTML = "";

    try {
    const res = await fetch(API + "/product/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.qrCode) {
        // Show QR image
        const img = new Image();
        img.src = data.qrCode;
        img.alt = "QR Code";
        img.width = 220;

        qr.innerHTML = "";
        qr.appendChild(img);

        // Show Product ID and Transaction Hash + Download button
        const result = document.getElementById("result");
        result.innerHTML = `
        <p><strong>Product ID:</strong> ${data.productId}</p>
        <p><strong>Transaction Hash:</strong> ${data.txHash}</p>
        <a href="${data.qrCode}" download="product-${data.productId}-qr.png" class="download-btn">
            ⬇️ Download QR Code
        </a>
        `;
    } else {
        qr.innerHTML = "";
        alert(data.error || "Failed");
    }
    } catch (err) {
    qr.innerHTML = "";
    alert("Error: " + err.message);
    }
}

async function loadMyProducts() {
    const token = localStorage.getItem("token");
    if (!token) {
    window.location.href = "auth.html";
    return;
    }

    try {
    const res = await fetch(API + "/products/my", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const products = await res.json();
    const container = document.getElementById("products-container");

    if (!products.length) {
        container.innerHTML = "<p>You have not registered any products yet.</p>";
        return;
    }

    container.innerHTML = `
        <table class="product-table">
        <thead>
            <tr>
            <th>Name</th>
            <th>Producer</th>
            <th>Harvest</th>
            <th>Packaging</th>
            <th>Expiry</th>
            </tr>
        </thead>
        <tbody>
            ${products.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.producerAddress}</td>
                <td>${p.productionDate}</td>
                <td>${p.packagingDate}</td>
                <td>${p.expiryDate}</td>
            </tr>
            `).join("")}
        </tbody>
        </table>
    `;
    } catch (err) {
    document.getElementById("products-container").innerHTML =
        "<p>Error loading products. Please try again later.</p>";
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "auth.html";
}

loadMyProducts();


async function fetchProducts() {
    const token = localStorage.getItem("token");
    if (!token) {
    alert("Please login first.");
    return;
    }

    const res = await fetch(API + "/products/my", {
    headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No products found.</td></tr>";
    return;
    }

    data.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.productId}</td>
        <td>${p.txHash}</td>
        <td>
        <button onclick="showQR('${p.qrCode}')">View QR</button>
        <button onclick="viewDetails(${p.productId})">View Details</button>
        </td>
    `;
    tbody.appendChild(row);
    });
}

function showQR(qrCode) {
    const modal = document.getElementById("qrModal");
    const img = document.getElementById("qrPreview");
    img.src = qrCode;
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("qrModal").style.display = "none";
}

function viewDetails(productId) {
    window.location.href = `/product.html?id=${productId}`;
}

// Load products on page load
fetchProducts();


async function load() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");
    if (!id) {
    document.getElementById("product").innerText = "No ID provided.";
    return;
    }

    const api = "http://localhost:5000/product/" + id;
    try {
    const res = await fetch(api);
    const data = await res.json();

    if (data.error) {
        document.getElementById("product").innerText = data.error;
        return;
    }

    document.getElementById("product").innerHTML = `
        <div class="card">
        <p><b>Product ID:</b> ${data.id}</p>
        <p><b>Name:</b> ${data.name}</p>
        <p><b>Producer:</b> ${data.producerAddress}</p>
        <p><b>Harvest Date:</b> ${data.harvestDate}</p>
        <p><b>Packaging Date:</b> ${data.packagingDate}</p>
        <p><b>Expiry Date:</b> ${data.expiryDate}</p>
        <p><b>Transaction Hash:</b> <a href="${data.url}" target="_blank">${data.txHash || "N/A"}</a></p>
        </div>
    `;
    } catch (err) {
    document.getElementById("product").innerText = "⚠️ Failed to load product.";
    console.error(err);
    }
}

load();
