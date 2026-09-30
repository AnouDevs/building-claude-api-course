# Tool use with Claude

## 1. Why tools?

Claude only knows what it learned during training. It cannot get the current time,
the weather or data from my database. Tools fix this: I describe a function to
Claude, Claude asks me to call it, my code runs it and I send the result back.

## 2. The 5-step flow

1. Write a tool function (the real code).
2. Write a JSON schema that describes the function.
3. Call Claude with the messages and the schema (`tools` parameter).
4. Claude asks for the tool, and my code runs the function.
5. Send the result back to Claude, which writes the final answer.

Claude never runs the function itself. It only asks me to run it.

## 3. The tool schema

A schema has three fields:
- `name`: a clear name for the tool.
- `description`: what it does, when to use it and what it returns (3-4 sentences).
  This is the most important field, because Claude reads it to decide when to use the tool.
- `input_schema`: a JSON schema of the arguments, with a description for each one.

Tip: I can ask Claude to write the schema from my function code.
Good naming pattern: `getWeather` and `getWeatherSchema`.

## 4. Message blocks

A response with a tool is a multi-block message. Its content is a list of blocks:
- `text`: what Claude says to the user.
- `tool_use`: the request to call a tool. It has an `id`, a `name` and an `input`.
- `tool_result`: my answer, sent inside a user message. It has a `tool_use_id`,
  a `content` (as a string) and an `is_error` flag.

Claude has no memory, so I must save the whole `response.content` in the history,
not only the text.

## 5. The multi-turn loop

Sometimes Claude needs several tools in a row (for example: get today's date,
then add 103 days). So I use a loop:
1. Call Claude with the messages and the tools.
2. Add Claude's answer to the history.
3. If `stop_reason` is not `"tool_use"`, stop. The answer is final.
4. Otherwise, run every requested tool and send the results as a user message.
5. Go back to step 1.

## 6. Errors and multiple tools

- Claude can ask for several tools in one message. Each `tool_result` must use
  the matching `tool_use_id`, so Claude knows which result answers which request.
- If a function fails, I still send a `tool_result` with `is_error: true` and a
  clear message. Claude can read it and try again with better arguments.
- Good tool functions validate their inputs and raise clear errors.
- A small router function maps the tool name to the right function, so adding a
  tool is easy: function, schema, add it to the list, add a case in the router.

## 7. Streaming and tools (fine-grained)

With streaming, the tool arguments arrive as JSON chunks (`partial_json`, and
`snapshot` for everything received so far). By default, the API waits for a
complete and valid key-value pair before sending it, so chunks come in bursts.
`fine_grained` turns this validation off. Chunks arrive faster, but the JSON can
be invalid, so my code must handle parsing errors.

## 8. Built-in tools from Anthropic

- Text editor tool: Claude knows the schema (view, replace, create, insert, undo),
  but I must write the code that really edits the files.
- Web search tool: Anthropic does everything. I only send a small schema with
  `max_uses`, and optionally `allowed_domains` to limit the sources. The response
  contains search results and citations. It must be enabled in the console settings.

## 9. Things not to forget when coding

- Save the full `response.content` in the history, not only the text.
- Send the `tools` list again in every request, even the last one.
- Stop the loop on `stop_reason`, not on the text.
- Match every `tool_use_id` with its `tool_result`.
- Only add `tools` to the request when I have some (the API refuses an empty value).
- From the Sonnet 5.5 docs: forcing a tool with `tool_choice` now returns an error.