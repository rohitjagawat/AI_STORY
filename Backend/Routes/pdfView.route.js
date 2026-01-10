import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/pdf-view/:bookId", (req, res) => {
  const { bookId } = req.params;

  const storyPath = path.join("stories", `${bookId}.json`);
  const metaPath = path.join("stories", `${bookId}.meta.json`);

  if (!fs.existsSync(storyPath)) {
    return res.status(404).send("Story not found");
  }

  const pages = JSON.parse(fs.readFileSync(storyPath));
  const meta = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath))
    : {};

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
@page { margin: 0; }
body { margin: 0; font-family: serif; }

.page {
  width: 794px;
  height: 1123px;
  page-break-after: always;
  position: relative;
}

.cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-card {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(10px);
  padding: 32px;
  border-radius: 20px;
  color: white;
  text-align: center;
  width: 70%;
}

.story {
  padding: 32px;
  background: #fffaf0;
}

.story img {
  width: 100%;
  height: 420px;
  object-fit: cover;
  border-radius: 16px;
}

.text {
  margin-top: 24px;
  font-size: 18px;
  line-height: 1.6;
  text-align: center;
}
</style>
</head>

<body>

<div class="page cover">
  <img src="/images/${bookId}/page_1.png" />
  <div class="cover-card">
    <h1>${meta.title}</h1>
    <p>A story for ${meta.childName || ""}</p>
  </div>
</div>

${pages.map((t, i) => `
<div class="page story">
  <img src="/images/${bookId}/page_${i + 1}.png" />
  <div class="text">${t}</div>
</div>
`).join("")}

</body>
</html>
`);
});

export default router;
