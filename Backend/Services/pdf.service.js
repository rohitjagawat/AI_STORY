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

    const GAP = 30;
    const LEFT_COL_X = CARD_X + 30;
    const RIGHT_COL_X = CARD_X + CARD_WIDTH / 2 + 10;
    const COL_WIDTH = CARD_WIDTH / 2 - 50;

    const CONTENT_Y = CARD_Y + 110;
    const CONTENT_HEIGHT = CARD_HEIGHT - 200;

    /* =================================================
       🟣 COVER PAGE
    ================================================= */

    doc
      .roundedRect(CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 14)
      .fill("#fff8e8");

    if (images[0]) {
      doc.image(images[0], LEFT_COL_X, CONTENT_Y - 30, {
        width: CARD_WIDTH - 60,
        height: CARD_HEIGHT - 260,
        align: "center",
        valign: "center",
      });
    }

    const titleY = CARD_Y + CARD_HEIGHT - 160;

    doc
      .font("TitleBold")
      .fontSize(30)
      .fillColor("rgba(0,0,0,0.25)")
      .text(meta.title || "A Magical Storybook", CARD_X + 41, titleY + 1, {
        width: CARD_WIDTH - 80,
        align: "center",
      });

    doc
      .font("TitleBold")
      .fontSize(30)
      .fillColor("#2b2b2b")
      .text(meta.title || "A Magical Storybook", CARD_X + 40, titleY, {
        width: CARD_WIDTH - 80,
        align: "center",
      });

    const childName = meta.childName
      ? meta.childName.charAt(0).toUpperCase() + meta.childName.slice(1)
      : "Your Child";

    doc
      .moveDown(0.5)
      .font("TitleSemi")
      .fontSize(15)
      .fillColor("#555555")
      .text(`A story of ${childName}`, { align: "center" });

    doc
      .moveDown(0.5)
      .font("TitleSemi")
      .fontSize(11)
      .fillColor("#888888")
      .text("CREATED BY JR. BILLIONAIRE", {
        align: "center",
        characterSpacing: 1.2,
      });

    /* =================================================
       📘 STORY PAGES (IMAGE LEFT, TEXT RIGHT)
    ================================================= */

    let pageNumber = 1;

    for (let i = 0; i < pages.length; i++) {
      doc.addPage();

      // Background card
      doc
        .roundedRect(CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, 14)
        .fill("#fff8e8");

      // Header
      doc
        .font("TitleSemi")
        .fontSize(12)
        .fillColor("#b5a77a")
        .text(`${childName}’s Story`, CARD_X, CARD_Y + 40, {
          width: CARD_WIDTH - 20,
          align: "right",
        });

      /* ---------- LEFT: IMAGE ---------- */
      if (images[i]) {
        doc.image(images[i], LEFT_COL_X, CONTENT_Y, {
          width: COL_WIDTH,
          height: CONTENT_HEIGHT,
          fit: [COL_WIDTH, CONTENT_HEIGHT],
          align: "center",
          valign: "center",
        });
      }

      /* ---------- RIGHT: TEXT ---------- */
      if (i === pages.length - 1) {
        // Moral page
        doc
          .font("TitleSemi")
          .fontSize(18)
          .fillColor("#6b5f3a")
          .text("Moral of the Story", RIGHT_COL_X, CONTENT_Y, {
            width: COL_WIDTH,
            align: "center",
          });

        doc
          .moveDown(1)
          .font("TitleSemi")
          .fontSize(16)
          .fillColor("#2f2a1f")
          .text(pages[i], {
            width: COL_WIDTH,
            align: "center",
            lineGap: 10,
          });
      } else {
        doc
          .font("TitleSemi")
          .fontSize(17)
          .fillColor("#2f2a1f")
          .text(pages[i], RIGHT_COL_X, CONTENT_Y + 20, {
            width: COL_WIDTH,
            align: "left",
            lineGap: 10,
          });
      }

      /* ---------- PAGE NUMBER ---------- */
      doc
        .fontSize(10)
        .fillColor("#9a9a9a")
        .text(`${pageNumber}`, CARD_X, CARD_Y + CARD_HEIGHT - 30, {
          width: CARD_WIDTH,
          align: "center",
        });

      /* ---------- FOOTER (LAST PAGE ONLY) ---------- */
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

      pageNumber++;
    }

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}
