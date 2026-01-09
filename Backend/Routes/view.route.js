import express from "express";
import fs from "fs";
import path from "path";
import { generatePDF } from "../Services/pdf.service.js";


const router = express.Router();
const paymentsFile = path.join("output", "payments.json");

router.get("/view/:bookId", async (req, res) => {
  const { bookId } = req.params;

  const testKey = req.query.testKey;
  const isTestUser = testKey === process.env.TEST_UNLOCK_KEY;

  if (!isTestUser) {
    if (!fs.existsSync(paymentsFile)) {
      return res.status(403).send("Payment required");
    }

    const payments = JSON.parse(fs.readFileSync(paymentsFile));
    if (!payments[bookId]) {
      return res.status(403).send("Payment required");
    }
  }

  try {
    const pdfPath = path.join("output", `${bookId}.pdf`);

    // 🔥 IF PDF NOT READY → GENERATE IT NOW
    if (!fs.existsSync(pdfPath)) {
      console.log("📄 PDF missing, generating now:", bookId);
      await generatePDF(bookId);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    fs.createReadStream(pdfPath).pipe(res);
  } catch (err) {
    console.error("❌ PDF serve failed:", err);
    res.status(500).send("Failed to generate PDF");
  }
});


export default router;
