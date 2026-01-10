import fs from "fs";
import path from "path";

export function getPdfUrlByBookId(bookId) {
  const filePath = path.join("output", "pdf-map.json");

  if (!fs.existsSync(filePath)) return null;

  const data = JSON.parse(fs.readFileSync(filePath));
  return data[bookId];
}

const template = fs.readFileSync(
  path.join("templates", "story-pdf.html"),
  "utf8"
);

export function buildPDFHtml({ title, childName, bookId, pages }) {
  const pagesHTML = pages.map((text, i) => `
    <div class="page">
      <div class="child-name">${childName}’s Story</div>

      <div class="img-wrap">
       <img src="{{BASE_URL}}/images/${bookId}/page_${i + 1}.png"
     onerror="this.src='{{BASE_URL}}/images/${bookId}/page_1.png'" />


      </div>

      <div class="text">${text}</div>
      <div class="page-no">${i + 1}</div>
    </div>
  `).join("");

  return template
    .replace("{{TITLE}}", title)
    .replace("{{CHILD_NAME}}", childName)
    .replace("{{COVER_IMAGE}}", `{{BASE_URL}}/images/${bookId}/page_1.png`)
    .replace("{{PAGES}}", pagesHTML);
}
