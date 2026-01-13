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
   🟣 COVER PAGE (EXACT SS2 MATCH: OVERLAY BOX STYLE)
================================================== */

// 1. Full Bleed Image (Poore Page Par Image)
if (images[0]) {
  doc.image(images[0], 0, 0, {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    align: "center",
    valign: "center",
  });
}

// 2. Glass-Morphism Overlay Box (Centered Box over Image)
const BOX_WIDTH = PAGE_WIDTH * 0.8;
const BOX_HEIGHT = 200;
const BOX_X = (PAGE_WIDTH - BOX_WIDTH) / 2;
const BOX_Y = (PAGE_HEIGHT - BOX_HEIGHT) / 2;

doc
  .save()
  .roundedRect(BOX_X, BOX_Y, BOX_WIDTH, BOX_HEIGHT, 15)
  .fillOpacity(0.4) // Box ko transparent banane ke liye
  .fill("#ffffff") 
  .restore();

// 3. TITLE & SUBTITLE (Inside the Box)
doc
  .fillOpacity(1) // Text ko poora solid dikhane ke liye
  .fillColor("#ffffff") // White text jaisa SS2 mein hai
  .fontSize(32)
  .text(
    meta.title || "A Magical Storybook",
    BOX_X + 20,
    BOX_Y + 50,
    {
      width: BOX_WIDTH - 40,
      align: "center",
      lineGap: 5
    }
  );

doc
  .fontSize(18)
  .text(
    `A story for ${meta.childName || "Your Child"}`,
    BOX_X + 20,
    BOX_Y + BOX_HEIGHT - 60,
    {
      width: BOX_WIDTH - 40,
      align: "center",
    }
  );

// 4. FOOTER (Bottom Center, White Text)
doc
  .fontSize(14)
  .fillColor("#ffffff")
  .text(
    "Created by Jr. Billionaire",
    0,
    PAGE_HEIGHT - 50,
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
