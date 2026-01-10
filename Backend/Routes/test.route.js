import express from "express";
import fs from "fs";
import path from "path";

import { generatePDF } from "../Services/pdf.service.js";
import { loadStory } from "../Services/story.service.js";

const router = express.Router();

/**
 * DEV ONLY – TEST PDF GENERATION
 * No payment
 * No full images required
 */
router.get("/test/pdf/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    // 🔐 OPTIONAL SAFETY (recommended)
    const testKey = req.query.testKey;
    if (testKey !== process.env.TEST_UNLOCK_KEY) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 📘 Load story pages
    const pages = loadStory(bookId);
    if (!pages || pages.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }

    // 📖 Load meta
    const metaPath = path.join("stories", `${bookId}.meta.json`);
    if (!fs.existsSync(metaPath)) {
      return res.status(404).json({ error: "Story meta not found" });
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

    // 🧪 GENERATE TEST PDF (ONLY 2 PAGES)
    await generatePDF({
      bookId,
      title: meta.title,
      childName: meta.childName,
      pages,
      isTest: true, // 🔥 MOST IMPORTANT LINE
    });

    res.json({
      success: true,
      message: "TEST PDF generated",
      pdf: `/api/view/${bookId}?testKey=${testKey}`,
    });
  } catch (err) {
    console.error("❌ Test PDF error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

export default router;
