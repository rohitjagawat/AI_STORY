import express from "express";
import { handleOrderPaid } from "../Services/shopify.service.js";

const router = express.Router();

// 🔔 SHOPIFY WEBHOOK (ORDER PAID)
router.post("/webhook/order-paid", express.json(), async (req, res) => {
  try {
    await handleOrderPaid(req.body);
    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook error", err);
    res.status(500).send("ERROR");
  }
});

export default router;
