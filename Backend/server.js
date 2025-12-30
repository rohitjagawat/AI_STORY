import "dotenv/config";
import express from "express";
import cors from "cors";

import storyRoute from "./Routes/story.route.js";
import shopifyRoutes from "./Routes/shopify.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/images", express.static("images"));
app.use("/output", express.static("output"));

app.use("/api/story", storyRoute);
app.use("/shopify", shopifyRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
