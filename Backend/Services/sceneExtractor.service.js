import OpenAI from "openai";

export async function extractVisualScenes(storyPages) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
You are helping illustrate a children's picture book.

For EACH story page, extract ONE visual scene that DIRECTLY matches the actions and setting in the story text.
Do NOT invent new locations.
Do NOT change the environment.
If the page mentions school, the scene MUST be a school.
If it mentions home, the scene MUST be indoors at home.


Rules:
- Describe ONLY what can be SEEN
- Mention character actions, setting, background
- Avoid emotions unless visible
- No moral, no thoughts, no narration
- 1–2 short sentences per page
- Very concrete and visual

Return STRICT JSON array.
Length must be ${storyPages.length}.

Story pages:
${storyPages.map((p, i) => `Page ${i + 1}: ${p}`).join("\n")}
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  let raw = response.output_text.trim();
  raw = raw.replace(/^```json/, "").replace(/```$/, "");

  return JSON.parse(raw);
}
