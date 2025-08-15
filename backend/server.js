import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));



// Health check
app.get("/", (req, res) => res.json({ status: "ok", service: "product-chain-backend" }));

// Routes
import authRouter from "./routes/auth.js";
import productRouter from "./routes/product.js";
app.use("/auth", authRouter);
app.use("/product", productRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
