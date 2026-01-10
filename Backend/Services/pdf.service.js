import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { buildPDFHtml } from "./pdf.helper.js";

export async function generatePDF({
  bookId,
  title,
  childName,
  pages,
  isTest = false,
}) {
  // ✅ test mode → sirf 2 pages
  const finalPages = isTest ? pages.slice(0, 2) : pages;

  const baseUrl = process.env.BACKEND_BASE_URL;

  const html = buildPDFHtml({
    bookId,
    title,
    childName,
    pages: finalPages,
    baseUrl,
  });

  // ✅ ensure output folder
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ✅ WRITE HTML FILE (IMPORTANT)
  const htmlPath = path.join(outputDir, `${bookId}.html`);
  fs.writeFileSync(htmlPath, html);

  const pdfPath = path.join(outputDir, `${bookId}.pdf`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // ❌ setContent MAT use karo
await page.goto(`file://${htmlPath}`, {
  waitUntil: "load",      // 🔥 IMPORTANT
  timeout: 0              // 🔥 NO TIMEOUT
});

// ✅ wait a bit so images render properly
await new Promise(resolve => setTimeout(resolve, 2000));



  await page.pdf({
    path: pdfPath,
    width: "380px",
    height: "560px",
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  await browser.close();

  return pdfPath;
}
