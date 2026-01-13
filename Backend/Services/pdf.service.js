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
   🟣 COVER PAGE (EXACT SS2 STYLE)
================================================== */

// 1. Full Page Background (Beige/Cream)
doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill("#fff8e8");

// 2. White Card (Text Area Background)
// Yeh white box image ke thoda upar se start hota hai aur bottom tak jata hai
const WHITE_CARD_HEIGHT = CARD_HEIGHT * 0.45;
const WHITE_CARD_Y = CARD_Y + (CARD_HEIGHT - WHITE_CARD_HEIGHT);

doc
  .roundedRect(CARD_X, WHITE_CARD_Y, CARD_WIDTH, WHITE_CARD_HEIGHT, 14)
  .fill("#ffffff");

// 3. IMAGE SECTION (Rounded Corners like SS2)
// Image ko white card ke thoda upar rakha hai taaki balance dikhe
const COVER_IMAGE_WIDTH = CARD_WIDTH;
const COVER_IMAGE_HEIGHT = CARD_HEIGHT * 0.55; 

if (images[0]) {
  doc.save(); // Save state to clip rounded corners
  
  // Rounded rectangle path for the image
  doc
    .roundedRect(CARD_X, CARD_Y, COVER_IMAGE_WIDTH, COVER_IMAGE_HEIGHT, 14)
    .clip();

  doc.image(images[0], CARD_X, CARD_Y, {
    width: COVER_IMAGE_WIDTH,
    height: COVER_IMAGE_HEIGHT,
    align: "center",
    valign: "center",
  });
  
  doc.restore(); // Restore state after clipping
}

// 4. TITLE & SUBTITLE (Inside the White Area)
const TITLE_Y = WHITE_CARD_Y + 40;

/* ---- MAIN TITLE ---- */
doc
  .fontSize(32)
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

/* ---- SUBTITLE ---- */
doc
  .moveDown(0.5)
  .fontSize(18)
  .fillColor("#666666")
  .text(
    `A story for ${meta.childName || "Your Child"}`,
    {
      width: CARD_WIDTH - 40,
      align: "center",
    }
  );

// 5. FOOTER (Outside the white card, on the beige background)
doc
  .fontSize(14)
  .fillColor("#7a7a7a")
  .text(
    "Created by Jr. Billionaire",
    0,
    PAGE_HEIGHT - 60,
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
