import OpenAI from "openai";
import fs from "fs";
import path from "path";

export async function generateRemainingImagePrompts(storyPages, bookId) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
You are illustrating a children's storybook.

Page 1 illustration is already generated.

For Pages 2 to 10, write ONE detailed illustration prompt per page.
Keep:
- Same main character
- Same art style
- Kid-friendly cartoon style
- Bright colors

Return EXACTLY 9 prompts as a JSON array (for Page 2 to Page 10).
No extra text.

Story pages:
${storyPages.slice(1).map((p, i) => `Page ${i + 2}: ${p}`).join("\n")}
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  let raw = response.output_text.trim();

// remove ```json or ``` if present
raw = raw.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();

const imagePrompts = JSON.parse(raw);


  const dir = "prompts";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

 fs.writeFileSync(
  `${dir}/${bookId}_remaining_image_prompts.json`,
  JSON.stringify(imagePrompts, null, 2)
);

return imagePrompts;

}
