import fs from "fs";
import path from "path";
import { extractVisualScenes } from "./sceneExtractor.service.js";
import { generateImages } from "./image.service.js";
import { generatePDF } from "./pdf.service.js";
import { sendStoryEmail } from "./email.service.js";

const outputDir = path.join("output");
const paymentsFile = path.join(outputDir, "payments.json");

/* ===============================
   🔐 PAYMENT HELPERS
================================ */

function ensureDir() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

function readPayments() {
  ensureDir();
  if (!fs.existsSync(paymentsFile)) return {};
  return JSON.parse(fs.readFileSync(paymentsFile));
}

function isAlreadyPaid(bookId) {
  const data = readPayments();
  return !!data[bookId];
}

function savePayment(orderId, bookId) {
  const data = readPayments();

  data[bookId] = {
    orderId,
    status: "PAID",
    time: new Date().toISOString(),
  };

  fs.writeFileSync(paymentsFile, JSON.stringify(data, null, 2));
}

/* ===============================
   💰 HANDLE PAYMENT (IDEMPOTENT)
================================ */

export async function handleOrderPaid(order) {
  const bookId =
    order.line_items
      ?.flatMap((item) => item.properties || [])
      ?.find((p) => p.name === "bookId")?.value;

  if (!bookId) {
    console.log("❌ bookId missing in order");
    return;
  }

  /* 🔁 IDEMPOTENCY CHECK */
  if (isAlreadyPaid(bookId)) {
    console.log("🔁 Payment already processed for:", bookId);
    return;
  }

  console.log("✅ PAYMENT RECEIVED:", bookId, order.email);

  /* ===============================
     1️⃣ SAVE PAYMENT FIRST (IMPORTANT)
  ================================ */
  savePayment(order.id, bookId);

  /* ===============================
     2️⃣ LOAD STORY FILES
  ================================ */
  const storyPath = path.join("stories", `${bookId}.json`);
  const inputPath = path.join("stories", `${bookId}.input.json`);

  if (!fs.existsSync(storyPath) || !fs.existsSync(inputPath)) {
    console.log("⚠️ Story files missing, payment still saved:", bookId);
    return;
  }

  const fullStoryPages = JSON.parse(fs.readFileSync(storyPath, "utf-8"));
  const inputData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  /* ===============================
     3️⃣ IMAGE GENERATION (SAFE)
     → TEST + REAL DONO ME GENERATE
  ================================ */
  const visualScenes = await extractVisualScenes(fullStoryPages);

  const imagesDir = path.join("images", bookId);
  const existingCount = fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir).filter((f) => f.endsWith(".png")).length
    : 0;

  if (existingCount < fullStoryPages.length) {
    await generateImages(
      visualScenes.slice(existingCount),
      fullStoryPages.slice(existingCount),
      {
        name: inputData.name,
        age: inputData.age,
        gender: inputData.gender,
      },
      bookId,
      { startIndex: existingCount }
    );
  } else {
    console.log("ℹ️ All images already exist for:", bookId);
  }

  /* ===============================
     4️⃣ GENERATE PDF (ONCE)
  ================================ */
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => path.join(imagesDir, f));

 if (imageFiles.length > 0) {
    await generatePDF(fullStoryPages, imageFiles, bookId, {
      title: inputData.title || "A Magical Storybook",
      childName: inputData.name || "Your Child",
    });

    // ✅ NEW: TRIGGER EMAIL AFTER PDF IS DONE
    console.log("📨 Attempting to send email...");
    // Use the email from the order payload (Shopify) or from your inputData
    const customerEmail = order.email || inputData.email; 
    
    if (customerEmail) {
        await sendStoryEmail(customerEmail, inputData.name, bookId);
    } else {
        console.log("❌ Could not find email to send PDF");
    }
  }

  console.log("✅ PAYMENT FLOW COMPLETE (ONCE ONLY):", bookId);
}
