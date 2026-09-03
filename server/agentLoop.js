/**
 * ============================================================
 * server/agentLoop.js — Multi-Step Agentic Loop
 * ============================================================
 * Implements autonomous, multi-step tool-use loops:
 *  - Google Gemini API (via @google/genai — Google AI Studio)
 *  - Anthropic Claude API (via @anthropic-ai/sdk)
 *
 * It automatically selects Google Gemini if GEMINI_API_KEY is
 * set, or Claude if ANTHROPIC_API_KEY is set.
 * ============================================================
 */

import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { TOOL_DEFINITIONS, GEMINI_TOOLS } from "./toolDefinitions.js";
import { executeTool } from "./tools.js";

const MAX_TOOL_ROUNDS = 8;

/**
 * Builds the comprehensive system prompt for the AI Agent.
 */
function buildSystemPrompt(userProfile) {
  const profileSection = userProfile
    ? `
## Current Citizen Profile (from eligibility form)
The user has already provided their demographic and income details:
\`\`\`json
${JSON.stringify(userProfile, null, 2)}
\`\`\`
Use this profile context when evaluating eligibility. Do not ask them to re-enter information that is already here.
`
    : `
## Citizen Profile
The user has not filled out the eligibility form yet.
If their query asks "Am I eligible?" or requires details (state, occupation, income, caste category) that they have not shared, ask a friendly clarifying question before guessing.
`;

  return `You are SchemeSetu's AI Assistant — an autonomous, intelligent guide for Indian citizens discovering central and state government schemes.

## Your Capabilities & Tools
You have access to 4 specialized tools:
1. \`search_schemes\`: Find schemes by occupation, state, category, keyword, gender.
2. \`check_eligibility\`: Deeply test a user profile against a scheme's hard rules and income ceilings.
3. \`get_scheme_details\`: Retrieve official benefits, descriptions, and portal links.
4. \`get_required_documents\`: Fetch the official document checklist for application.

## Multi-Step Agentic Behavior
- When asked a goal (e.g. "Find schemes for a farmer in AP"), DO NOT just answer from static training memory.
- Chain your tools systematically:
  1. Call \`search_schemes\` to discover relevant options.
  2. Call \`check_eligibility\` on promising schemes.
  3. Call \`get_required_documents\` for qualifying schemes.
- Synthesize all findings into a structured, encouraging, and clear report.

${profileSection}

## Guidelines
- Format your response with clear headings, bullet points, and **bold** scheme names.
- For each matched scheme, state the monetary or service benefit clearly.
- Note any conditions (e.g., land ownership, income ceiling).
- Provide official portal links if retrieved.`;
}

