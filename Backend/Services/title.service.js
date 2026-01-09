import OpenAI from "openai";

export async function generateTitle({
  name,
  age,
  interest,
  challenges = [],
}) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
You are a children's storybook author.

Generate ONE short, magical, premium storybook title.

Rules:
- Must sound like a real printed book
- Must include the child’s name (${name})
- Must be inspired by the child’s interest (${interest})
- Age: ${age}
- Emotional, warm, inspiring
- No emojis
- No quotes
- Max 10 words

Return ONLY the title.
`;

  const res = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  return res.output_text.trim();
}
