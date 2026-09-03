/**
 * ============================================================
 * ChatInterface.jsx — AI Agent Chat Panel
 * File: src/components/ChatInterface/ChatInterface.jsx
 * ============================================================
 * The main Phase 2 UI. A full chat interface that:
 *  - Takes natural language queries from the user
 *  - Sends them to the Express agent server (/api/agent)
 *  - Shows the agent's response with markdown formatting
 *  - Displays the step-by-step reasoning trace
 *  - Maintains conversation history across messages
 *  - Passes Phase 1 userProfile for richer context
 *
 * Props:
 *   userProfile: Object|null — from Phase 1 form (optional)
 *   onGoToForm: Function — navigate to the profile form
 * ============================================================
 */

import { useState, useRef, useEffect } from "react";
import AgentMessage from "../AgentMessage/AgentMessage";
import ReasoningTrace from "../ReasoningTrace/ReasoningTrace";

// Suggested starter queries shown when chat is empty
const STARTER_QUERIES = [
  "Find schemes for a farmer in Andhra Pradesh",
  "What can a disabled unemployed person in Telangana apply for?",
  "Am I eligible for PM-KISAN?",
  "Find scholarships for SC students",
  "What housing schemes are available for low-income families?",
  "Tell me about MUDRA loan — who can apply?",
];

