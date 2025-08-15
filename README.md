# Product Chain App (Web3 Testnet)

End-to-end template for a hackathon-ready app where users authenticate, register a product on an EVM testnet, and get a QR code that links to an on-chain product page.

## What gets stored on-chain
- Auto-generated `id`
- `name`
- `producerAddress` (Farm/Producer Address)
- `harvestDate`
- `packagingDate`
- `expiryDate`
- `owner` (wallet that submitted)
- `timestamp` (block timestamp)

---

## Monorepo structure
```
product-chain-app/
├─ backend/            # Express API (JWT, Mongo, QR, ethers)
├─ smart-contract/     # Hardhat + Solidity
└─ frontend/           # Static demo UI
```

---

## 1) Smart Contract (Hardhat)

```bash
cd smart-contract
cp .env.example .env            # set RPC_URL + PRIVATE_KEY (test wallet!)
npm i
npm run compile
npm run deploy:sepolia
```

Copy the printed contract address, then:

- The deploy script writes `backend/abis/ProductRegistry.json` automatically after deployment.
- In the backend `.env`, set `CONTRACT_ADDRESS` to the printed address and ensure `RPC_URL` matches.

---

## 2) Backend (Express)

```bash
cd ../backend
cp .env.example .env            # fill in MONGO_URI, JWT_SECRET, RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS
npm i
npm run dev
```

**Endpoints**

- `POST /auth/register` — `{ username, password }`
- `POST /auth/login` — returns `{ token }`
- `POST /product/register` — (JWT required)
  ```json
  {
    "name": "Organic Tomatoes",
    "producerAddress": "Farm Road, Kaduna, Nigeria",
    "harvestDate": "2025-08-10",
    "packagingDate": "2025-08-11",
    "expiryDate": "2025-08-30"
  }
  ```
  Returns `{ productId, qrCode (dataURL), txHash, url }`

- `GET /product/:id` — reads product directly from chain via `getProduct`

---

## 3) Frontend (Static demo)

Serve the `frontend` folder over a static file server (or use a simple VSCode Live Server). For a quick local run:

```bash
# from project root
python3 -m http.server 5500 --directory frontend
```

Then open `http://localhost:5500` in your browser.

In the UI:
1. Register → Login (token saved in localStorage).
2. Fill the product form → Submit.
3. A QR is returned. Scan or click the printed `url` to view `product.html?id=...`.
   The product page fetches `/product/:id` from the backend and renders on-chain data.

If your backend runs at a different URL than `http://localhost:5000`, set it in the browser console:
```js
localStorage.setItem("API", "https://your-backend.example.com")
```

---

## Notes & Tips
- **Ethers v5** is used in the backend for stability. Hardhat uses its own ethers internally.
- Dates are stored as strings (ISO recommended). You can enforce ISO date strings via frontend input types.
- Always use test wallets on testnets. Never put real keys in code.
- For production, move JWT auth to a robust flow (e.g., Sign-in with Ethereum/EIP-4361) and add input validation.

Happy shipping 🚀
