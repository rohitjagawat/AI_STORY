import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import axios from "axios";
import cloudinary from "../config/cloudinary.js";

/* ---------- helper ---------- */
function drawFittingText(doc, text, x, y, width, maxHeight) {
  let fontSize = 18;
  const minFontSize = 11;

  while (fontSize >= minFontSize) {
    doc.fontSize(fontSize);

    const textHeight = doc.heightOfString(text, {
      width,
      align: "center",
      lineGap: 6,
    });

    if (textHeight <= maxHeight) {
      doc.text(text, x, y, {
        width,
        align: "center",
        lineGap: 6,
      });
      return;
    }

    fontSize -= 1;
  }

  doc.fontSize(minFontSize).text(text, x, y, {
    width,
    align: "center",
    lineGap: 6,
  });
}

/* ---------- MAIN ---------- */
export async function generatePDF(storyPages, imageUrls, bookId) {
  console.log("📘 Generating PDF with Cloudinary images");

  const tempDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  /* 1️⃣ Download first image locally */
  const imageUrl = imageUrls[0];
  const tempImagePath = path.join(tempDir, `${bookId}_img.png`);

  const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(tempImagePath, imageRes.data);

  /* 2️⃣ Create PDF locally */
  const pdfPath = path.join(tempDir, `${bookId}.pdf`);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  for (let i = 0; i < storyPages.length; i++) {
    if (i !== 0) doc.addPage();

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    /* IMAGE (80%) */
    const imageHeight = pageHeight * 0.8;
    doc.image(tempImagePath, 0, 0, {
      width: pageWidth,
      height: imageHeight,
    });

    /* TEXT BG */
    const textBgY = imageHeight;
    const textBgHeight = pageHeight - imageHeight;

    doc.save();
    doc.rect(0, textBgY, pageWidth, textBgHeight).fill("#F3D97A");
    doc.restore();

    /* TEXT */
    doc.save();
    doc.fillColor("#1F1F1F").font("Times-Italic");

    drawFittingText(
      doc,
      storyPages[i],
      60,
      textBgY + 25,
      pageWidth - 120,
      textBgHeight - 50
    );

    doc.restore();
  }

  doc.end();

  await new Promise((res) => stream.on("finish", res));

  /* 3️⃣ Upload PDF to Cloudinary */
  const upload = await cloudinary.uploader.upload(pdfPath, {
    resource_type: "raw",
    folder: `ai_story/${bookId}`,
  });

  /* 4️⃣ Cleanup */
  fs.unlinkSync(tempImagePath);
  fs.unlinkSync(pdfPath);

  console.log("✅ PDF uploaded to Cloudinary");

  /* 5️⃣ RETURN URL */
  return upload.secure_url;
}
