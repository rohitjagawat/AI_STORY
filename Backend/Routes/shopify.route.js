import express from "express";
import bodyParser from "body-parser";
import { handleOrderPaid } from "../Services/shopify.service.js";

const router = express.Router();

router.post(
  "/webhook/order-paid",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("🔥 SHOPIFY WEBHOOK HIT");

    try {
      const payload = JSON.parse(req.body.toString());
      await handleOrderPaid(payload);
      res.status(200).send("OK");
    } catch (err) {
      console.error("❌ Webhook error:", err.message);
      res.status(400).send("Webhook error");
    }
  }
);

export default router;
