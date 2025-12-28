import express from "express";
import multer from "multer";
import { generateStory } from "../Services/story.service.js";
import { generateImages } from "../Services/image.service.js";
import { generatePDF } from "../Services/pdf.service.js";
import { generateRemainingImagePrompts } from "../Services/imagePrompt.service.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/generate",
  upload.single("childPhoto"),
  async (req, res) => {
    try {
      console.log("FRONTEND DATA AAYA:", req.body);
      const { name, age, interest } = req.body;

      if (!name || !age || !interest) {
        return res.status(400).json({ error: "Invalid input data" });
      }

      const bookId = `${name}_${age}_${interest}`.toLowerCase();

      // ✅ SEND RESPONSE IMMEDIATELY (VERY IMPORTANT)
      res.json({
        success: true,
        message: "Story generation started",
        bookId
      });

      // ⏳ HEAVY WORK STARTS AFTER RESPONSE
      const storyPages = await generateStory(name, age, interest, bookId);
      const images = await generateImages(storyPages, name, bookId);
      const remainingImagePrompts =
        await generateRemainingImagePrompts(storyPages, bookId);
      await generatePDF(storyPages, images, bookId);

      console.log("✅ Story generation completed for", bookId);

    } catch (err) {
      console.error("❌ Story generation failed:", err);
    }
  }
);
;

export default router;
