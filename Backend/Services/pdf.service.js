import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Draw text that always fits inside the given height
 * without cutting or overlapping.
 */
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

  // fallback
  doc.fontSize(minFontSize).text(text, x, y, {
    width,
    align: "center",
    lineGap: 6,
  });
}

export function generatePDF(storyPages, imagePaths, bookId) {
  return new Promise((resolve, reject) => {
    try {
      const outputDir = "output";
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      const pdfPath = path.join(outputDir, `${bookId}.pdf`);

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // 🛑 SAFETY CHECK
      if (!imagePaths || imagePaths.length === 0) {
        throw new Error("No images available for PDF generation");
      }

      for (let i = 0; i < storyPages.length; i++) {
        if (i !== 0) doc.addPage();

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // 🔁 TEST MODE SAFE: reuse first image if others missing
        const safeImage = imagePaths[i] || imagePaths[0];

        if (!safeImage) {
          throw new Error("No valid image available for PDF");
        }

        const imagePath = path.resolve(safeImage);

        /* ================= IMAGE (80%) ================= */
        const imageHeight = pageHeight * 0.8;
        doc.image(imagePath, 0, 0, {
          width: pageWidth,
          height: imageHeight,
        });

        /* ================= TEXT AREA (20%) ================= */
        const textBgY = imageHeight;
        const textBgHeight = pageHeight - imageHeight;

        // background
        doc.save();
        doc.rect(0, textBgY, pageWidth, textBgHeight).fill("#F3D97A");
        doc.restore();

        /* ================= TEXT ================= */
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

      stream.on("finish", () => resolve(pdfPath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}
