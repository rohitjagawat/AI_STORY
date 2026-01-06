import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { extractVisualScenes } from "../Services/sceneExtractor.service.js";
import { generateStory } from "../Services/story.service.js";
import { generateImages } from "../Services/image.service.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const storyResults = {};

/* ===============================
   START STORY GENERATION
================================ */
router.post("/generate", upload.single("childPhoto"), async (req, res) => {
  try {
    let {
      name,
      age,
      interest,
      gender,
      challenges = "[]",
      siblingName = "",
      additionalInfo = "",
    } = req.body;

    challenges = JSON.parse(challenges || "[]");

    if (!name || !age || !interest) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // ✅ UNIQUE BOOK ID
    const bookId = `book_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    // ⚡ FAST RESPONSE
    res.json({
      success: true,
      bookId,
      message: "Story generation started",
    });

    /* ---------- BACKGROUND WORK ---------- */

    // 🔒 ONLY 2 PAGES GENERATED
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
      bookId,
      { pageLimit: 2 }
    );

    const visualScenes = await extractVisualScenes(storyPages);

    const images = await generateImages(
      visualScenes,
      storyPages,
      { name, age, gender },
      bookId
    );

    const previewImage = images[0];

    storyResults[bookId] = {
      story: storyPages,
      previewImage,
      isPaid: false, // 👈 IMPORTANT
    };

    console.log("✅ PARTIAL STORY GENERATED:", bookId);
  } catch (err) {
    console.error("❌ Story generation failed:", err.message);
  }
});

/* ===============================
   COMPLETE STORY AFTER PAYMENT
================================ */
router.post("/complete", async (req, res) => {
  try {
    const { bookId, input } = req.body;

    if (!bookId || !input) {
      return res.status(400).json({ error: "Missing bookId or input" });
    }

    // 1️⃣ Generate FULL STORY (10 pages)
    const fullStoryPages = await generateStory(
      input,
      bookId,
      { pageLimit: 10 }
    );

    // 2️⃣ Generate visuals for full story
    const visualScenes = await extractVisualScenes(fullStoryPages);

    const images = await generateImages(
      visualScenes,
      fullStoryPages,
      { name: input.name, age: input.age, gender: input.gender },
      bookId
    );

    // 3️⃣ Generate PDF
    const pdfPath = await generatePDF(
      fullStoryPages,
      images,
      bookId
    );

    // 4️⃣ Update in-memory store
    storyResults[bookId] = {
      story: fullStoryPages,
      previewImage: images[0],
      pdfPath,
      isPaid: true,
    };

    res.json({
      success: true,
      message: "Story completed",
    });

    console.log("✅ FULL STORY GENERATED AFTER PAYMENT:", bookId);
  } catch (err) {
    console.error("❌ Complete story failed:", err.message);
    res.status(500).json({ error: "Story completion failed" });
  }
});


/* ===============================
   FETCH RESULT
================================ */
router.get("/result/:bookId", (req, res) => {
  const result = storyResults[req.params.bookId];

  if (!result) {
    return res.json({ ready: false });
  }

  res.json({
  ready: true,
  story: {
    pages: result.story,
    totalPages: 10 // 👈 VERY IMPORTANT
  },
  previewImage: result.previewImage,
  isPaid: result.isPaid,
});

});

export default router;
