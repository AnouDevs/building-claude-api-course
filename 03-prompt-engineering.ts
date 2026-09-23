import * as dotenv from "dotenv";
dotenv.config();

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const model = "claude-sonnet-5";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function addUserMessage(messages: Message[], text: string) {
  messages.push({ role: "user", content: text });
}

async function chat(messages: Message[], temperature = 1.0): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: 2000,
    messages,
    temperature,
  });
  const block = response.content[0];
  if (block && block.type === "text") {
    return block.text;
  }
  return "";
}

interface AthleteInfo {
  height: string;
  weight: string;
  goal: string;
  restrictions: string;
}

const athlete: AthleteInfo = {
  height: "180cm",
  weight: "75kg",
  goal: "gain muscle",
  restrictions: "vegetarian",
};

async function runPromptV1(athlete: AthleteInfo) {
  const prompt = `What should this person eat? 
  - Height: ${athlete.height}
  - Weight: ${athlete.weight}
  - Goal: ${athlete.goal}
  - Dietary restrictions: ${athlete.restrictions}
  `;
  const messages: Message[] = [];
  addUserMessage(messages, prompt);
  const output = await chat(messages);
  return output;
}

// async function main() {
//   const result = await runPromptV1(athlete);
//   console.log(result);
// }

// main();

async function runPromptV2(athlete: AthleteInfo) {
  const prompt = `Generate a one-day meal plan for an athlete that meets their dietary restrictions. 
  - Height: ${athlete.height}
  - Weight: ${athlete.weight}
  - Goal: ${athlete.goal}
  - Dietary restrictions: ${athlete.restrictions}
  `;
  const messages: Message[] = [];
  addUserMessage(messages, prompt);
  const output = await chat(messages);
  return output;
}

// async function main() {
//   const result = await runPromptV2(athlete);
//   console.log(result);
// }

// main();

async function runPromptV3(athlete: AthleteInfo) {
  const prompt = `Generate a one-day meal plan for an athlete that meets their dietary restrictions. 
  - Height: ${athlete.height}
  - Weight: ${athlete.weight}
  - Goal: ${athlete.goal}
  - Dietary restrictions: ${athlete.restrictions}

    Guidelines:
    1. Include accurate daily calorie amount
    2. Show protein, fat, and carb amounts  
    3. Specify when to eat each meal
    4. Use only foods that fit restrictions
    5. List all portion sizes in grams
    6. Keep budget-friendly if mentioned
    7. Do not ask any follow-up questions or offer alternatives — provide only the final meal plan
  `;
  const messages: Message[] = [];
  addUserMessage(messages, prompt);
  const output = await chat(messages);
  return output;
}

async function main() {
  const result = await runPromptV3(athlete);
  console.log(result);
}

main();
