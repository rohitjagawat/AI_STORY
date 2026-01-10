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

  
// 🔥 CRITICAL FIX
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["font", "stylesheet"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(`file://${htmlPath}`, {
    timeout: 0,
  });

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

