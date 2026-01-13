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
   🟣 COVER PAGE (FIXED: TALLER IMAGE, LESS BLANK SPACE)
================================================== */

// 1. Full Page Background (Beige/Cream)
doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill("#fff8e8");

// 2. IMAGE SECTION (Taller Image - 70% of Card Height)
const COVER_IMAGE_WIDTH = CARD_WIDTH;
const COVER_IMAGE_HEIGHT = CARD_HEIGHT * 0.7; // ⬅️ Height badha di (was 0.55)

if (images[0]) {
  doc.save();
  // Image ko rounded corners ke saath clip kiya
  doc
    .roundedRect(CARD_X, CARD_Y, COVER_IMAGE_WIDTH, COVER_IMAGE_HEIGHT, 14)
    .clip();

  doc.image(images[0], CARD_X, CARD_Y, {
    width: COVER_IMAGE_WIDTH,
    height: COVER_IMAGE_HEIGHT,
    align: "center",
    valign: "center",
  });
  doc.restore();
}

// 3. WHITE CARD (Pushed Down to avoid blank space)
// Yeh card ab bachi hui space (30%) fill karega
const WHITE_CARD_Y = CARD_Y + COVER_IMAGE_HEIGHT - 10; // Image se thoda overlap
const WHITE_CARD_HEIGHT = CARD_HEIGHT - COVER_IMAGE_HEIGHT + 10;

doc
  .roundedRect(CARD_X, WHITE_CARD_Y, CARD_WIDTH, WHITE_CARD_HEIGHT, 14)
  .fill("#ffffff");

// 4. TITLE & SUBTITLE (Centered in the remaining White Area)
const TITLE_Y = WHITE_CARD_Y + 35;

doc
  .fontSize(30) // Size thoda chota kiya balance ke liye
  .fillColor("#333333")
  .text(
    meta.title || "A Magical Storybook",
    CARD_X + 20,
    TITLE_Y,
    {
      width: CARD_WIDTH - 40,
      align: "center",
    }
  );

doc
  .moveDown(0.3)
  .fontSize(16)
  .fillColor("#666666")
  .text(
    `A story for ${meta.childName || "Your Child"}`,
    {
      width: CARD_WIDTH - 40,
      align: "center",
    }
  );

// 5. FOOTER (Bottom fixed)
doc
  .fontSize(13)
  .fillColor("#7a7a7a")
  .text(
    "Created by Jr. Billionaire",
    0,
    CARD_Y + CARD_HEIGHT - 25, // White card ke thoda niche beige area mein
    {
      width: PAGE_WIDTH,
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
