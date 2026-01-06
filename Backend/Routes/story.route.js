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
    // 🔐 SAVE STORY INPUT FOR PAYMENT WEBHOOK (MANDATORY)

    // ✅ ENSURE stories DIRECTORY EXISTS
    if (!fs.existsSync("stories")) {
      fs.mkdirSync("stories", { recursive: true });
    }


    fs.writeFileSync(
      `stories/${bookId}.input.json`,
      JSON.stringify(
        {
          name,
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


    // 🔒 story generate
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
      { pageLimit: 10}
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
