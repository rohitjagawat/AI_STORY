
import "dotenv/config";
import shopifyRoutes from "./Routes/shopify.route.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import storyRoute from "./Routes/story.route.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});
app.use("/api/shopify", shopifyRoutes);
app.use("/images", express.static("images"));
app.use("/output", express.static("output"));


app.use("/api/story", storyRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});



