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
  // 🔹 TEST MODE: sirf 2 pages
  const finalPages = isTest ? pages.slice(0, 2) : pages;

 const baseUrl = process.env.BACKEND_BASE_URL;

const html = buildPDFHtml({
  bookId,
  title,
  childName,
  pages: finalPages,
  baseUrl,
});


  // 🔥 CRITICAL FIX FOR RAILWAY (folder must exist)
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, `${bookId}.pdf`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  // ✅ IMPORTANT: yahin pdfPath use hoga
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
