import express from "express";

const router = express.Router();

router.post("/webhook/order-paid", (req, res) => {
  console.log("🔥 SHOPIFY WEBHOOK HIT");
  res.status(200).send("OK");
});

export default router;
