import OpenAI from "openai";
import fs from "fs";

const STORY_DIR = "stories";

export async function generateStory(input, bookId) {
  const {
    name,
    age,
    gender,
    interest,
    challenges = [],
    siblingName,
    additionalInfo,
  } = input;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const challengeText =
    challenges.length > 0
      ? `The story gently explores these themes through situations and actions: ${challenges.join(
        ", "
      )}.`
      : "";

  const siblingText = siblingName
    ? `The child has a sibling named ${siblingName}, who appears as a supportive and caring character.`
    : "";

  const additionalContext = additionalInfo
    ? `Additional background from the parent: ${additionalInfo}`
    : "";


  let ageTone = "";

  if (age <= 5) {
    ageTone = `
LANGUAGE STYLE:
- Very simple sentences
- Repetition is okay
- Focus on actions and feelings
- Gentle, cozy, reassuring tone
`;
  } else if (age <= 8) {
    ageTone = `
LANGUAGE STYLE:
- Simple but expressive sentences
- Include feelings and small decisions
- Curious and adventurous tone
`;
  } else {
    ageTone = `
LANGUAGE STYLE:
- More descriptive language
- Show inner thoughts
- Confident and empowering tone
`;
  }

  const prompt = `
You are writing a children's storybook.

Main character:
- Name: ${name}
- Age: ${age}
- Gender: ${gender}
- Interest: ${interest}
${ageTone}

${challengeText}
${siblingText}
${additionalContext}

IMPORTANT RULES:
- Do NOT lecture, teach, or explain morals directly
- Do NOT use psychology or medical language
- Show emotions through story situations
- Keep tone warm, playful, and age-appropriate
- Growth should happen naturally through actions

STRUCTURE:
- Exactly 10 pages
- Each page: 2–3 simple sentences
- Clear visual scenes suitable for illustration
- NO explicit "Moral:" text

Return ONLY the story pages in this format:

Page 1:
text

Page 2:
text

...

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
    console.error("❌ OpenAI failed, using fallback story");

    rawText = `
Page 1:
${name} was a cheerful child who loved ${interest}.

Page 2:
One day, something small changed and made ${name} feel unsure.

Page 3:
Big feelings showed up in colorful and surprising ways.

Page 4:
A gentle moment helped things slow down.

Page 5:
${siblingName || "A friendly character"} stayed nearby.

Page 6:
${name} tried again with courage.

Page 7:
Things didn’t feel perfect, but they felt better.

Page 8:
The world seemed brighter once more.

Page 9:
${name} felt proud of trying.

Page 10:
The day ended with calm and hope.
`;
  }

  // ✅ SAFE PARSING
  const pages = [];
  const matches = rawText.match(
    /Page\s*\d+:\s*([\s\S]*?)(?=Page\s*\d+:|$)/gi
  );

  if (matches) {
    for (const page of matches) {
      const cleanText = page.replace(/Page\s*\d+:/i, "").trim();
      pages.push(cleanText);
    }
  }

  console.log("📘 STORY PAGES COUNT:", pages.length);

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
