import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generatePDF(
  pages,
  images,
  bookId,
  meta = {}
) {
  const outputDir = "output";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, `${bookId}.pdf`);

  return new Promise((resolve, reject) => {
    /* ===============================
       BOOK SIZE (LANDSCAPE SPREAD)
       =============================== */
    const PAGE_WIDTH = 1040; // 520 x 2
    const PAGE_HEIGHT = 760;

    const CARD_WIDTH = 480;
    const CARD_HEIGHT = 700;

    const doc = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      autoFirstPage: false,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    /* =====================================================
       1️⃣ COVER PAGE (SINGLE PAGE)
    ====================================================== */
    doc.addPage({ size: [PAGE_WIDTH, PAGE_HEIGHT] });

    if (images[0]) {
      doc.image(images[0], 0, 0, {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      });
    }

    // Overlay
    doc
      .rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
      .fillOpacity(0.25)
      .fill("#000")
      .fillOpacity(1);

    doc
      .fillColor("#ffffff")
      .fontSize(34)
      .font("Helvetica-Bold")
      .text(meta.title || "A Magical Storybook", 80, 280, {
        width: PAGE_WIDTH - 160,
        align: "center",
      });

    doc
      .moveDown()
      .fontSize(16)
      .font("Helvetica-Oblique")
      .text(`A story for ${meta.childName || "Your Child"}`, {
        align: "center",
      });

    doc
      .fontSize(11)
      .font("Helvetica")
      .text("Created by Jr. Billionaire", 0, PAGE_HEIGHT - 50, {
        align: "center",
      });

    /* =====================================================
       2️⃣ STORY SPREADS (LEFT + RIGHT)
    ====================================================== */
    let pageNumber = 1;

    for (let i = 0; i < pages.length; i += 2) {
      doc.addPage({ size: [PAGE_WIDTH, PAGE_HEIGHT] });

      // LEFT PAGE
      drawStoryCard({
        doc,
        x: 40,
        y: 30,
        image: images[i],
        text: pages[i],
        pageNumber,
        childName: meta.childName,
        cardWidth: CARD_WIDTH,
        cardHeight: CARD_HEIGHT,
      });

      pageNumber++;

      // RIGHT PAGE
      if (pages[i + 1]) {
        drawStoryCard({
          doc,
          x: PAGE_WIDTH / 2 + 40,
          y: 30,
          image: images[i + 1],
          text: pages[i + 1],
          pageNumber,
          childName: meta.childName,
          cardWidth: CARD_WIDTH,
          cardHeight: CARD_HEIGHT,
        });

        pageNumber++;
      }
    }

    doc.end();
    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}

/* =====================================================
   HELPER — EXACT VIEWER CARD
===================================================== */
function drawStoryCard({
  doc,
  x,
  y,
  image,
  text,
  pageNumber,
  childName,
  cardWidth,
  cardHeight,
}) {
  // Card bg
  doc
    .roundedRect(x, y, cardWidth, cardHeight, 18)
    .fill("#fffaf0");

  // Header
  doc
    .fillColor("#777")
    .fontSize(12)
    .text(`${childName || "Your Child"}’s Story`, x, y + 14, {
      width: cardWidth,
      align: "center",
    });

  // Image
  if (image) {
    doc.image(image, x + 20, y + 40, {
      width: cardWidth - 40,
      height: 300,
    });
  }

  // Text (FIXED HEIGHT → NO OVERFLOW)
  doc
    .fillColor("#333")
    .fontSize(14)
    .text(text, x + 30, y + 360, {
      width: cardWidth - 60,
      height: 230,
      align: "center",
      lineGap: 6,
      ellipsis: true,
    });

  // Page number (SAME CARD)
  doc
    .fillColor("#aaa")
    .fontSize(10)
    .text(`${pageNumber}`, x, y + cardHeight - 28, {
      width: cardWidth,
      align: "center",
    });
}
