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
import Product from "../models/Product.js";

router.post("/register", auth, async (req, res) => {
  try {
    const { name, producerAddress, harvestDate, packagingDate, expiryDate, location } = req.body;
    if (!name || !producerAddress || !harvestDate || !packagingDate || !expiryDate || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Blockchain transaction
    const tx = await contract.registerProduct(name, producerAddress, harvestDate, packagingDate, expiryDate, location);
    const receipt = await tx.wait();

    // Get new product ID from contract
    const crypto = require("crypto");
    const productId = crypto.randomBytes(8).toString("hex"); 

    // Generate product URL and QR code
    const url = `https://hakaton-1lu4.onrender.com/product.html?id=${productId}`;
    // const url = `http://localhost:5000/product.html?id=${productId}`;
    const qrCode = await QRCode.toDataURL(url);

    // Save to DB
    const newProduct = new Product({
      userId: req.user.id,
      name,
      producerAddress,
      harvestDate,
      packagingDate,
      expiryDate,
      location,
      productId,
      qrCode,
      txHash: receipt.transactionHash,
      url
    });

    await newProduct.save();
    // console.log(newProduct);
    

    res.json(newProduct);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Get all products for logged-in user
router.get("/my", auth, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
    console.log(products)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// Read product from chain
// router.get("/:id", async (req, res) => {
//   try {
//     const id = parseInt(req.params.id, 10);
//     const p = await contract.getProduct(id);
//     const data = {
//       id: p[0].toNumber ? p[0].toNumber() : Number(p[0]),
//       name: p[1],
//       producerAddress: p[2],
//       harvestDate: p[3],
//       packagingDate: p[4],
//       expiryDate: p[5],
//       owner: p[6],
//       timestamp: p[7].toNumber ? p[7].toNumber() : Number(p[7])
//     };
//     res.json(data);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// router.get("/product/:id", async (req, res) => {
//   try {
//     const id = parseInt(req.params.id, 10);

//     // --- On-chain data ---
//     const p = await contract.getProduct(id);
//     const chainData = {
//       id: p[0].toNumber ? p[0].toNumber() : Number(p[0]),
//       name: p[1],
//       producerAddress: p[2],
//       harvestDate: p[3],
//       packagingDate: p[4],
//       expiryDate: p[5],
//       location: p[6],
//       owner: p[7],
//       timestamp: p[8].toNumber ? p[7].toNumber() : Number(p[7])
//     };

//     // --- Off-chain data (MongoDB) ---
//     const dbProduct = await Product.findOne({ productId: id });

//     // Merge results (prefer MongoDB fields if present, since they include qrCode & txHash)
//     const result = {
//       ...chainData,
//       qrCode: dbProduct?.qrCode || null,
//       txHash: dbProduct?.txHash || null,
//       url: dbProduct?.url || null,
//       createdAt: dbProduct?.createdAt || null,
//       updatedAt: dbProduct?.updatedAt || null
//     };

//     res.json(result);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// backend/routes/product.js
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // get from chain
    const p = await contract.getProduct(id);
    const chainData = {
      id: p[0].toNumber ? p[0].toNumber() : Number(p[0]),
      name: p[1],
      producerAddress: p[2],
      harvestDate: p[3],
      packagingDate: p[4],
      expiryDate: p[5],
      location: p[6],
      owner: p[7],
      timestamp: p[8].toNumber ? p[8].toNumber() : Number(p[7])
    };

    // get from MongoDB
    const dbData = await Product.findOne({ productId: id });

    res.json({
      ...chainData,
      txHash: dbData?.txHash || null,
      qrCode: dbData?.qrCode || null,
      url: dbData?.url || null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



router.get("/scan", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "scan.html"));
});



export default router;
