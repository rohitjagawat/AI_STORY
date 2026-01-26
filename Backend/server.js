import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import storyRoute from "./Routes/story.route.js";
import shopifyRoutes from "./Routes/shopify.route.js";
import paymentRoutes from "./Routes/payment.route.js";
import downloadRoutes from "./Routes/download.route.js";
import viewRoutes from "./Routes/view.route.js";

const app = express();

app.use(cors());

/* 🔥 IMPORTANT: RAW BODY ONLY FOR SHOPIFY WEBHOOK */
app.use(
  "/api/shopify/webhook/order-paid",
  bodyParser.raw({ type: "application/json" })
);

/* ✅ Normal JSON for rest APIs */
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/images", express.static("images"));
app.use("/output", express.static("output"));

app.use("/api/story", storyRoute);
app.use("/api/shopify", shopifyRoutes);   // 👈 keep api prefix
app.use("/api/payment", paymentRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api", viewRoutes);

const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend running on http://${HOST}:${PORT}`);
});
