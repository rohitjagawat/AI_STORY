import express from "express";
import fs from "fs";
import path from "path";
import { hasPaidForBook } from "../Services/payment.service.js";

const router = express.Router();

router.get("/:bookId", (req, res) => {
  const { bookId } = req.params;

  const testKey = req.query.testKey;
  const isTestUser = testKey === process.env.TEST_UNLOCK_KEY;

  if (!isTestUser && !hasPaidForBook(bookId)) {
    return res.status(403).json({ error: "Payment required" });
  }

  const filePath = path.join("output", `${bookId}.pdf`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "PDF not found" });
  }

  res.download(filePath);
});


export default router;
