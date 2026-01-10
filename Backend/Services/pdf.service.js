import puppeteer from "puppeteer";
import path from "path";

export async function generatePDF(storyPages, imageFiles, bookId) {
  // 1. Chupke se ek browser kholega
 const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome', // Railway Nixpacks default path
  headless: "new",
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--single-process'
  ]
});
  
  const page = await browser.newPage();

  // 2. Aapke Vercel wale "Print" page par jayega
  // Yahan apna Vercel link daalna
  const url = `https://ai-story-sage.vercel.app/print/${bookId}`;
  
  await page.goto(url, { waitUntil: "networkidle0" }); // Jab tak photo load na ho, ruko

  // 3. Page ko PDF ki tarah save karega
  const pdfPath = path.join("output", `${bookId}.pdf`);
  await page.pdf({ 
    path: pdfPath, 
    format: "A4", 
    printBackground: true // Colors ke liye zaroori hai
  });

  await browser.close();
  return pdfPath;
}