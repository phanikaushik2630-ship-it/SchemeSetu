/**
 * ============================================================
 * ResultsPage.jsx
 * File: src/components/ResultsPage/ResultsPage.jsx
 * ============================================================
 * Displays matched schemes with:
 *   - Tabbed views (Fully Eligible vs Check Manually)
 *   - Urgent Deadline Alert Banner (Phase 3)
 *   - Urgency & Match Score Sorting (Phase 3)
 *   - Interactive Auto-Draft and Document Tracking (Phase 3)
 *   - AI Consultation Hook (Phase 2)
 * ============================================================
 */

import { useState } from "react";
import SchemeCard from "../SchemeCard/SchemeCard";
import { getUrgencyInfo, sortSchemesByUrgency } from "../../utils/deadlineUtils";

export default function ResultsPage({
  results,
  userProfile,
  onReset,
  onChat,
  onNavigateToDeadlines,
  onNavigateToSaved,
}) {
  const { fullyEligible, partiallyEligible } = results;
  const [activeTab, setActiveTab] = useState("full");
  const [sortBy, setSortBy] = useState("score"); // "score" | "urgency"

  const totalFound = fullyEligible.length + partiallyEligible.length;

  // Check for any schemes closing within 30 days among the matched results
  const allMatched = [...fullyEligible, ...partiallyEligible];
  const urgentMatched = allMatched.filter(
    (r) => getUrgencyInfo(r.scheme.deadline).level === "critical"
  );

  // Apply sorting
  function getSortedList(list) {
    if (sortBy === "urgency") {
      return sortSchemesByUrgency(list);
    }
    // Default: score
    return [...list].sort((a, b) => b.matchScore - a.matchScore);
  }

  const currentList = getSortedList(activeTab === "full" ? fullyEligible : partiallyEligible);

  return (
    <div className="results-page">
      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <div className="results-hero">
        <div className="results-hero-inner">
          <div className="results-emoji">🎉</div>
          <h1 className="results-title">Your Scheme Results</h1>
          <p className="results-subtitle">
            We matched you to <strong>{totalFound} government scheme{totalFound === 1 ? "" : "s"}</strong>
          </p>

          {/* Profile Summary Pills */}
          <div className="profile-pills">
            <span className="pill">👤 {userProfile.age} yrs</span>
            <span className="pill">📍 {userProfile.state}</span>
            <span className="pill">💼 {userProfile.occupation}</span>
            <span className="pill">🏷️ {userProfile.category}</span>
            <span className="pill">₹ {parseInt(userProfile.income).toLocaleString("en-IN")}/yr</span>
          </div>
        </div>
      </div>

      {/* ── Phase 3: Urgent Deadline Alert Banner ────────────────── */}
      {urgentMatched.length > 0 && (
        <div className="results-deadline-alert">
          <div className="alert-badge-pulse">🚨 ACTION REQUIRED</div>
          <div className="alert-inner-content">
            <h3 className="alert-heading">
              {urgentMatched.length} of your matched schemes have application cutoffs closing soon!
            </h3>
            <p className="alert-subtext">
              Schemes such as <strong>{urgentMatched.map((r) => r.scheme.name.split(" ")[0]).join(", ")}</strong> close within 30 days. You can generate pre-filled application drafts and prepare documents now.
            </p>
          </div>
          {onNavigateToDeadlines && (
            <button className="alert-btn" onClick={onNavigateToDeadlines}>
              Track Deadlines →
            </button>
          )}
        </div>
      )}

      {/* ── Stats Row ────────────────────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card stat-green">
          <span className="stat-num">{fullyEligible.length}</span>
          <span className="stat-label">Fully Eligible</span>
        </div>
        <div className="stat-card stat-yellow">
          <span className="stat-num">{partiallyEligible.length}</span>
          <span className="stat-label">Check Manually</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-num">{totalFound}</span>
          <span className="stat-label">Total Found</span>
        </div>
      </div>

      {/* ── Tabs & Sort Controls ─────────────────────────────────── */}
      <div className="tabs-container">
        <div className="tabs-header-with-sort">
          <div className="tabs-header" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "full"}
              className={`tab-btn ${activeTab === "full" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("full")}
            >
              ✅ Fully Eligible
              <span className="tab-count">{fullyEligible.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "partial"}
              className={`tab-btn ${activeTab === "partial" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("partial")}
            >
              ⚠️ Check Manually
              <span className="tab-count">{partiallyEligible.length}</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="sort-box">
            <label className="sort-label">Sort by:</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="score">Highest Match Score</option>
              <option value="urgency">Urgent Deadlines First</option>
            </select>
          </div>
        </div>

        {/* Tab description */}
        <div className="tab-description">
          {activeTab === "full" ? (
            <p>
              You meet <strong>all hard criteria</strong> for these schemes. Click <strong>Generate Application</strong> to get an official draft PDF, or check off required documents.
            </p>
          ) : (
            <p>
              You <strong>likely qualify</strong> for these schemes. Check the highlighted conditions, arrange required documents, or generate a draft.
            </p>
          )}
        </div>

        {/* ── Scheme Cards ─────────────────────────────────────────── */}
        <div className="cards-grid">
          {currentList.map((result) => (
            <SchemeCard
              key={result.scheme.id}
              result={result}
              userProfile={userProfile}
            />
          ))}

          {/* Empty state */}
          {currentList.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🔎</span>
              <p className="empty-title">
                {activeTab === "full"
                  ? "No exact matches found"
                  : "No partial matches found"}
              </p>
              <p className="empty-sub">
                {activeTab === "full"
                  ? "Check the 'Check Manually' tab — you may still be eligible for some schemes."
                  : "All matched schemes are in the 'Fully Eligible' tab."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer actions ────────────────────────────────────────── */}
      <div className="results-footer">
        <div className="results-footer-btns">
          <button className="btn btn-secondary" onClick={onReset}>
            ← Check Again
          </button>
          {onChat && (
            <button className="btn btn-hero-ai" onClick={onChat}>
              <span className="ai-btn-dot" />
              Ask AI About These Results
            </button>
          )}
          {onNavigateToSaved && (
            <button className="btn btn-secondary" onClick={onNavigateToSaved}>
              📁 View My Applications
            </button>
          )}
        </div>
        <p className="disclaimer">
          ⚠️ For informational purposes only. Always verify eligibility on official government portals before applying.
        </p>
      </div>
    </div>
  );
}
