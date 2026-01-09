import fs from "fs";
import path from "path";

export function getPdfUrlByBookId(bookId) {
  const filePath = path.join("output", "pdf-map.json");

  if (!fs.existsSync(filePath)) return null;

  const data = JSON.parse(fs.readFileSync(filePath));
  return data[bookId];
}