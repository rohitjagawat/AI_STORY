import express from "express";
import { getProducts } from "../Services/shopifyStorefront.js";

const router = express.Router();

router.get("/products", async (req, res) => {
  try {
    const data = await getProducts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
