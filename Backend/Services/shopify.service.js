import fs from "fs";
import path from "path";
import { generateStory } from "./story.service.js";
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

  const customerEmail = order.email;
  console.log("✅ PAYMENT RECEIVED:", bookId, customerEmail);

  // 1️⃣ SAVE PAYMENT (existing logic)
  savePayment(order.id, bookId);

  /* ===============================
     🔥 COMPLETE STORY AFTER PAYMENT
  ================================ */

  const storyPath = path.join("stories", `${bookId}.json`);
  if (!fs.existsSync(storyPath)) {
    console.log("❌ Partial story not found:", bookId);
    return;
  }

  const inputPath = path.join("stories", `${bookId}.input.json`);
  if (!fs.existsSync(inputPath)) {
    console.log("❌ Story input not found:", bookId);
    return;
  }

  const input = JSON.parse(fs.readFileSync(inputPath));

  // 2️⃣ GENERATE FULL STORY (10 pages)
  const fullStoryPages = await generateStory(
    input,
    bookId,
    { pageLimit: 10 }
  );

  // 3️⃣ GENERATE IMAGES
  const visualScenes = await extractVisualScenes(fullStoryPages);

  const images = await generateImages(
    visualScenes,
    fullStoryPages,
    {
      name: input.name,
      age: input.age,
      gender: input.gender,
    },
    bookId
  );

  // 4️⃣ GENERATE PDF
  await generatePDF(fullStoryPages, images, bookId);

  console.log("✅ FULL STORY + PDF GENERATED:", bookId);
}
