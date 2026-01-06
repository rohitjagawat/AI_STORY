import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { extractVisualScenes } from "../Services/sceneExtractor.service.js";
import { generateStory } from "../Services/story.service.js";
import { generateImages } from "../Services/image.service.js";
import { generatePDF } from "../Services/pdf.service.js";
// import { generateRemainingImagePrompts } from "../Services/imagePrompt.service.js";

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
      // 👇 IMPORTANT: FormData values come as strings
      let {
        name,
        age,
        interest,
        gender,
        challenges = "[]",
        siblingName = "",
        additionalInfo = "",
      } = req.body;

      // ✅ Parse challenges safely
      try {
        challenges = JSON.parse(challenges);
      } catch (e) {
        challenges = [];
      }

      console.log("🧠 STORY INPUT RECEIVED:", {
        name,
        age,
        interest,
        gender,
        challenges,
        siblingName,
        additionalInfo,
      });

      if (!name || !age || !interest) {
        return res.status(400).json({ error: "Invalid input data" });
      }

      const bookId = `book_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;


      // ⚡ FAST RESPONSE (frontend ko turant bhejo)
      res.json({
        success: true,
        bookId,
        message: "Story generation started",
      });

      /* ---------- BACKGROUND WORK ---------- */

      const storyPages = await generateStory(
        {
          name,
          age,
          gender,
          interest,
          challenges,
          siblingName,
          additionalInfo,
        },
        bookId
      );
      const visualScenes = await extractVisualScenes(storyPages);

      const images = await generateImages(
        visualScenes,
        storyPages,
        { name, age, gender },
        bookId
      );


      const previewImage = images[0];

      // 🔥 WAIT until preview image exists
      const imagePath = path.join(process.cwd(), previewImage);

      let retries = 0;
      while (!fs.existsSync(imagePath)) {
        if (retries > 20) break; // ~10 seconds
        await new Promise((r) => setTimeout(r, 500));
        retries++;
      }

      if (!fs.existsSync(imagePath)) {
        throw new Error("Preview image not written to disk");
      }


      const pdfUrl = await generatePDF(storyPages, images, bookId);

      // ✅ Save result
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
