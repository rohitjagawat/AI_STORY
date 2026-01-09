import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function generatePDF(bookId) {
  const outputDir = path.join("output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, `${bookId}.pdf`);

  // ♻️ Agar already bana hua hai, dobara mat banao
  if (fs.existsSync(pdfPath)) {
    console.log("ℹ️ PDF already exists:", bookId);
    return pdfPath;
  }

  console.log("📄 Generating PDF via viewer for:", bookId);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1600,
    height: 1200,
    deviceScaleFactor: 2,
  });

  // 🔥 FRONTEND URL (VERY IMPORTANT)
  await page.goto(
    `https://ai-story-sage.vercel.app/pdf-view/${bookId}`,
    { waitUntil: "networkidle0" }
  );

  // Ensure flipbook rendered
  await page.waitForSelector(".page");
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
