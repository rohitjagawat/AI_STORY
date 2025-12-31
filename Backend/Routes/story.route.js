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
   IN-MEMORY STORE (IMPORTANT)
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

      // 👉 FAST RESPONSE
      res.json({
        success: true,
        bookId,
        message: "Story generation started",
      });

      // 👉 BACKGROUND WORK
      const storyPages = await generateStory(name, age, interest, bookId);

      const images = await generateImages(storyPages, name, bookId); // Cloudinary URLs

      await generateRemainingImagePrompts(storyPages, bookId);

      const pdfUrl = await generatePDF(storyPages, images, bookId); // Cloudinary URL

      // 👉 SAVE RESULT (IMPORTANT)
      storyResults[bookId] = {
        story: storyPages,
        previewImage: images[0],
        pdfPath: pdfUrl,
      };

      console.log("✅ Story generation completed:", bookId);
    } catch (err) {
      console.error("❌ Story generation failed:", err);
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

  // 🔥 REAL CHECK: image file exists or not
  const imagePath = path.join(
    process.cwd(),
    result.previewImage
  );

  if (!fs.existsSync(imagePath)) {
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
