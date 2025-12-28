import OpenAI from "openai";
import fs from "fs";

const STORY_DIR = "stories";

export async function generateStory(name, age, interest, bookId) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
Write a children's story of exactly 10 pages.

Main character:
Name: ${name}
Age: ${age}
Interest: ${interest}

Rules:
- Child is the hero
- Simple language
- Each page 5–6 lines
- Page 10 must include a Moral

Format STRICTLY like this:

Page 1:
text

Page 2:
text

Page 3:
text

Page 4:
text

Page 5:
text

Page 6:
text

Page 7:
text

Page 8:
text

Page 9:
text

Page 10:
text
`;

  let rawText;

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    rawText = response.output_text;
  } catch (err) {
    console.error("OpenAI failed, using fallback story");

    rawText = `
Page 1:
${name} was a happy child who loved ${interest}.

Page 2:
One day, ${name} found something magical.

Page 3:
The adventure was full of fun and learning.

Page 4:
Friends helped along the journey.

Page 5:
${name} felt brave and confident.

Page 6:
Challenges made ${name} stronger.

Page 7:
Kindness solved many problems.

Page 8:
Everyone celebrated together.

Page 9:
The journey came to an end.

Page 10:
Moral: Always believe in yourself.
`;
  }

  // ✅ SAFE PARSING — NO DUPLICATES POSSIBLE
  const pages = [];
  const matches = rawText.match(/Page\s*\d+:\s*([\s\S]*?)(?=Page\s*\d+:|$)/gi);

  if (matches) {
    for (const page of matches) {
      const cleanText = page.replace(/Page\s*\d+:/i, "").trim();
      pages.push(cleanText);
    }
  }

  console.log("STORY PAGES COUNT:", pages.length);

  if (!fs.existsSync(STORY_DIR)) {
    fs.mkdirSync(STORY_DIR);
  }

  fs.writeFileSync(
    `${STORY_DIR}/${bookId}.json`,
    JSON.stringify(pages, null, 2)
  );

  return pages;
}

export function loadStory(bookId) {
  const filePath = `${STORY_DIR}/${bookId}.json`;
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return null;
}
