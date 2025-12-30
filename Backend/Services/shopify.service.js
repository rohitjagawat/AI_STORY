import fs from "fs";
import path from "path";

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

export function handleOrderPaid(order) {
  const orderId = order.id;

  // 🔑 VERY IMPORTANT
  // product ke saath bookId pass karna hota hai (line item note)
  const bookId =
    order.note_attributes?.find((n) => n.name === "bookId")?.value;

  if (!bookId) {
    console.log("❌ bookId missing in order");
    return;
  }

  console.log("✅ PAYMENT RECEIVED FOR BOOK:", bookId);
  savePayment(orderId, bookId);
}
