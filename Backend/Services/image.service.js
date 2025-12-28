import OpenAI from "openai";
import fs from "fs";
import path from "path";

export async function generateImages(pages, childName, bookId) {
  const folderPath = path.join("images", bookId);

  // ♻️ TRY REUSE FIRST
  if (fs.existsSync(folderPath)) {
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith(".png"))
      .sort();

    if (files.length > 0) {
      console.log("♻️ Reusing existing images");
      return files.map((f) => path.join(folderPath, f));
    }
  }

  // 🆕 NO IMAGE FOUND → GENERATE ONE (TEST MODE)
  console.log("🆕 No images found, generating ONE image for testing");

  fs.mkdirSync(folderPath, { recursive: true });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
Children's storybook illustration ONLY.
Main character: ${childName}
Cartoon style, kid-friendly, bright colors.

Scene description (visual only):
${pages[0]}

IMPORTANT:
Do NOT include any text, words, letters, captions, speech bubbles, quotes, signs, or writing anywhere in the image.
Illustration only. No typography.
`;

  const result = await openai.images.generate({
    model: "gpt-image-1.5",
    prompt,
    size: "1024x1024",
  });

  const imagePath = path.join(folderPath, "page_1.png");

  fs.writeFileSync(
    imagePath,
    Buffer.from(result.data[0].b64_json, "base64")
  );

  console.log("🖼️ Test image generated (NO TEXT SAFE)");

  // 🔁 RETURN SINGLE IMAGE (will be reused for all pages)
  return [imagePath];
}
