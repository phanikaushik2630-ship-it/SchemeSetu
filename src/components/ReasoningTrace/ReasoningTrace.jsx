/**
 * ============================================================
 * ReasoningTrace.jsx — Agent Reasoning Trace Panel
 * File: src/components/ReasoningTrace/ReasoningTrace.jsx
 * ============================================================
 * Shows the step-by-step tool calls the AI agent made.
 * Collapsible panel — great for portfolio demos to prove
 * agentic (multi-step) behavior.
 *
 * Props:
 *   trace: Array of {
 *     step, toolName, toolInput, toolResult, elapsed, timestamp
 *   }
 *   isLoading: boolean — show spinner if agent is still working
 * ============================================================
 */

import { useState } from "react";

// Icons and labels for each tool
const TOOL_META = {
  search_schemes: {
    icon: "🔍",
    label: "Searched Schemes",
    color: "trace-blue",
    summary: (input) => {
      const parts = [];
      if (input.occupation) parts.push(`occupation="${input.occupation}"`);
      if (input.state) parts.push(`state="${input.state}"`);
      if (input.category) parts.push(`category="${input.category}"`);
      if (input.keyword) parts.push(`keyword="${input.keyword}"`);
      return parts.length ? parts.join(", ") : "all schemes";
    },
  },
  check_eligibility: {
    icon: "✅",
    label: "Checked Eligibility",
    color: "trace-green",
    summary: (input) => `scheme="${input.schemeId}"`,
  },
  get_scheme_details: {
    icon: "📋",
    label: "Got Scheme Details",
    color: "trace-purple",
    summary: (input) => `scheme="${input.schemeId}"`,
  },
  get_required_documents: {
    icon: "📄",
    label: "Got Document List",
    color: "trace-orange",
    summary: (input) => `scheme="${input.schemeId}"`,
  },
};

// Formats a tool result into a compact, readable summary
function summarizeResult(toolName, result) {
  if (result?.error) return `❌ Error: ${result.error}`;

  switch (toolName) {
    case "search_schemes":
      if (!result?.matches?.length) return "No schemes found.";
      return `Found ${result.totalFound} scheme(s): ${result.matches.map((m) => m.name).join(", ")}`;

    case "check_eligibility":
      const verdictEmoji = {
        ELIGIBLE: "✅",
        LIKELY_ELIGIBLE: "🟡",
        NOT_ELIGIBLE: "❌",
      };
      return `${verdictEmoji[result?.verdict] || "?"} ${result?.verdict} — Match score: ${result?.matchScore}%`;

    case "get_scheme_details":
      return `${result?.name} — ${result?.benefit}`;

    case "get_required_documents":
      return `${result?.totalDocuments} documents required for ${result?.schemeName}`;

    default:
      return JSON.stringify(result).slice(0, 100) + "...";
  }
}

export default function ReasoningTrace({ trace, isLoading }) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedStep, setExpandedStep] = useState(null);

  if (!isLoading && (!trace || trace.length === 0)) return null;

  return (
    <div className="trace-panel">
      {/* ── Header ─────────────────────────────────────────── */}
      <button
        className="trace-toggle"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <span className="trace-toggle-left">
          <span className="trace-robot">🤖</span>
          <span className="trace-title">Agent Reasoning</span>
          {trace.length > 0 && (
            <span className="trace-count">{trace.length} step{trace.length !== 1 ? "s" : ""}</span>
          )}
        </span>
        <span className={`trace-chevron ${isOpen ? "open" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="trace-body">
          {/* Loading state */}
          {isLoading && (
            <div className="trace-loading">
              <div className="trace-spinner" />
              <span>Agent is thinking...</span>
            </div>
          )}

          {/* Steps */}
          {trace.map((step, i) => {
            const meta = TOOL_META[step.toolName] || {
              icon: "⚙️",
              label: step.toolName,
              color: "trace-gray",
              summary: () => "",
            };
            const isExpanded = expandedStep === i;

            return (
              <div key={i} className={`trace-step ${meta.color}`}>
                {/* Step header */}
                <button
                  className="trace-step-header"
                  onClick={() => setExpandedStep(isExpanded ? null : i)}
                >
                  <span className="trace-step-num">Step {step.step}</span>
                  <span className="trace-step-icon">{meta.icon}</span>
                  <div className="trace-step-info">
                    <span className="trace-step-label">{meta.label}</span>
                    <span className="trace-step-summary">
                      {meta.summary(step.toolInput)}
                    </span>
                  </div>
                  <div className="trace-step-right">
                    <span className="trace-step-result">
                      {summarizeResult(step.toolName, step.toolResult)}
                    </span>
                    <span className="trace-step-time">{step.elapsed}ms</span>
                    <span className={`trace-step-chevron ${isExpanded ? "open" : ""}`}>›</span>
                  </div>
                </button>

                {/* Expanded detail: raw input + output JSON */}
                {isExpanded && (
                  <div className="trace-step-detail">
                    <div className="trace-json-section">
                      <p className="trace-json-label">Input</p>
                      <pre className="trace-json">{JSON.stringify(step.toolInput, null, 2)}</pre>
                    </div>
                    <div className="trace-json-section">
                      <p className="trace-json-label">Output</p>
                      <pre className="trace-json">
                        {JSON.stringify(step.toolResult, null, 2).slice(0, 800)}
                        {JSON.stringify(step.toolResult, null, 2).length > 800 ? "\n... (truncated)" : ""}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
