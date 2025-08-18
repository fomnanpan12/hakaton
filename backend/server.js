import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";


dotenv.config();
const app = express();
app.use(cors({ origin: "*" })); 
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "frontend")));


// MongoDB connect
mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || undefined })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));



// Health check
// app.get("/", (req, res) => res.json({ status: "ok", service: "product-chain-backend" }));

// Routes
import authRouter from "./routes/auth.js";
import productRouter from "./routes/product.js";

app.use("/auth", authRouter);
app.use("/product", productRouter);

import pagesRouter from "./routes/pages.js"
// Frontend pages
app.use("/", pagesRouter);

import productRoutes from "./routes/products.js";

app.use("/products", productRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
