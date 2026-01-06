import OpenAI from "openai";
import fs from "fs";

const STORY_DIR = "stories";

// ✅ ONLY CHANGE: added options param
export async function generateStory(input, bookId, options = {}) {
  const {
    name,
    age,
    gender,
    interest,
    challenges = [],
    siblingName,
    additionalInfo,
  } = input;

  // ✅ ONLY CHANGE: pageLimit (default 10)
  const { pageLimit = 10 } = options;

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

  // ❌ PROMPT UNCHANGED
  const prompt = `
You are a professional children's storybook author
known for writing emotionally rich, memorable stories
that parents love and children want to hear again.

This is a STORY, not an explanation.
This is NOT generic AI writing.

MAIN CHARACTER:
- Name: ${name}
- Age: ${age}
- Gender: ${gender}
- Interest: ${interest}

STORY CONTEXT FROM PARENTS:
- The main emotional challenge of this story should be: ${
    challenges.length ? challenges[0] : "a small everyday struggle"
  }
- The story should naturally revolve around this challenge
- The child’s interest (${interest}) should play an active role in how the problem appears or is solved
${siblingName ? `- A sibling named ${siblingName} should influence the story in a meaningful way (support, contrast, or motivation).` : ""}
${additionalInfo ? `- Parent context to gently reflect: ${additionalInfo}` : ""}

CORE STORY RULES:
- Write ONE complete story with a clear beginning, middle, and end
- Break the story naturally into 10 pages
- Each page must move the story forward (no filler)
- The story must revolve around the child’s real-life challenge
- The child must struggle, hesitate, and then make a choice
- Growth must feel natural and earned
- Avoid excessive description without action
- Balance action, emotion, and dialogue
- Keep language age-appropriate and engaging

ENDING & MORAL (VERY IMPORTANT):
- Page 10 must feel warm, calm, and emotionally complete
- The problem introduced earlier must be resolved
- The child should succeed because of a choice they made
- The moral should be implied through what happens
- If a moral line is included, it should sound like a soft realization, not advice
- End with a positive emotion (peace, confidence, belonging, joy)

OUTPUT FORMAT (STRICT):
Page 1:
(text)

Page 2:
(text)

...

Page 10:
(text)
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

  // ❌ PARSING UNCHANGED
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

  console.log("📘 STORY PAGES COUNT (RAW):", pages.length);

  // ✅ ONLY CHANGE: limit pages here
  const limitedPages = pages.slice(0, pageLimit);

  if (!fs.existsSync(STORY_DIR)) {
    fs.mkdirSync(STORY_DIR);
  }

  fs.writeFileSync(
    `${STORY_DIR}/${bookId}.json`,
    JSON.stringify(limitedPages, null, 2)
  );

  console.log("📘 STORY SAVED PAGES:", limitedPages.length);

  return limitedPages;
}

export function loadStory(bookId) {
  const filePath = `${STORY_DIR}/${bookId}.json`;
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return null;
}
