import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { generateStory } from "../Services/story.service.js";
import { generateImages } from "../Services/image.service.js";
import { generatePDF } from "../Services/pdf.service.js";
import { generateRemainingImagePrompts } from "../Services/imagePrompt.service.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * STEP 1: Start story generation (FAST RESPONSE)
 */
router.post(
  "/generate",
  upload.single("childPhoto"),
  async (req, res) => {
    try {
      const { name, age, interest } = req.body;

      if (!name || !age || !interest) {
        return res.status(400).json({ error: "Invalid input data" });
      }

      const bookId = `${name}_${age}_${interest}`.toLowerCase();

      // 👉 Immediately respond (no timeout)
      res.json({
        success: true,
        bookId,
        message: "Story generation started",
      });

      // 👉 Heavy work AFTER response
      const storyPages = await generateStory(name, age, interest, bookId);

      const images = await generateImages(storyPages, name, bookId);

      await generateRemainingImagePrompts(storyPages, bookId);

      await generatePDF(storyPages, images, bookId);

      console.log("✅ Story generation completed:", bookId);
    } catch (err) {
      console.error("❌ Story generation failed:", err);
    }
  }
);

/**
 * STEP 2: Fetch story result (polling API)
 */
router.get("/result/:bookId", (req, res) => {
  try {
    const { bookId } = req.params;

    const storyPath = path.join("stories", `${bookId}.json`);

    // ❌ Not ready yet
    if (!fs.existsSync(storyPath)) {
      return res.json({
        ready: false,
        message: "Story is still being generated",
      });
    }

    // ✅ Ready
    const storyData = JSON.parse(fs.readFileSync(storyPath, "utf-8"));

    res.json({
      ready: true,
      story: storyData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch story result" });
  }
});

export default router;
