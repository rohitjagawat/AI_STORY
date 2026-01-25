import OpenAI from "openai";
import fs from "fs";
import path from "path";

const IS_TEST_MODE = process.env.TEST_MODE === "true";
const MAX_TEST_IMAGES = 2; // 👈 TEST MODE LIMIT

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

  const limit = IS_TEST_MODE
  ? Math.min(MAX_TEST_IMAGES, pages.length)
  : pages.length;


  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const imagePaths = [];

 for (let i = 0; i < limit; i++) {
 const pageNumber = String(startIndex + i + 1).padStart(2, "0");
const imagePath = path.join(folderPath, `page_${pageNumber}.png`);

  // ♻️ REUSE IMAGE IF EXISTS
  if (fs.existsSync(imagePath)) {
    console.log(`♻️ Reusing image page ${pageNumber}`);
    imagePaths.push(imagePath);
    continue;
  }

  // 🧪 EXTRA SAFETY (TEST MODE)
  if (IS_TEST_MODE && i >= MAX_TEST_IMAGES) {
    console.log("🧪 TEST MODE: image generation stopped");
    break;
  }

 const prompt = `
${getCharacterProfile(childProfile)}

⚠️ VERY IMPORTANT:
This illustration MUST match the story page EXACTLY.
Do NOT change the location, setting, or activity.
Do NOT invent new places.

STORY PAGE TEXT (GROUND TRUTH):
"${pages[i]}"

VISUAL SCENE TO ILLUSTRATE:
${visualScenes[i]}

STRICT RULES:
- The environment MUST match the story page
- If the story mentions school, show a classroom or school area
- If the story mentions home, show an indoor home setting
- If the story mentions outdoors, match that exact outdoor place
- NEVER mix locations
- NEVER replace activities
- No fantasy unless mentioned
- No unrelated backgrounds

Emotion (only if visible):
${getEmotionForPage(pageNumber - 1)}

Illustration style:
- Bright, warm colors
- Soft lighting
- Children's storybook illustration
- High consistency with previous pages
- No text, no letters, no speech bubbles
`;


 const result = await openai.images.generate({
  model: "gpt-image-1.5",
  prompt,
  size: "1024x1024",
  quality: "medium", // "low" | "medium" | "high"
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
