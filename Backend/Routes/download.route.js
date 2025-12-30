import express from "express";
import fs from "fs";
import path from "path";
import { hasPaidByEmail } from "../Services/payment.service.js";

const router = express.Router();

router.get("/:bookId", (req, res) => {
  const { bookId } = req.params;
  const { email } = req.query;

  if (!hasPaidByEmail(email)) {
    return res.status(403).json({ error: "Payment required" });
  }

  const filePath = path.join("output", `${bookId}.pdf`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "PDF not found" });
  }

  res.download(filePath);
});

export default router;
