const API = "https://hakaton-1lu4.onrender.com/";

// ====================== QR SCANNER PAGE ======================




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
