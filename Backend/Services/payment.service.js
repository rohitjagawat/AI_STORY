import fs from "fs";
import path from "path";

const paymentsFile = path.join("output", "payments.json");

export function hasPaidByEmail(email) {
  if (!fs.existsSync(paymentsFile)) return false;

  const data = JSON.parse(fs.readFileSync(paymentsFile));
  return Object.values(data).some(
    (p) => p.email === email && p.status === "PAID"
  );
}
