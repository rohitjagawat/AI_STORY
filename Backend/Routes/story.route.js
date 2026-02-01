import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { extractVisualScenes } from "../Services/sceneExtractor.service.js";
import { generateStory } from "../Services/story.service.js";
import { generateImages } from "../Services/image.service.js";
import { generateTitle } from "../Services/title.service.js";

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
      email, // 👈 1. EMAIL CAPTURED FROM FRONTEND
      age,
      interest,
      gender,
      challenges = "[]",
      siblingName = "",
      additionalInfo = "",
    } = req.body;

    challenges = JSON.parse(challenges || "[]");

    // Validation update
    if (!name || !email || !age || !interest) {
      return res.status(400).json({ error: "Invalid input data (Missing Name or Email)" });
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

    // ✅ ENSURE stories DIRECTORY EXISTS
    if (!fs.existsSync("stories")) {
      fs.mkdirSync("stories", { recursive: true });
    }

    // 🔐 2. SAVE STORY INPUT WITH EMAIL (Crucial for Webhook delivery)
    fs.writeFileSync(
      `stories/${bookId}.input.json`,
      JSON.stringify(
        {
          name,
          email, // 👈 Saved for later use in shopify.service.js
          age,
          gender,
          interest,
          challenges,
          siblingName,
          additionalInfo,
        },
        null,
        2
      )
    );

    // 🧠 AI GENERATED STORY TITLE
    const title = await generateTitle({
      name,
      age,
      interest,
      challenges,
    });

    // 💾 SAVE STORY META (TITLE + CHILD INFO)
    fs.writeFileSync(
      `stories/${bookId}.meta.json`,
      JSON.stringify(
        {
          title,
          childName: name,
          age,
          interest,
        },
        null,
        2
      )
    );

    // 📘 GENERATE FULL STORY ONCE (10 pages)
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
      { pageLimit: 10 }
    );

    // 🎨 EXTRACT VISUAL SCENES
    const visualScenes = await extractVisualScenes(storyPages);

    // 🖼️ GENERATE ONLY FIRST 2 IMAGES (PREVIEW)
    await generateImages(
      visualScenes.slice(0, 2),
      storyPages.slice(0, 2),
      { name, age, gender },
      bookId,
      { startIndex: 0 }
    );

    const previewImage = `images/${bookId}/page_1.png`;

    // 💾 SAVE RESULT (IN-MEMORY)
    storyResults[bookId] = {
      story: storyPages,
      previewImage,
      isPaid: false,
    };

    console.log("✅ PREVIEW STORY GENERATED & EMAIL STORED:", bookId);
  } catch (err) {
    console.error("❌ Story generation failed:", err.message);
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

  // 📖 LOAD STORY META
  const metaPath = `stories/${req.params.bookId}.meta.json`;
  let meta = {};

  if (fs.existsSync(metaPath)) {
    meta = JSON.parse(fs.readFileSync(metaPath));
  }

  res.json({
    ready: true,
    story: {
      pages: result.story,
      totalPages: 10,
    },
    title: meta.title || "",
    childName: meta.childName || "",
    previewImage: result.previewImage,
    isPaid: result.isPaid,
  });
});

export default router;