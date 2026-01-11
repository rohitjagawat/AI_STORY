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

  // 🧪 TEST MODE: skip image + PDF generation
  if (process.env.TEST_MODE === "true") {
    console.log("🧪 TEST MODE: Shopify post-payment flow skipped");
    return;
  }
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

  const inputPath = path.join("stories", `${bookId}.input.json`);
  if (!fs.existsSync(inputPath)) {
    console.log("❌ Story input not found:", bookId);
    return;
  }

  const fullStoryPages = JSON.parse(
    fs.readFileSync(storyPath, "utf-8")
  );

  const input = JSON.parse(
    fs.readFileSync(inputPath, "utf-8")
  );

  const visualScenes = await extractVisualScenes(fullStoryPages);

  // 📸 COUNT EXISTING IMAGES
  const imagesDir = path.join("images", bookId);
  const existingCount = fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir).filter(f => f.endsWith(".png")).length
    : 0;

  // 🛑 IF ALL IMAGES ALREADY GENERATED
  if (existingCount >= fullStoryPages.length) {
    console.log("ℹ️ All images already exist, skipping generation");
  } else {
    // 🖼️ GENERATE ONLY REMAINING IMAGES
    await generateImages(
      visualScenes.slice(existingCount),
      fullStoryPages.slice(existingCount),
      {
        name: input.name,
        age: input.age,
        gender: input.gender,
      },
      bookId,
      { startIndex: existingCount }
    );
  }

  // 📄 COLLECT ALL IMAGE PATHS (ORDERED)
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => path.join(imagesDir, f));

  // 📄 GENERATE PDF USING ALL IMAGES
  await generatePDF(fullStoryPages, imageFiles, bookId);

  console.log("✅ PAYMENT FLOW COMPLETE (STORY + IMAGES CONSISTENT):", bookId);
}
