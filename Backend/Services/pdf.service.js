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
    /**
     * ⚠️ IMPORTANT
     * We use a CUSTOM page size that matches flipbook card
     * This prevents overflow + extra pages
     */
    const PAGE_WIDTH = 520;
    const PAGE_HEIGHT = 760;

    const doc = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      autoFirstPage: false,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    /* =====================================================
       COVER PAGE (FULL PAGE IMAGE + TITLE)
    ====================================================== */
    doc.addPage({ size: [PAGE_WIDTH, PAGE_HEIGHT] });

    if (images[0]) {
      doc.image(images[0], 0, 0, {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      });
    }

    // Dark overlay for readability
    doc
      .rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
      .fillOpacity(0.25)
      .fill("#000000")
      .fillOpacity(1);

    doc
      .fillColor("#ffffff")
      .fontSize(30)
      .font("Helvetica-Bold")
      .text(meta.title || "A Magical Storybook", 40, 260, {
        width: PAGE_WIDTH - 80,
        align: "center",
      });

    doc
      .moveDown()
      .fontSize(14)
      .font("Helvetica-Oblique")
      .text(`A story for ${meta.childName || "Your Child"}`, {
        align: "center",
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Created by Jr. Billionaire", 0, PAGE_HEIGHT - 40, {
        align: "center",
      });

    /* =====================================================
       STORY PAGES — EXACT VIEWER STYLE
    ====================================================== */
    for (let i = 0; i < pages.length; i++) {
      doc.addPage({ size: [PAGE_WIDTH, PAGE_HEIGHT] });

      // Card background
      doc
        .roundedRect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40, 16)
        .fill("#fffaf0");

      // CHILD NAME (TOP)
      doc
        .fillColor("#777777")
        .fontSize(12)
        .text(
          `${meta.childName || "Your Child"}’s Story`,
          0,
          34,
          { align: "center" }
        );

      // IMAGE (same proportions as flipbook)
      const IMAGE_X = 40;
      const IMAGE_Y = 60;
      const IMAGE_W = PAGE_WIDTH - 80;
      const IMAGE_H = 300;

      if (images[i]) {
        doc.image(images[i], IMAGE_X, IMAGE_Y, {
          width: IMAGE_W,
          height: IMAGE_H,
        });
      }

      // STORY TEXT (fixed box → NO overflow)
      const TEXT_Y = IMAGE_Y + IMAGE_H + 30;
      const TEXT_H = 230;

      doc
        .fillColor("#333333")
        .fontSize(14)
        .text(pages[i], IMAGE_X, TEXT_Y, {
          width: IMAGE_W,
          height: TEXT_H,
          align: "center",
          lineGap: 6,
          ellipsis: true, // 🔥 prevents overflow → no extra page
        });

      // PAGE NUMBER (BOTTOM — SAME PAGE)
      doc
        .fillColor("#999999")
        .fontSize(10)
        .text(
          `${i + 1}`,
          0,
          PAGE_HEIGHT - 36,
          { align: "center" }
        );
    }

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}
