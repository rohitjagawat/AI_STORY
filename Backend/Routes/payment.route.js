import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const paymentsFile = path.join("output", "payments.json");

router.get("/has-paid", (req, res) => {
  const { bookId } = req.query;

  if (!bookId || !fs.existsSync(paymentsFile)) {
    return res.json({ paid: false });
  }

  const data = JSON.parse(fs.readFileSync(paymentsFile));
  res.json({ paid: !!data[bookId] });
});

export default router;
