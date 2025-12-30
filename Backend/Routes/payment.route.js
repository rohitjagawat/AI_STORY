import express from "express";
import { hasPaidByEmail } from "../Services/payment.service.js";

const router = express.Router();

router.get("/has-paid", (req, res) => {
  const { email } = req.query;

  if (!email) return res.json({ paid: false });

  const paid = hasPaidByEmail(email);
  res.json({ paid });
});

export default router;
