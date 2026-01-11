import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const IS_TEST_MODE = process.env.TEST_MODE === "true";

if (IS_TEST_MODE) {
  console.log("🧪 TEST MODE: PDF using available images only");
}

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
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    /* ===============================
       COVER PAGE
    ================================ */
    doc
      .image(images[0], {
        fit: [500, 650],
        align: "center",
        valign: "center",
      });

    doc
      .fontSize(28)
      .fillColor("#ffffff")
      .text(meta.title || "A Magical Storybook", 0, 280, {
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
      .text("Created by Jr. Billionaire", 0, 720, {
        align: "center",
      });

    /* ===============================
       STORY PAGES (1 PAGE = IMAGE + TEXT + NUMBER)
    ================================ */
    for (let i = 0; i < pages.length; i++) {
      doc.addPage();

      // IMAGE
      if (images[i]) {
        doc.image(images[i], {
          fit: [480, 320],
          align: "center",
          valign: "top",
        });
      }

      // STORY TEXT
      doc
        .moveDown(1.5)
        .fontSize(14)
        .fillColor("#333333")
        .text(pages[i], {
          align: "center",
          width: 420,
        });

      // PAGE NUMBER (BOTTOM CENTER)
      doc
        .fontSize(10)
        .fillColor("#999999")
        .text(
          `${i + 1}`,
          0,
          doc.page.height - 60,
          { align: "center" }
        );
    }

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}
