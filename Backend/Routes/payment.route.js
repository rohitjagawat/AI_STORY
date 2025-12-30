import express from "express";
import { hasPaidForBook } from "../Services/payment.service.js";

const router = express.Router();

router.get("/has-paid", (req, res) => {
  const { bookId } = req.query;
  if (!bookId) return res.json({ paid: false });

  res.json({ paid: hasPaidForBook(bookId) });
});

export default router;
