import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generatePDF(pages, images, bookId, meta = {}) {
  const outputDir = "output";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, `${bookId}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    /* =================================================
       PAGE LAYOUT CONSTANTS (MATCH VIEWER)
    ================================================== */
    const PAGE_WIDTH = doc.page.width;
    const PAGE_HEIGHT = doc.page.height;

    const CARD_X = 40;
    const CARD_Y = 40;
    const CARD_WIDTH = PAGE_WIDTH - 80;
    const CARD_HEIGHT = PAGE_HEIGHT - 80;

    const IMAGE_X = CARD_X + 25;
    const IMAGE_Y = CARD_Y + 70;
    const IMAGE_WIDTH = CARD_WIDTH - 50;
    const IMAGE_HEIGHT = CARD_HEIGHT - 240;
    // fills vertical space but leaves room for text + page number


   /* =================================================
   🟣 COVER PAGE (EXACT STORY PAGE LAYOUT)
================================================== */

// ---- Yellow Card (SAME AS STORY PAGES) ----
doc
  .roundedRect(CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 14)
  .fill("#fff8e8");

// ---- Image (EXACT SAME POSITION & SIZE AS STORY PAGE) ----
if (images[0]) {
  doc.image(images[0], IMAGE_X, IMAGE_Y, {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    align: "center",
    valign: "center",
  });
}

// ---- TITLE (REPLACES STORY TEXT POSITION) ----
doc
  .fontSize(26)
  .fillColor("#333333")
  .text(
    meta.title || "A Magical Storybook",
    CARD_X + 40,
    IMAGE_Y + IMAGE_HEIGHT + 30, // ⬅️ SAME as story text start
    {
      width: CARD_WIDTH - 80,
      align: "center",
      lineGap: 4,
    }
  );

// ---- SUBTITLE (TIGHT, NO EXTRA GAP) ----
doc
  .moveDown(0.3)
  .fontSize(15)
  .fillColor("#555555")
  .text(
    `A story for ${meta.childName || "Your Child"}`,
    {
      align: "center",
    }
  );

// ---- FOOTER (SAME STYLE, NO BIG GAP) ----
doc
  .fontSize(11)
  .fillColor("#888888")
  .text(
    "Created by Jr. Billionaire",
    CARD_X,
    CARD_Y + CARD_HEIGHT - 30,
    {
      width: CARD_WIDTH,
      align: "center",
    }
  );


    /* =================================================
       📘 STORY PAGES — ONE PAGE = ONE STORY
    ================================================== */
    for (let i = 0; i < pages.length; i++) {
      doc.addPage();

      /* ---- Yellow Card ---- */
      doc
        .roundedRect(CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 14)
        .fill("#fff8e8");

      /* ---- Title ---- */
      doc
        .fontSize(12)
        .fillColor("#7a7a7a")
        .text(
          `${meta.childName || "Your Child"}’s Story`,
          CARD_X,
          CARD_Y + 20,
          {
            width: CARD_WIDTH,
            align: "center",
          }
        );

      /* ---- Image ---- */
      if (images[i]) {
        doc.image(images[i], IMAGE_X, IMAGE_Y, {
          width: IMAGE_WIDTH,
          height: IMAGE_HEIGHT,
          align: "center",
          valign: "center",
        });

      }

      /* ---- Story Text ---- */
      doc
        .fontSize(14)
        .fillColor("#333333")
        .text(
          pages[i],
          CARD_X + 40,
          IMAGE_Y + IMAGE_HEIGHT + 30,
          {
            width: CARD_WIDTH - 80,
            align: "center",
            lineGap: 6,
          }
        );

      /* ---- Page Number (SAME PAGE) ---- */
      doc
        .fontSize(10)
        .fillColor("#9a9a9a")
        .text(
          `${i + 1}`,
          CARD_X,
          CARD_Y + CARD_HEIGHT - 30,
          {
            width: CARD_WIDTH,
            align: "center",
          }
        );
    }

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}
