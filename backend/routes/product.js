// Product routes: registers product on-chain and returns QR code + tx hash
import express from "express";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();
const router = express.Router();

// Simple JWT auth middleware
const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "no token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
};

// Ethers v5 setup
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load ABI — default to Hardhat artifact if local dev, else fallback to ./abis/ProductRegistry.json
function loadAbi() {
  const artifactPath = process.env.ABI_PATH || path.resolve(process.cwd(), "../smart-contract/artifacts/contracts/ProductRegistry.sol/ProductRegistry.json");
  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return artifact.abi;
  } catch (e) {
    // fallback
    const localAbiPath = path.resolve(process.cwd(), "abis/ProductRegistry.json");
    if (fs.existsSync(localAbiPath)) {
      return JSON.parse(fs.readFileSync(localAbiPath, "utf8")).abi;
    }
    throw new Error("ABI not found. Compile the contract or provide abis/ProductRegistry.json");
  }
}

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, loadAbi(), wallet);

// Register product on-chain
router.post("/register", auth, async (req, res) => {
  try {
    const { name, producerAddress, harvestDate, packagingDate, expiryDate } = req.body;
    if (!name || !producerAddress || !harvestDate || !packagingDate || !expiryDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const tx = await contract.registerProduct(name, producerAddress, harvestDate, packagingDate, expiryDate);
    const receipt = await tx.wait();

    // derive the new product id from contract state
    const productCount = await contract.productCount();
    const productId = productCount.toNumber();

    const url = `${process.env.FRONTEND_URL || "http://localhost:5500"}/product.html?id=${productId}`;
    const qrCode = await QRCode.toDataURL(url);

    res.json({ productId, qrCode, txHash: receipt.transactionHash, url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Read product from chain
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const p = await contract.getProduct(id);
    const data = {
      id: p[0].toNumber ? p[0].toNumber() : Number(p[0]),
      name: p[1],
      producerAddress: p[2],
      harvestDate: p[3],
      packagingDate: p[4],
      expiryDate: p[5],
      owner: p[6],
      timestamp: p[7].toNumber ? p[7].toNumber() : Number(p[7])
    };
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
