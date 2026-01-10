import puppeteer from "puppeteer";
import path from "path";

export async function generatePDF(bookId) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto(
    `http://localhost:8080/pdf-view/${bookId}`,
    { waitUntil: "networkidle0", timeout: 0 }
  );

  const pdfPath = path.join("output", `${bookId}.pdf`);

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
}
