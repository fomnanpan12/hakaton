import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve auth page
router.get("/auth", (req, res) => {
  const htmlPath = path.join(__dirname, "../frontend/auth.html"); // <- go 2 levels up
  res.sendFile(htmlPath);
});

// Serve product page
router.get("/productview", (req, res) => {
  const htmlPath = path.join(__dirname, "../frontend/productview.html"); // <- same
  res.sendFile(htmlPath);
});

router.get("/about", (req, res) => {
    const htmlPath = path.join(__dirname, "../frontend/about.html"); // <- same
    res.sendFile(htmlPath);
});



router.get("/", (req, res) => {
  // Option 1: redirect to auth page
//   res.redirect("/auth");

  // Option 2: serve a separate homepage
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

export default router;