export default function ChatInterface({ userProfile, onGoToForm }) {
  // ── State ─────────────────────────────────────────────────
  // Conversation history in Anthropic message format
  const [apiMessages, setApiMessages] = useState([]);

  // UI message list — { role, content } for display
  const [uiMessages, setUiMessages] = useState([]);

  // Reasoning trace from the latest agent turn
  const [currentTrace, setCurrentTrace] = useState([]);

  // All traces stored by turn index
  const [allTraces, setAllTraces] = useState([]);

  // Input text
  const [input, setInput] = useState("");

  // True while waiting for the agent
  const [isLoading, setIsLoading] = useState(false);

  // Error message if something goes wrong
  const [error, setError] = useState("");

  // API health status (checked on mount)
  const [apiStatus, setApiStatus] = useState("checking"); // "checking" | "ok" | "no-key" | "offline"
  const [modelInfo, setModelInfo] = useState({ provider: "Google AI Studio", model: "gemini-3.6-flash" });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Auto-scroll to bottom ─────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uiMessages, isLoading]);

  // ── Check API health on mount ─────────────────────────────
  useEffect(() => {
    checkApiHealth();
  }, []);

  async function checkApiHealth() {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("server error");
      const data = await res.json();
      setApiStatus(data.apiKeyConfigured ? "ok" : "no-key");
      if (data.provider) {
        setModelInfo({ provider: data.provider, model: data.model });
      }
    } catch {
      setApiStatus("offline");
    }
  }

  // ── Send message ──────────────────────────────────────────
  async function handleSend(queryText) {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    setInput("");
    setError("");
    setCurrentTrace([]);

    // Add user message to UI
    const userMsg = { role: "user", content: text };
    const newUiMessages = [...uiMessages, userMsg];
    setUiMessages(newUiMessages);

    // Build Anthropic-format messages array
    // Only include role: "user" and role: "assistant" with text content
    // (The API messages stored from last call already have correct format)
    const newApiMessages = [...apiMessages, { role: "user", content: text }];

    setIsLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newApiMessages,
          userProfile: userProfile || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error types
        if (res.status === 503) {
          setApiStatus("no-key");
          throw new Error(data.message || "API key not configured");
        }
        throw new Error(data.message || "Server error");
      }

      // Add agent response to UI
      const agentMsg = { role: "assistant", content: data.response };
      setUiMessages((prev) => [...prev, agentMsg]);

      // Update the API message history with the full updated history from server
      // (server includes all tool-use messages which we strip for display)
      setApiMessages(
        data.messages.filter(
          (m) =>
            m.role === "user" &&
            typeof m.content === "string"
              ? true
              : m.role === "assistant" &&
                Array.isArray(m.content) &&
                m.content.some((b) => b.type === "text")
              ? true
              : typeof m.content === "string"
        )
      );

      // Store reasoning trace
      setCurrentTrace(data.reasoningTrace || []);
      setAllTraces((prev) => [...prev, data.reasoningTrace || []]);
    } catch (err) {
      setError(err.message);
      setUiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ ${err.message}\n\nPlease check that the server is running and your API key is configured in the \`.env\` file.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  // ── Clear conversation ────────────────────────────────────
  function handleClear() {
    setUiMessages([]);
    setApiMessages([]);
    setCurrentTrace([]);
    setAllTraces([]);
    setError("");
    inputRef.current?.focus();
  }

  // ── Handle Enter key ──────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="chat-page">
      {/* ── Sidebar / Context Panel ───────────────────────── */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2 className="sidebar-title">🤖 AI Assistant</h2>
          <p className="sidebar-sub">
            Powered by {modelInfo.provider} ({modelInfo.model})
          </p>
        </div>

        {/* API Status Banner */}
        <ApiStatusBanner status={apiStatus} modelInfo={modelInfo} onRetry={checkApiHealth} />

        {/* Profile Context */}
        {userProfile ? (
          <div className="sidebar-profile">
            <p className="sidebar-profile-label">📋 Your profile is loaded</p>
            <div className="sidebar-profile-pills">
              <span className="spill">{userProfile.age} yrs</span>
              <span className="spill">{userProfile.state}</span>
              <span className="spill">{userProfile.occupation}</span>
              <span className="spill">{userProfile.category}</span>
            </div>
            <p className="sidebar-profile-hint">
              The AI knows your profile — no need to repeat your details.
            </p>
          </div>
        ) : (
          <div className="sidebar-no-profile">
            <p className="sidebar-noprofile-msg">
              💡 <strong>Tip:</strong> Fill in your profile first for more accurate results.
            </p>
            <button className="btn btn-secondary sidebar-form-btn" onClick={onGoToForm}>
              Fill Profile Form →
            </button>
          </div>
        )}

        {/* How it works */}
        <div className="sidebar-how">
          <p className="sidebar-how-title">How the agent works:</p>
          <ol className="sidebar-how-list">
            <li>🔍 Searches matching schemes</li>
            <li>✅ Checks your eligibility</li>
            <li>📄 Retrieves document lists</li>
            <li>💬 Gives a personalized answer</li>
          </ol>
        </div>

        {/* Clear button */}
        {uiMessages.length > 0 && (
          <button className="btn btn-secondary clear-btn" onClick={handleClear}>
            🗑️ Clear Chat
          </button>
        )}
      </aside>

      {/* ── Main Chat Area ────────────────────────────────── */}
      <div className="chat-main">
        {/* Messages */}
        <div className="chat-messages" role="log" aria-live="polite">
          {uiMessages.length === 0 ? (
            // Empty state with suggested queries
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <h3 className="chat-empty-title">Ask me anything about government schemes</h3>
              <p className="chat-empty-sub">
                I can search, check eligibility, and explain requirements for 20 real Indian schemes.
              </p>
              <div className="starter-grid">
                {STARTER_QUERIES.map((q) => (
                  <button
                    key={q}
                    className="starter-btn"
                    onClick={() => handleSend(q)}
                    disabled={isLoading || apiStatus !== "ok"}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {uiMessages.map((msg, i) => (
                <AgentMessage key={i} role={msg.role} content={msg.content} />
              ))}

              {/* Loading bubble */}
              {isLoading && (
                <AgentMessage role="assistant" content="" isLoading={true} />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reasoning Trace (shown below messages, above input) */}
        {(currentTrace.length > 0 || isLoading) && (
          <div className="chat-trace-area">
            <ReasoningTrace trace={currentTrace} isLoading={isLoading} />
          </div>
        )}

        {/* Input Bar */}
        <div className="chat-input-bar">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={
              apiStatus !== "ok"
                ? "Configure API key in .env to use AI chat..."
                : "Ask about schemes, eligibility, or documents... (Press Enter to send)"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || apiStatus !== "ok"}
            rows={2}
            aria-label="Chat input"
          />
          <button
            className={`btn chat-send-btn ${isLoading ? "loading" : ""}`}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || apiStatus !== "ok"}
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="send-spinner" />
            ) : (
              "Send →"
            )}
          </button>
        </div>

        <p className="chat-disclaimer">
          AI responses are for guidance only. Always verify on official government portals.
        </p>
      </div>
    </div>
  );
}

// ── API Status Banner ─────────────────────────────────────────
function ApiStatusBanner({ status, modelInfo, onRetry }) {
  if (status === "ok") {
    return (
      <div className="api-status api-ok">
        <span>🟢 {modelInfo?.provider || "AI Agent"} Ready</span>
        <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "2px" }}>
          Model: <code>{modelInfo?.model}</code>
        </div>
      </div>
    );
  }

  if (status === "no-key") {
    return (
      <div className="api-status api-warn">
        <p>🔑 <strong>API key missing</strong></p>
        <p className="api-status-sub">
          Add your key to the <code>.env</code> file:<br />
          <code>GEMINI_API_KEY=...</code> (Google AI Studio)
        </p>
        <button className="api-retry-btn" onClick={onRetry}>Retry →</button>
      </div>
    );
  }

  if (status === "offline") {
    return (
      <div className="api-status api-error">
        <p>🔴 <strong>Server offline</strong></p>
        <p className="api-status-sub">Run <code>npm run dev</code> to start the server.</p>
        <button className="api-retry-btn" onClick={onRetry}>Retry →</button>
      </div>
    );
  }

  return (
    <div className="api-status api-checking">
      <span>⏳ Connecting to AI server...</span>
    </div>
  );
}
