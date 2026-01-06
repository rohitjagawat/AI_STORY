import fs from "fs";
import path from "path";
import { extractVisualScenes } from "./sceneExtractor.service.js";
import { generateImages } from "./image.service.js";
import { generatePDF } from "./pdf.service.js";

const outputDir = path.join("output");
const paymentsFile = path.join(outputDir, "payments.json");

function savePayment(orderId, bookId) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let data = {};
  if (fs.existsSync(paymentsFile)) {
    data = JSON.parse(fs.readFileSync(paymentsFile));
  }

  data[bookId] = {
    orderId,
    status: "PAID",
    time: new Date().toISOString(),
  };

  fs.writeFileSync(paymentsFile, JSON.stringify(data, null, 2));
}

export async function handleOrderPaid(order) {
  const bookId =
    order.line_items?.[0]?.properties?.find(
      (p) => p.name === "bookId"
    )?.value;

  if (!bookId) {
    console.log("❌ bookId missing in order");
    return;
  }

  console.log("✅ PAYMENT RECEIVED:", bookId, order.email);

  // 1️⃣ Save payment
  savePayment(order.id, bookId);

  /* ===============================
     🔥 POST-PAYMENT WORK
     (NO STORY REGENERATION)
  ================================ */

  const storyPath = path.join("stories", `${bookId}.json`);
  if (!fs.existsSync(storyPath)) {
    console.log("❌ Story not found:", bookId);
    return;
  }

  const fullStoryPages = JSON.parse(
    fs.readFileSync(storyPath, "utf-8")
  );

  const visualScenes = await extractVisualScenes(fullStoryPages);

  // 📸 Generate ONLY missing images
  const imagesDir = path.join("images", bookId);
  const existingCount = fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir).filter(f => f.endsWith(".png")).length
    : 0;

  const remainingPages = fullStoryPages.slice(existingCount);
  const remainingScenes = visualScenes.slice(existingCount);

  await generateImages(
    remainingScenes,
    remainingPages,
    {},
    bookId,
    { startIndex: existingCount }
  );

  // 📄 Generate PDF (uses existing + new images)
  await generatePDF(fullStoryPages, [], bookId);

  console.log("✅ PAYMENT FLOW COMPLETE (STORY UNCHANGED):", bookId);
}
