import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

/**
 * Generate PDF that looks EXACTLY like the story viewer
 */
export async function generatePDF(storyPages, imagePaths, bookId, meta = {}) {
  const outputDir = path.join("output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, `${bookId}.pdf`);

  const {
    title = "A Magical Story",
    childName = "Your Child",
  } = meta;

  // ---------- BUILD HTML ----------
  const pagesHtml = storyPages
    .map((text, index) => {
      const img = imagePaths[index]
        ? `file://${path.resolve(imagePaths[index])}`
        : "";

      return `
        <div class="page">
          <div class="header">${childName}’s Story</div>

          <div class="image-box">
            <img src="${img}" />
          </div>

          <div class="text">
            ${text}
          </div>

          <div class="page-number">${index + 1}</div>
        </div>
      `;
    })
    .join("");

  const html = `
  <html>
  <head>
    <style>
      * {
        box-sizing: border-box;
        font-family: "Georgia", serif;
      }

      body {
        margin: 0;
        padding: 0;
      }

      .page {
        width: 210mm;
        height: 297mm;
        padding: 24mm 20mm;
        page-break-after: always;
        background: #fffaf0;
        position: relative;
      }

      /* COVER */
      .cover {
        padding: 0;
        position: relative;
      }

      .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2));
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        text-align: center;
        padding: 40px;
      }

      .cover-title {
        font-size: 34px;
        font-weight: bold;
        text-shadow: 0 6px 20px rgba(0,0,0,0.6);
        margin-bottom: 16px;
      }

      .cover-sub {
        font-size: 16px;
        opacity: 0.85;
      }

      .cover-footer {
        position: absolute;
        bottom: 30px;
        font-size: 12px;
        opacity: 0.75;
      }

      /* STORY */
      .header {
        text-align: center;
        font-size: 12px;
        color: #777;
        margin-bottom: 12px;
      }

      .image-box {
        width: 100%;
        height: 120mm;
        margin-bottom: 16px;
        border-radius: 12px;
        overflow: hidden;
      }

      .image-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .text {
        font-size: 16px;
        line-height: 1.6;
        text-align: center;
        color: #333;
      }

      .page-number {
        position: absolute;
        bottom: 20mm;
        width: 100%;
        text-align: center;
        font-size: 12px;
        color: #aaa;
      }
    </style>
  </head>

  <body>

    <!-- COVER PAGE -->
    <div class="page cover">
      <img src="file://${path.resolve(imagePaths[0])}" />
      <div class="cover-overlay">
        <div class="cover-title">${title}</div>
        <div class="cover-sub">A story for ${childName}</div>
        <div class="cover-footer">Created by Jr. Billionaire</div>
      </div>
    </div>

    ${pagesHtml}

  </body>
  </html>
  `;

  // ---------- PUPPETEER ----------
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "0",
      bottom: "0",
      left: "0",
      right: "0",
    },
  });

  await browser.close();

  console.log("📘 PDF GENERATED (VIEWER STYLE):", pdfPath);
  return pdfPath;
}
