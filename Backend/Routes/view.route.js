import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/view/:bookId", (req, res) => {
  const { bookId } = req.params;

  const pdfPath = path.join("output", `${bookId}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    return res.status(404).send("PDF not found");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline"); // 👈 VIEW in browser

  fs.createReadStream(pdfPath).pipe(res);
});

export default router;
