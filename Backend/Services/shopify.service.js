import fs from "fs";
import path from "path";
import { extractVisualScenes } from "./sceneExtractor.service.js";
import { generateImages } from "./image.service.js";
import { generatePDF } from "./pdf.service.js";

const outputDir = path.join("output");
const paymentsFile = path.join(outputDir, "payments.json");

/* ================= SAVE PAYMENT ================= */
function savePayment(orderId, bookId) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let data = {};
  if (fs.existsSync(paymentsFile)) {
    data = JSON.parse(fs.readFileSync(paymentsFile, "utf-8"));
  }

  data[bookId] = {
    orderId,
    status: "PAID",
    time: new Date().toISOString(),
  };

  fs.writeFileSync(paymentsFile, JSON.stringify(data, null, 2));
}

/* ================= PAYMENT HANDLER ================= */
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

  /* ===== 1️⃣ SAVE PAYMENT ===== */
  savePayment(order.id, bookId);

  /* ===== 2️⃣ LOAD STORY FILES ===== */
  const storyPath = path.join("stories", `${bookId}.json`);
  const inputPath = path.join("stories", `${bookId}.input.json`);

  if (!fs.existsSync(storyPath)) {
    console.log("❌ Story not found:", bookId);
    return;
  }

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

  /* ===== 3️⃣ EXTRACT VISUAL SCENES ===== */
  const visualScenes = await extractVisualScenes(fullStoryPages);

  /* ===== 4️⃣ IMAGE GENERATION (SAFE / PARTIAL) ===== */
  const imagesDir = path.join("images", bookId);

  const existingCount = fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir).filter((f) => f.endsWith(".png")).length
    : 0;

  if (existingCount >= fullStoryPages.length) {
    console.log("ℹ️ All images already exist, skipping generation");
  } else {
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

  /* ===== 5️⃣ COLLECT ALL IMAGE PATHS (ORDERED) ===== */
  if (!fs.existsSync(imagesDir)) {
    console.log("❌ Images directory missing:", imagesDir);
    return;
  }

  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => path.join(imagesDir, f));

  if (!imageFiles.length) {
    console.log("❌ No images found for PDF:", bookId);
    return;
  }

  /* ===== 🧪 TEST MODE IMAGE FALLBACK (PDF CHECK KE LIYE) ===== */
if (imageFiles.length < fullStoryPages.length) {
  console.log(
    `🧪 TEST MODE: Only ${imageFiles.length} images found, reusing images for PDF preview`
  );

  const fallbackImages = [...imageFiles];

  while (fallbackImages.length < fullStoryPages.length) {
    fallbackImages.push(imageFiles[0]); // reuse first image
  }

  imageFiles.length = 0;
  imageFiles.push(...fallbackImages);
}

  /* ===== 6️⃣ GENERATE PDF (🔥 COVER = FIRST IMAGE 🔥) ===== */
  await generatePDF({
    storyPages: fullStoryPages,
    imagePaths: imageFiles,

    // ✅ COVER IMAGE = FIRST STORY IMAGE
    coverImage: imageFiles[0],

    title: `${input.name}'s Magical Story`,
    subtitle: `A story for ${input.name}`,
    bookId,
  });

  console.log("✅ PAYMENT FLOW COMPLETE → PDF READY:", bookId);
}
