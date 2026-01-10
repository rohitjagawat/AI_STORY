import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();

/*
  GET /api/pdf/generate/:bookId
*/
router.get("/generate/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    const FRONTEND_URL = process.env.FRONTEND_URL;
    if (!FRONTEND_URL) {
      throw new Error("FRONTEND_BASE not set in Railway");
    }

    const PREVIEW_URL = `${FRONTEND_URL}/preview/${bookId}`;
    console.log("📘 Opening:", PREVIEW_URL);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);

    await page.goto(PREVIEW_URL, {
      waitUntil: "networkidle0",
      timeout: 120000,
    });

    await page.waitForSelector("#storybook-root", { timeout: 60000 });
    await page.waitForTimeout(4000);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=storybook.pdf",
    });

    res.send(pdf);

  } catch (err) {
    console.error("❌ PDF ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
