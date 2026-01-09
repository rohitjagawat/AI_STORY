import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const paymentsFile = path.join("output", "payments.json");

router.get("/view/:bookId", (req, res) => {
  const { bookId } = req.params;

  // 🔓 TEST UNLOCK (FOR YOU ONLY)
  const testKey = req.query.testKey;
  const isTestUser = testKey === process.env.TEST_UNLOCK_KEY;

  if (!isTestUser) {
    // 🔐 NORMAL PAYMENT CHECK
    if (!fs.existsSync(paymentsFile)) {
      return res.status(403).send("Payment required");
    }

    const payments = JSON.parse(fs.readFileSync(paymentsFile));
    if (!payments[bookId]) {
      return res.status(403).send("Payment required");
    }
  }

  // 📄 SERVE PDF
  const pdfPath = path.join("output", `${bookId}.pdf`);
  if (!fs.existsSync(pdfPath)) {
    return res.status(404).send("PDF not found");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  fs.createReadStream(pdfPath).pipe(res);
});

export default router;
