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

  savePayment(order.id, bookId);


}
