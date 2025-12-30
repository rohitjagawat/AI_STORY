import fs from "fs";
import path from "path";

const paymentsFile = path.join("output", "payments.json");

export function hasPaidForBook(bookId) {
  if (!fs.existsSync(paymentsFile)) return false;

  const data = JSON.parse(fs.readFileSync(paymentsFile));
  return data[bookId]?.status === "PAID";
}
