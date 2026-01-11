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

    /* ===============================
       COVER PAGE (FULL PAGE)
    ================================ */
    if (images[0]) {
      doc.image(images[0], {
        fit: [515, 720],
        align: "center",
        valign: "center",
      });
    }

    // Glass-style overlay text
    doc
      .rect(40, 250, 515, 160)
      .fillOpacity(0.45)
      .fill("#000000");

    doc.fillOpacity(1);

    doc
      .fontSize(28)
      .fillColor("#ffffff")
      .text(meta.title || "A Magical Storybook", 60, 285, {
        width: 475,
        align: "center",
      });

    doc
      .moveDown()
      .fontSize(14)
      .fillColor("#ffffff")
      .text(`A story for ${meta.childName || "Your Child"}`, {
        align: "center",
      });

    doc
      .fontSize(10)
      .fillColor("#ffffff")
      .text("Created by Jr. Billionaire", 0, 730, {
        align: "center",
      });

    /* ===============================
       STORY SPREADS (LEFT + RIGHT)
    ================================ */
    let pageIndex = 0;

    while (pageIndex < pages.length) {
      doc.addPage();

      const leftX = 40;
      const rightX = 40 + 250 + 15;

      const imageY = 60;
      const imageWidth = 250;
      const imageHeight = 300;

      const textY = imageY + imageHeight + 20;
      const textWidth = 250;

      /* -------- LEFT PAGE -------- */
      if (images[pageIndex]) {
        doc.image(images[pageIndex], leftX, imageY, {
          width: imageWidth,
          height: imageHeight,
        });
      }

      doc
        .fontSize(13)
        .fillColor("#333333")
        .text(pages[pageIndex], leftX, textY, {
          width: textWidth,
          align: "center",
          lineGap: 6,
        });

      doc
        .fontSize(10)
        .fillColor("#999999")
        .text(`${pageIndex + 1}`, leftX, 770, {
          width: textWidth,
          align: "center",
        });

      /* -------- RIGHT PAGE -------- */
      if (pageIndex + 1 < pages.length) {
        if (images[pageIndex + 1]) {
          doc.image(images[pageIndex + 1], rightX, imageY, {
            width: imageWidth,
            height: imageHeight,
          });
        }

        doc
          .fontSize(13)
          .fillColor("#333333")
          .text(pages[pageIndex + 1], rightX, textY, {
            width: textWidth,
            align: "center",
            lineGap: 6,
          });

        doc
          .fontSize(10)
          .fillColor("#999999")
          .text(`${pageIndex + 2}`, rightX, 770, {
            width: textWidth,
            align: "center",
          });
      }

      pageIndex += 2;
    }

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}
