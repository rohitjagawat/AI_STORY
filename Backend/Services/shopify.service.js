import fs from "fs";
import path from "path";

const paymentsFile = path.join("output", "payments.json");

function savePayment(orderId, email) {
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
