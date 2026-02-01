import fs from "fs";
import path from "path";
import { extractVisualScenes } from "./sceneExtractor.service.js";
import { generateImages } from "./image.service.js";
import { generatePDF } from "./pdf.service.js";
import { sendBookEmail } from "./email.service.js"; // 👈 Added this

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
  try {
    return JSON.parse(fs.readFileSync(paymentsFile));
  } catch (e) {
    return {};
  }
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
  const bookId = order.line_items
    ?.flatMap((item) => item.properties || [])
    ?.find((p) => p.name === "bookId")?.value;

  if (!bookId) {
    console.log("❌ bookId missing in order metadata");
    return;
  }

  /* 🔁 IDEMPOTENCY CHECK */
  if (isAlreadyPaid(bookId)) {
    console.log("🔁 Payment already processed for:", bookId);
    return;
  }

  console.log("✅ PAYMENT RECEIVED:", bookId, order.email);

  /* ===============================
      1️⃣ LOAD STORY FILES
  ================================ */
  const storyPath = path.join("stories", `${bookId}.json`);
  const inputPath = path.join("stories", `${bookId}.input.json`);

  if (!fs.existsSync(storyPath) || !fs.existsSync(inputPath)) {
    console.log("⚠️ Story files missing, cannot process PDF:", bookId);
    return;
  }

  const fullStoryPages = JSON.parse(fs.readFileSync(storyPath, "utf-8"));
  const inputData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  /* ===============================
      2️⃣ SAVE PAYMENT (MARK AS PROCESSING)
  ================================ */
  savePayment(order.id, bookId);

  /* ===============================
      3️⃣ IMAGE GENERATION
  ================================ */
  const visualScenes = await extractVisualScenes(fullStoryPages);
  const imagesDir = path.join("images", bookId);
  
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  const existingCount = fs.readdirSync(imagesDir).filter((f) => f.endsWith(".png")).length;

  if (existingCount < fullStoryPages.length) {
    console.log(`🖼️ Generating missing images (${existingCount}/${fullStoryPages.length})...`);
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
  }

  /* ===============================
      4️⃣ GENERATE PDF
  ================================ */
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => path.join(imagesDir, f));

  if (imageFiles.length > 0) {
    console.log("📄 Creating PDF...");
    await generatePDF(fullStoryPages, imageFiles, bookId, {
      title: inputData.title || "A Magical Storybook",
      childName: inputData.name || "Your Child",
    });

    /* ===============================
        5️⃣ SEND EMAIL (FINAL STEP) 🚀
    ================================ */
    try {
      // Prioritize email from user form, fallback to Shopify order email
      const recipientEmail = inputData.email || order.email;
      const childName = inputData.name || "Your Child";

      console.log(`📧 Attempting to send PDF to ${recipientEmail}...`);
      await sendBookEmail(recipientEmail, childName, bookId);
      console.log("✨ PDF Email delivery successful!");
    } catch (emailErr) {
      console.error("❌ Email service failed, but PDF is generated:", emailErr.message);
    }
  }

  console.log("✅ PAYMENT FLOW COMPLETE:", bookId);
}