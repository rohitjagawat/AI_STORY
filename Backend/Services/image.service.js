import OpenAI from "openai";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";

export async function generateImages(pages, childName, bookId) {
  console.log("🎨 Generating image and uploading to Cloudinary");

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

  // 1️⃣ Generate image from OpenAI
  const result = await openai.images.generate({
    model: "gpt-image-1.5",
    prompt,
    size: "1024x1024",
  });

  // 2️⃣ Save temporarily (required for Cloudinary upload)
  const tempDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const tempImagePath = path.join(tempDir, `${bookId}_page_1.png`);

  fs.writeFileSync(
    tempImagePath,
    Buffer.from(result.data[0].b64_json, "base64")
  );

  // 3️⃣ Upload to Cloudinary
  const upload = await cloudinary.uploader.upload(tempImagePath, {
    folder: `ai_story/${bookId}`,
  });

  // 4️⃣ Cleanup temp file
  fs.unlinkSync(tempImagePath);

  console.log("✅ Image uploaded to Cloudinary");

  // 5️⃣ RETURN CLOUDINARY URL
  return [upload.secure_url];
}
