import express from "express";
import { handleOrderPaid } from "../Services/shopify.service.js";

const router = express.Router();

router.post("/webhook/order-paid", (req, res) => {
  console.log("🔥 SHOPIFY WEBHOOK HIT");
  handleOrderPaid(req.body);
  res.status(200).send("OK");
});

export default router;
