import * as dotenv from "dotenv";
dotenv.config();

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const model = "claude-sonnet-5";

async function main() {
  const message = await client.messages.create({
    model: model,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: "What is quantum computing? Answer in one sentence",
      },
    ],
  });

  const block = message.content[0];
  if (block && block.type === "text") {
    console.log(block.text);
  }
}

main();