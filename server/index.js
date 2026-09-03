/**
 * ============================================================
 * server/index.js — Express API Server
 * ============================================================
 * Lightweight Express server that:
 *  - Loads the AI API key from .env (keeps it off the browser)
 *  - Supports Google AI Studio (Gemini) and Anthropic Claude
 *  - Exposes POST /api/agent for the multi-step agentic loop
 *  - Exposes GET  /api/health for liveness checks
 *
 * Runs on port 3001. Vite proxies /api/* → here.
 * ============================================================
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { runAgentLoop } from "./agentLoop.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]
}));
app.use(express.json({ limit: "2mb" }));

function getActiveProvider() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
    return {
      provider: "google",
      name: "Google AI Studio",
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      configured: true,
    };
  }
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your_claude_api_key_here") {
    return {
      provider: "anthropic",
      name: "Anthropic Claude",
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
      configured: true,
    };
  }
  return {
    provider: "none",
    name: "Not Configured",
    model: "none",
    configured: false,
  };
}

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const active = getActiveProvider();
  res.json({
    status: "ok",
    phase: "2",
    provider: active.name,
    model: active.model,
    apiKeyConfigured: active.configured,
    timestamp: new Date().toISOString(),
  });
});

// ── Main Agent Endpoint ───────────────────────────────────────
/**
 * POST /api/agent
 *
 * Body:
 *   messages:    Array  — conversation history
 *   userProfile: Object|null — user's profile from Phase 1 form
 *
 * Response:
 *   response:       string — Agent's synthesized final response
 *   reasoningTrace: Array  — step-by-step tool call trace for UI
 *   messages:       Array  — updated conversation history
 */
app.post("/api/agent", async (req, res) => {
  const active = getActiveProvider();
  if (!active.configured) {
    return res.status(503).json({
      error: "API key not configured",
      message: "Please add GEMINI_API_KEY (from Google AI Studio) or ANTHROPIC_API_KEY to your .env file.",
    });
  }

  const { messages, userProfile } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "Invalid request",
      message: "messages must be a non-empty array",
    });
  }

  try {
    console.log(`\n[Agent - ${active.name}] Query with ${messages.length} messages in history`);
    console.log(`[Agent] Profile: ${userProfile ? "Attached" : "None"}`);
    const startTime = Date.now();

    const result = await runAgentLoop(messages, userProfile);

    const elapsed = Date.now() - startTime;
    console.log(`[Agent] Completed in ${elapsed}ms — ${result.reasoningTrace.length} tool calls executed`);

    res.json({
      response: result.response,
      reasoningTrace: result.reasoningTrace,
      messages: result.updatedMessages,
    });
  } catch (err) {
    console.error("[Agent] Error:", err.message);

    if (err.status === 401 || err.message?.includes("API_KEY_INVALID")) {
      return res.status(401).json({
        error: "Invalid API key",
        message: "Your AI API key was rejected. Please verify it in .env.",
      });
    }

    if (err.status === 429 || err.message?.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({
        error: "Rate limited",
        message: "API rate limit reached. Please wait a moment and retry.",
      });
    }

    res.status(500).json({
      error: "Agent error",
      message: err.message || "An unexpected error occurred in the agent loop.",
    });
  }
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  const active = getActiveProvider();
  console.log(`\n🚀 SchemeSetu API Server running on http://localhost:${PORT}`);
  console.log(`🤖 AI Provider: ${active.name}`);
  console.log(`📋 Model: ${active.model}`);
  console.log(`🔑 API Key: ${active.configured ? "✅ Configured & Ready" : "❌ MISSING — add to .env file!"}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/agent`);
});
