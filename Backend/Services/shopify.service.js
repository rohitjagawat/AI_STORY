import fs from "fs";
import path from "path";

const outputDir = path.join("output");
const paymentsFile = path.join(outputDir, "payments.json");

function savePayment(orderId, email) {
  // ✅ ensure folder exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let data = {};

  if (fs.existsSync(paymentsFile)) {
    data = JSON.parse(fs.readFileSync(paymentsFile));
  }

  data[orderId] = {
    email,
    status: "PAID",
    time: new Date().toISOString(),
  };

  fs.writeFileSync(paymentsFile, JSON.stringify(data, null, 2));
}

export function handleOrderPaid(order) {
  const orderId = order.id;
  const email = order.email;

  console.log("✅ PAYMENT RECEIVED", orderId, email);
  savePayment(orderId, email);
}