// ============================================================
// Google Gemini Agent Loop (@google/genai)
// ============================================================
async function runGeminiAgentLoop(messages, userProfile) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = buildSystemPrompt(userProfile);
  const reasoningTrace = [];

  // Helper: auto-retry with exponential backoff for temporary 503 / 429 spikes
  async function sendWithRetry(chatSession, payload, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await chatSession.sendMessage(payload);
      } catch (err) {
        const isTemporary =
          err.message?.includes("503") ||
          err.message?.includes("high demand") ||
          err.message?.includes("UNAVAILABLE") ||
          err.message?.includes("429") ||
          err.message?.includes("RESOURCE_EXHAUSTED");

        if (isTemporary && attempt < maxRetries) {
          const waitMs = attempt * 1500;
          console.log(`[Gemini Retry] Rate/spike backoff: waiting ${waitMs}ms before attempt ${attempt + 1}...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        } else {
          throw err;
        }
      }
    }
  }

  // Build chat history from prior turns
  const history = [];
  // Exclude the last message (which is the current user prompt)
  const pastMessages = messages.slice(0, messages.length - 1);
  for (const m of pastMessages) {
    if (typeof m.content === "string") {
      history.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      });
    }
  }

  const chat = ai.chats.create({
    model: modelName,
    history: history,
    config: {
      systemInstruction: systemInstruction,
      tools: GEMINI_TOOLS,
    },
  });

  const latestUserMsg = messages[messages.length - 1]?.content || "";
  console.log(`[Gemini] Initial message: "${latestUserMsg}"`);
  let currentResponse = await sendWithRetry(chat, { message: latestUserMsg });
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    round++;
    const functionCalls = currentResponse.functionCalls;
    console.log(`[Gemini] Round ${round} tool calls requested:`, functionCalls?.map((c) => c.name) || "none (final text ready)");

    // If no tool call requested, we received the final text answer
    if (!functionCalls || functionCalls.length === 0) {
      break;
    }

    // Execute each function call requested by Gemini
    const functionResponses = [];
    for (const call of functionCalls) {
      const startTime = Date.now();
      let toolResult;
      let toolError = null;

      try {
        toolResult = executeTool(call.name, call.args);
      } catch (err) {
        toolError = err.message;
        toolResult = { error: `Tool execution failed: ${err.message}` };
      }

      const elapsed = Date.now() - startTime;

      reasoningTrace.push({
        step: reasoningTrace.length + 1,
        toolName: call.name,
        toolInput: call.args,
        toolResult: toolResult,
        elapsed,
        error: toolError,
        timestamp: new Date().toISOString(),
      });

      functionResponses.push({
        name: call.name,
        response: toolResult,
      });
    }

    console.log(`[Gemini] Sending ${functionResponses.length} tool result(s) back to Gemini...`);
    currentResponse = await sendWithRetry(chat, {
      message: functionResponses.map((fr) => ({
        functionResponse: fr,
      })),
    });
  }

  const finalText = currentResponse.text || "I found relevant scheme information, but could not finalize the text response.";

  const updatedMessages = [
    ...messages,
    { role: "assistant", content: finalText },
  ];

  return {
    response: finalText,
    reasoningTrace,
    updatedMessages,
  };
}

// ============================================================
// Anthropic Claude Agent Loop (@anthropic-ai/sdk)
// ============================================================
async function runClaudeAgentLoop(messages, userProfile) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const modelName = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";
  const systemPrompt = buildSystemPrompt(userProfile);
  const reasoningTrace = [];
  let currentMessages = [...messages];
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    round++;

    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 4096,
      system: systemPrompt,
      tools: TOOL_DEFINITIONS,
      messages: currentMessages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      const finalText = textBlock?.text || "No response generated.";
      currentMessages.push({ role: "assistant", content: response.content });

      return {
        response: finalText,
        reasoningTrace,
        updatedMessages: currentMessages,
      };
    }

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
      currentMessages.push({ role: "assistant", content: response.content });

      const toolResults = [];
      for (const toolCall of toolUseBlocks) {
        const startTime = Date.now();
        let toolResult;
        let toolError = null;

        try {
          toolResult = executeTool(toolCall.name, toolCall.input);
        } catch (err) {
          toolError = err.message;
          toolResult = { error: `Tool execution failed: ${err.message}` };
        }

        const elapsed = Date.now() - startTime;

        reasoningTrace.push({
          step: reasoningTrace.length + 1,
          toolName: toolCall.name,
          toolInput: toolCall.input,
          toolResult: toolResult,
          elapsed,
          error: toolError,
          timestamp: new Date().toISOString(),
        });

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      currentMessages.push({
        role: "user",
        content: toolResults,
      });
      continue;
    }

    break;
  }

  const textBlock = currentMessages[currentMessages.length - 1]?.content;
  return {
    response: typeof textBlock === "string" ? textBlock : "Processing complete.",
    reasoningTrace,
    updatedMessages: currentMessages,
  };
}

// ============================================================
// Main Dispatcher
// ============================================================
export async function runAgentLoop(messages, userProfile = null) {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
    return runGeminiAgentLoop(messages, userProfile);
  }

  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your_claude_api_key_here") {
    return runClaudeAgentLoop(messages, userProfile);
  }

  throw new Error("No AI API key found. Please set GEMINI_API_KEY in your .env file.");
}
