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

    /* ================= FONT REGISTER ================= */
    doc.registerFont(
      "TitleBold",
      path.join("assets/fonts/PlayfairDisplay-Bold.ttf")
    );

    doc.registerFont(
      "TitleSemi",
      path.join("assets/fonts/PlayfairDisplay-SemiBold.ttf")
    );

    /* ================= PAGE CONSTANTS ================= */
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

    /* =================================================
       🟣 COVER PAGE (EXACT STORY PAGE STYLE)
    ================================================= */

    // Yellow card
    doc
      .roundedRect(CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 14)
      .fill("#fff8e8");

    // Image (same as story pages)
    if (images[0]) {
      doc.image(images[0], IMAGE_X, IMAGE_Y, {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        align: "center",
        valign: "center",
      });
    }

    const TITLE_Y = IMAGE_Y + IMAGE_HEIGHT + 30;

    // ---- TITLE (BOLD + STYLISH) ----
    doc
      .font("TitleBold")
      .fontSize(30)
      .fillColor("rgba(0,0,0,0.25)")
      .text(
        meta.title || "A Magical Storybook",
        CARD_X + 41,
        TITLE_Y + 1,
        {
          width: CARD_WIDTH - 80,
          align: "center",
          characterSpacing: 1,
        }
      );

    doc
      .font("TitleBold")
      .fontSize(30)
      .fillColor("#2b2b2b")
      .text(
        meta.title || "A Magical Storybook",
        CARD_X + 40,
        TITLE_Y,
        {
          width: CARD_WIDTH - 80,
          align: "center",
          characterSpacing: 1,
        }
      );

    // ---- SUBTITLE ----
    const childName =
      meta.childName
        ? meta.childName.charAt(0).toUpperCase() + meta.childName.slice(1)
        : "Your Child";

    doc
      .moveDown(0.25)
      .font("TitleSemi")
      .fontSize(15)
      .fillColor("#555555")
      .text(
        `A story of ${childName}`,
        {
          align: "center",
        }
      );


    // ---- FOOTER ----
    doc
      .moveDown(0.6)
      .font("TitleSemi")
      .fontSize(11)
      .fillColor("#888888")
      .text(
        "CREATED BY JR. BILLIONAIRE",
        {
          align: "center",
          characterSpacing: 1.2,
        }
      );

    /* =================================================
   📘 STORY PAGES (IMAGE PAGE + TEXT PAGE)
================================================= */

let textPageNumber = 1;

for (let i = 0; i < pages.length; i++) {

  /* ---------- IMAGE PAGE ---------- */
  doc.addPage();

  doc
    .roundedRect(CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 14)
    .fill("#fff8e8");

  if (images[i]) {
    doc.image(images[i], IMAGE_X, IMAGE_Y, {
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      align: "center",
      valign: "center",
    });
  }

  /* ---------- TEXT PAGE ---------- */
  doc.addPage();

  doc
    .roundedRect(CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 14)
    .fill("#fff8e8");

  
// ---- TOP TITLE (HORIZONTAL) ----
doc
  .font("TitleSemi")
  .fontSize(12)
  .fillColor("#b5a77a")
  .text(
    `${childName}’s Story`,
    CARD_X,
    CARD_Y + 40,
    {
      width: CARD_WIDTH - 20,
      align: "right",
      letterSpacing: 1.2,
    }
  );




 // ---- LAST PAGE = MORAL PAGE ----
if (i === pages.length - 1) {
  // Moral title
  doc
    .font("TitleSemi")
    .fontSize(18)
    .fillColor("#6b5f3a")
    .text(
      "Moral of the Story",
      CARD_X,
      CARD_Y + 140,
      {
        width: CARD_WIDTH,
        align: "center",
        letterSpacing: 1,
      }
    );

  // Moral text = existing story text
  doc
    .moveDown(1.2)
    .font("TitleSemi")
    .fontSize(17)
    .fillColor("#2f2a1f")
    .text(
      pages[i],
      CARD_X + 140,
      CARD_Y + 200,
      {
        width: CARD_WIDTH - 280,
        align: "center",
        lineGap: 10,
      }
    );
} 
// ---- NORMAL STORY TEXT PAGES ----
else {
  doc
    .font("TitleSemi")
    .fontSize(18)
    .fillColor("#2f2a1f")
    .text(
      pages[i],
      CARD_X + 120,
      CARD_Y + 180,
      {
        width: CARD_WIDTH - 240,
        align: "left",
        lineGap: 10,
      }
    );
}



  /* ---- PAGE NUMBER (TEXT PAGE ONLY) ---- */
  doc
    .fontSize(10)
    .fillColor("#9a9a9a")
    .text(
      `${textPageNumber}`,
      CARD_X,
      CARD_Y + CARD_HEIGHT - 30,
      {
        width: CARD_WIDTH,
        align: "center",
      }
    );

  textPageNumber++;

  if (i === pages.length - 1) {
  doc
    .font("TitleSemi")
    .fontSize(10)
    .fillColor("#b5a77a")
    .text(
      "Created by Jr. Billionaire",
      CARD_X,
      CARD_Y + CARD_HEIGHT - 14,
      {
        width: CARD_WIDTH,
        align: "center",
        letterSpacing: 1,
      }
    );
}

}


    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}
