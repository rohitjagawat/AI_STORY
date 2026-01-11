import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generatePDF(
  pages,
  imagePaths,
  bookId,
  options = {}
) {
  const { title = "A Magical Storybook", childName = "Your Child" } = options;

  const outputDir = path.join("output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.join(outputDir, `${bookId}.pdf`);
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
  });

  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  /* ===============================
     📘 COVER PAGE
  ================================ */
  if (imagePaths[0] && fs.existsSync(imagePaths[0])) {
    doc.image(imagePaths[0], 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });
  }

  // Dark overlay
  doc.rect(0, 0, doc.page.width, doc.page.height)
    .fillOpacity(0.35)
    .fill("black")
    .fillOpacity(1);

  // Title
  doc
    .fillColor("white")
    .fontSize(32)
    .font("Helvetica-Bold")
    .text(title, 60, doc.page.height / 2 - 40, {
      align: "center",
      width: doc.page.width - 120,
    });

  doc
    .moveDown(1)
    .fontSize(16)
    .font("Helvetica")
    .text(`A story for ${childName}`, {
      align: "center",
    });

  doc
    .fontSize(10)
    .fillColor("white")
    .text("Created by Jr. Billionaire", 0, doc.page.height - 60, {
      align: "center",
    });

  /* ===============================
     📖 STORY PAGES
  ================================ */
  for (let i = 0; i < pages.length; i++) {
    doc.addPage();

    // Header
    doc
      .fillColor("#666")
      .fontSize(12)
      .font("Helvetica")
      .text(`${childName}’s Story`, 0, 20, {
        align: "center",
      });

    /* IMAGE */
    const imgPath = imagePaths[i];
    if (imgPath && fs.existsSync(imgPath)) {
      doc.image(imgPath, 60, 50, {
        fit: [doc.page.width - 120, 300],
        align: "center",
      });
    }

    /* STORY TEXT (STRICT BOX → no blank space) */
    doc
      .fillColor("#333")
      .fontSize(14)
      .font("Helvetica")
      .text(pages[i], 80, 370, {
        width: doc.page.width - 160,
        align: "center",
        lineGap: 4,
      });

    /* PAGE NUMBER */
    doc
      .fontSize(10)
      .fillColor("#999")
      .text(`${i + 1}`, 0, doc.page.height - 50, {
        align: "center",
      });
  }

  doc.end();

  return new Promise((resolve) => {
    stream.on("finish", () => resolve(pdfPath));
  });
}
