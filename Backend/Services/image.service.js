import OpenAI from "openai";
import fs from "fs";
import path from "path";

/* ===============================
   CHARACTER LOCK
================================ */
const getCharacterProfile = ({ name, age, gender }) => {
  return `
Main character rules (CRITICAL):
- Human child ONLY (never animal, never fantasy creature)
- ${age}-year-old ${gender === "boy" ? "boy" : "girl"}
- Same face, same hairstyle, same body in ALL images
- Friendly expressive eyes
- Age-appropriate proportions
- Simple modern children clothing
- High-quality children's storybook illustration style
- CONSISTENCY is more important than creativity
`;
};

/* ===============================
   EMOTION BY PAGE
================================ */
const getEmotionForPage = (pageIndex) => {
  if (pageIndex <= 1) return "curious and calm";
  if (pageIndex <= 3) return "slightly worried but hopeful";
  if (pageIndex <= 5) return "confused or struggling";
  if (pageIndex <= 7) return "determined and trying hard";
  if (pageIndex === 8) return "confident and focused";
  if (pageIndex === 9) return "happy and relieved";
  return "peaceful, proud, and joyful";
};

/* ===============================
   IMAGE GENERATION
================================ */
export async function generateImages(
  visualScenes,
  pages,
  childProfile,
  bookId,
  options = {}
) {
  const startIndex = options.startIndex || 0;
  const folderPath = path.join("images", bookId);

  fs.mkdirSync(folderPath, { recursive: true });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const imagePaths = [];

  for (let i = 0; i < pages.length; i++) {
    const pageNumber = startIndex + i + 1;
    const imagePath = path.join(folderPath, `page_${pageNumber}.png`);

    // 🔒 DO NOT regenerate existing images
    if (fs.existsSync(imagePath)) {
      imagePaths.push(imagePath);
      continue;
    }

    const prompt = `
${getCharacterProfile(childProfile)}

Illustrate this exact scene from a children's picture book:

${visualScenes[i]}

Emotion:
${getEmotionForPage(pageNumber - 1)}

Illustration rules:
- Bright, warm colors
- Soft lighting
- Kid-friendly, wholesome
- Main character must be clearly visible
- Background must match the scene
- Environment details required
- No text, no letters, no speech bubbles
- No signs with text
- No animals unless mentioned
- No distortion, no extra limbs

Camera:
- Medium-wide shot
- Scene-focused composition
`;

    const result = await openai.images.generate({
      model: "gpt-image-1.5",
      prompt,
      size: "1024x1200",
    });

    fs.writeFileSync(
      imagePath,
      Buffer.from(result.data[0].b64_json, "base64")
    );

    imagePaths.push(imagePath);
    console.log(`🖼️ Image generated: page ${pageNumber}`);
  }

  return imagePaths;
}
