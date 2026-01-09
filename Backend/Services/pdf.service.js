import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/* ================= TEXT FIT HELPER (KEEP SAME) ================= */
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
    fontSize--;
  }

  doc.fontSize(minFontSize).text(text, x, y, {
    width,
    align: "center",
    lineGap: 6,
  });
}

/* ================= DRAW SINGLE STORY PAGE ================= */
function drawStoryPage(doc, text, imagePath, side) {
  const PAGE_WIDTH = doc.page.width / 2; // A4 split
  const PAGE_HEIGHT = doc.page.height;
  const xOffset = side === "left" ? 0 : PAGE_WIDTH;

  const PADDING = 22;
  const CARD_WIDTH = PAGE_WIDTH - PADDING * 2;

  /* ===== IMAGE ===== */
  const IMAGE_Y = 40;
  const IMAGE_HEIGHT = 420;

  doc.image(imagePath, xOffset + PADDING, IMAGE_Y, {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  });

  /* ===== TEXT ===== */
  const TEXT_Y = IMAGE_Y + IMAGE_HEIGHT + 20;
  const TEXT_HEIGHT = 260;

  doc
    .font("Times-Roman")
    .fillColor("#1F1F1F");

  drawFittingText(
    doc,
    text,
    xOffset + PADDING,
    TEXT_Y,
    CARD_WIDTH,
    TEXT_HEIGHT
  );
}

/* ================= COVER PAGE ================= */
function drawCoverPage(doc, coverImage, title, subtitle) {
  const { width, height } = doc.page;

  // full image
  doc.image(coverImage, 0, 0, {
    width,
    height,
  });

  // dark overlay (premium blur feel)
  doc.save();
  doc.rect(60, height / 2 - 80, width - 120, 160)
     .fillOpacity(0.55)
     .fill("#000");
  doc.restore();

  // title
  doc
    .fillColor("#FFFFFF")
    .font("Times-Bold")
    .fontSize(32)
    .text(title, 80, height / 2 - 40, {
      width: width - 160,
      align: "center",
    });

  // subtitle
  doc
    .moveDown(1)
    .font("Times-Italic")
    .fontSize(16)
    .fillColor("#EAEAEA")
    .text(subtitle, {
      align: "center",
    });

  // footer
  doc
    .fontSize(12)
    .fillColor("#FFFFFF")
    .text("Created by Jr. Billionaire", 0, height - 40, {
      align: "center",
    });
}

/* ================= MAIN PDF FUNCTION ================= */
export function generatePDF({
  storyPages,
  imagePaths,
  coverImage,
  title,
  subtitle,
  bookId,
}) {
  return new Promise((resolve, reject) => {
    try {
      const outputDir = "output";
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

      const pdfPath = path.join(outputDir, `${bookId}.pdf`);

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      /* ===== COVER PAGE ===== */
      drawCoverPage(
        doc,
        path.resolve(coverImage),
        title,
        subtitle
      );

      /* ===== STORY SPREADS ===== */
      for (let i = 0; i < storyPages.length; i += 2) {
        doc.addPage();

        drawStoryPage(
          doc,
          storyPages[i],
          path.resolve(imagePaths[i] || imagePaths[0]),
          "left"
        );

        if (storyPages[i + 1]) {
          drawStoryPage(
            doc,
            storyPages[i + 1],
            path.resolve(imagePaths[i + 1] || imagePaths[0]),
            "right"
          );
        }
      }

      doc.end();

      stream.on("finish", () => resolve(pdfPath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}
