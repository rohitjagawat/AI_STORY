import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

export async function generatePDF(bookId) {
  const outputDir = path.join("output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, `${bookId}.pdf`);

  console.log("📄 Generating PDF via viewer for:", bookId);

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath:
      process.platform === "win32"
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1600,
    height: 1200,
    deviceScaleFactor: 2,
  });

  await page.goto(
    `https://ai-story-sage.vercel.app/pdf-view/${bookId}`,
    {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    }
  );

  // ✅ WAIT FOR ANY IMAGE (REAL SIGNAL)
  await page.waitForSelector("img", { timeout: 60000 });

  // ✅ WAIT UNTIL ALL IMAGES FULLY LOAD
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(
      images.map(
        (img) =>
          img.complete ||
          new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          })
      )
    );
  });

  // ✅ FONTS READY
  await page.evaluateHandle("document.fonts.ready");

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  console.log("✅ PDF GENERATED:", pdfPath);
  return pdfPath;
}
