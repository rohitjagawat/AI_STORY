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
export async function generateImages(pages, childProfile, bookId) {
  const folderPath = path.join("images", bookId);

  // ♻️ REUSE IF EXISTS
  if (fs.existsSync(folderPath)) {
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith(".png"))
      .sort();

    if (files.length === pages.length) {
      console.log("♻️ Reusing existing images");
      return files.map((f) => path.join(folderPath, f));
    }
  }

  console.log("🆕 Generating story images");

  fs.mkdirSync(folderPath, { recursive: true });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const imagePaths = [];
for (let i = 0; i < pages.length; i++) {  // for generating all the image

//  for (let i = 0; i < Math.min(1, pages.length); i++) {  // for testing phase

    const prompt = `
${getCharacterProfile(childProfile)}

Scene (visual interpretation of the story page):
${pages[i]}

Emotion:
${getEmotionForPage(i)}

Illustration rules:
- Bright, warm colors
- Soft lighting
- Kid-friendly, wholesome
- Main character must be clearly visible
- Background should match the story scene
- Include environment details (room, school, park, playground, home, etc.)
- Scene should feel alive and contextual
- No text, no words, no letters
- No speech bubbles
- No signs or symbols with text
- No animals unless explicitly required by scene
- No distortion, no extra limbs


Camera:
- Medium shot
- Clear facial expression
`;

    const result = await openai.images.generate({
      model: "gpt-image-1.5",
      prompt,
      size: "1024x1024",
    });

    const imagePath = path.join(folderPath, `page_${i + 1}.png`);

    fs.writeFileSync(
      imagePath,
      Buffer.from(result.data[0].b64_json, "base64")
    );

    imagePaths.push(imagePath);
    console.log(`🖼️ Image generated: page ${i + 1}`);
  }

  return imagePaths;
}
