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

function addAssistantMessage(messages: Message[], text: string) {
  messages.push({ role: "assistant", content: text });
}

async function chat(messages: Message[], temperature = 1.0): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: 1000,
    messages,
    temperature,
  });
  const block = response.content[0];
  if (block && block.type === "text") {
    return block.text;
  }
  return "";
}

interface TestCase {
  task: string;
}

const dataset: TestCase[] = [
  { task: "What's 2+2?" },
  { task: "How do I make oatmeal?" },
  { task: "How far away is the Moon?" },
];

async function runPrompt(testCase: TestCase) {
  const prompt = `Please solve the following task\n\n${testCase.task}`;
  const messages: Message[] = [];
  addUserMessage(messages, prompt);
  const output = await chat(messages);
  return output;
}

async function main() {
  const results = await runEval(dataset);
  console.log(JSON.stringify(results, null, 2));
}

main();

async function runTestCase(testCase: TestCase) {
  const output = await runPrompt(testCase);
  const score = 10;
  return {
    output: output,
    testCase: testCase,
    score: score,
  };
}

async function runEval(dataset: TestCase[]) {
  const results = [];

  for (const testCase of dataset) {
    const result = await runTestCase(testCase);
    results.push(result);
  }

  return results;
}
