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
You are a professional children's storybook author,
writing premium, emotionally rich stories that parents love
and children want to hear again and again.

This is NOT a teaching story.
This is NOT a moral lesson.
This is a warm, immersive STORY.

MAIN CHARACTER:
- Name: ${name}
- Age: ${age}
- Gender: ${gender}
- Interest: ${interest}

STORY CONTEXT:
${challenges.length ? `The child is gently navigating: ${challenges.join(", ")}.` : ""}
${siblingName ? `The child has a sibling named ${siblingName}, who appears naturally in the story.` : ""}
${additionalInfo ? `Parent context: ${additionalInfo}` : ""}

VERY IMPORTANT STORY RULES:
- Write ONE continuous story with a clear beginning, middle, and end
- Break the story naturally into 10 pages
- Each page should feel like the next moment in the same journey
- Avoid repetition and filler scenes
- The child must make at least one meaningful choice
- Growth must feel earned, not sudden
- Do NOT explain feelings directly (no "he felt sad")
- Let actions, pauses, and moments show the emotion
- Keep language beautiful, simple, and story-like
- No morals, no lessons, no advice language

PACING & DEPTH:
- Pages 1–3: Gentle setup, curiosity, hints of challenge
- Pages 4–7: Central struggle, hesitation, small setbacks
- Pages 8–9: Turning point driven by the child
- Page 10: Warm, satisfying emotional resolution

WRITING QUALITY:
- Use varied sentence rhythm
- Avoid generic phrases
- Avoid summarizing
- Write as if this will be read aloud at bedtime
- Make it feel personal, intimate, and human-written

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
