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
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    /* =====================================================
       📘 COVER PAGE (FULL PAGE, FLIPBOOK STYLE)
    ====================================================== */

    // Cover image (bright, no dull overlay)
    if (images[0]) {
      doc.image(images[0], {
        fit: [520, 760],
        align: "center",
        valign: "center",
      });
    }

    /* ---------- GLASS TITLE PANEL ---------- */
    const glassX = 80;
    const glassY = 260;
    const glassWidth = 435;
    const glassHeight = 130;

    // glass background
    doc
      .save()
      .roundedRect(glassX, glassY, glassWidth, glassHeight, 20)
      .fillOpacity(0.35)
      .fill("#ffffff")
      .restore();

    // glass border
    doc
      .roundedRect(glassX, glassY, glassWidth, glassHeight, 20)
      .lineWidth(1)
      .strokeColor("#ffffff");

    // title
    doc
      .font("Helvetica-Bold")
      .fontSize(26)
      .fillColor("#1f2937")
      .text(meta.title || "A Magical Storybook", glassX + 20, glassY + 32, {
        width: glassWidth - 40,
        align: "center",
      });

    // subtitle
    doc
      .font("Helvetica")
      .fontSize(13)
      .fillColor("#374151")
      .text(
        `A story for ${meta.childName || "Your Child"}`,
        glassX,
        glassY + 85,
        {
          width: glassWidth,
          align: "center",
        }
      );

    // footer
    doc
      .fontSize(10)
      .fillColor("#374151")
      .text("Created by Jr. Billionaire", 0, 760, {
        align: "center",
      });

    /* =====================================================
       📖 STORY PAGES — EXACT FLIPBOOK SPACING
    ====================================================== */
    for (let i = 0; i < pages.length; i++) {
      doc.addPage();

      // IMAGE (same size & padding as viewer)
      const imageX = 80;
      const imageY = 60;
      const imageWidth = 435;
      const imageHeight = 300;

      if (images[i]) {
        doc.image(images[i], imageX, imageY, {
          width: imageWidth,
          height: imageHeight,
        });
      }

      // STORY TEXT (no extra blank space)
      const textY = imageY + imageHeight + 26;

      doc
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#1f2937")
        .text(pages[i], imageX, textY, {
          width: imageWidth,
          align: "center",
          lineGap: 6,
        });

      // PAGE NUMBER (same page, bottom center)
      doc
        .fontSize(10)
        .fillColor("#9ca3af")
        .text(
          `${i + 1}`,
          0,
          doc.page.height - 50,
          { align: "center" }
        );
    }

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}
