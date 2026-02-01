import express from "express";
import crypto from "crypto";
import { handleOrderPaid } from "../Services/shopify.service.js";

const router = express.Router();

/**
 * Shopify Webhook Route
 * Path: /api/shopify/webhook/order-paid
 */
router.post(
  "/webhook/order-paid",
  express.raw({ type: "application/json" }), // Signature check ke liye raw body zaroori hai
  async (req, res) => {
    console.log("🔥 SHOPIFY WEBHOOK HIT");

    try {
      const hmac = req.get("X-Shopify-Hmac-Sha256");
      const body = req.body.toString("utf8");

      // 1. Verify Signature (Security)
      const hash = crypto
        .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(req.body, "utf8")
        .digest("base64");

      if (hash !== hmac) {
        console.error("❌ CRITICAL: Invalid Webhook Signature! Verification failed.");
        return res.status(401).send("Unauthorized");
      }

      const payload = JSON.parse(body);
      console.log("📦 WEBHOOK PAYLOAD VERIFIED:", payload.id);

      // 2. Check Financial Status
      // Shopify "paid" ya "authorized" status bhejta hai
      if (payload.financial_status !== "paid") {
        console.log("ℹ️ Payment status not 'paid':", payload.financial_status);
        return res.status(200).send("Status ignored");
      }

      /**
       * 3. Response Fast, Process in Background
       * Shopify expects a response within 5 seconds. 
       * Since image/PDF generation takes time, we start it and send 200 OK immediately.
       */
      res.status(200).send("OK");

      // Background process start karein
      console.log("🚀 Starting Background PDF & Email Flow...");
      handleOrderPaid(payload).catch((err) => {
        console.error("❌ Background Processing Error:", err.message);
      });

    } catch (err) {
      console.error("❌ Webhook error:", err.message);
      // Agar 200 nahi bheja toh Shopify baar-baar retry karega
      res.status(400).send("Webhook processing failed");
    }
  }
);

export default router;