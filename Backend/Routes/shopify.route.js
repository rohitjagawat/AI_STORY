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
      const payload = Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString("utf8"))
        : req.body;

      console.log("📦 WEBHOOK PAYLOAD RECEIVED");

      /* ✅ ONLY CONDITION THAT MATTERS */
      if (payload.financial_status !== "paid") {
        console.log(
          "❌ Payment not successful:",
          payload.id,
          payload.financial_status
        );
        return res.status(200).send("IGNORED");
      }

      /* ✅ TEST OR REAL — BOTH ACCEPTED */
      console.log("✅ PAYMENT CONFIRMED (test or real)");

      await handleOrderPaid(payload);

      res.status(200).send("OK");
    } catch (err) {
      console.error("❌ Webhook error:", err.message);
      res.status(400).send("Webhook error");
    }
  }
);

export default router;
