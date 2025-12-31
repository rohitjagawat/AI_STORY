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

/* ===============================
   IN-MEMORY STORE
================================ */
const storyResults = {};

/* ===============================
   START STORY GENERATION
================================ */
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

      // ⚡ FAST RESPONSE
      res.json({
        success: true,
        bookId,
        message: "Story generation started",
      });

      /* ---------- BACKGROUND WORK ---------- */

      const storyPages = await generateStory(name, age, interest, bookId);

      const images = await generateImages(storyPages, name, bookId);
      const previewImage = images[0];

      // 🔥 HARD WAIT UNTIL IMAGE EXISTS ON DISK
      const imagePath = path.join(process.cwd(), previewImage);

      let retries = 0;
      while (!fs.existsSync(imagePath)) {
        if (retries > 20) break; // max ~10s
        await new Promise((r) => setTimeout(r, 500));
        retries++;
      }

      if (!fs.existsSync(imagePath)) {
        throw new Error("Preview image not written to disk");
      }

      await generateRemainingImagePrompts(storyPages, bookId);
      const pdfUrl = await generatePDF(storyPages, images, bookId);

      // ✅ SAVE RESULT ONLY AFTER IMAGE EXISTS
      storyResults[bookId] = {
        story: storyPages,
        previewImage,
        pdfPath: pdfUrl,
      };

      console.log("✅ Story generation completed:", bookId);
    } catch (err) {
      console.error("❌ Story generation failed:", err.message);
    }
  }
);

/* ===============================
   FETCH RESULT (POLLING)
================================ */
router.get("/result/:bookId", (req, res) => {
  const { bookId } = req.params;
  const result = storyResults[bookId];

  if (!result) {
    return res.json({ ready: false });
  }

  res.json({
    ready: true,
    story: { pages: result.story },
    previewImage: result.previewImage,
    pdfPath: result.pdfPath,
  });
});

export default router;
