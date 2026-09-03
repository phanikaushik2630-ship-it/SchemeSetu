/**
 * ============================================================
 * Dashboard.jsx — Unified Citizen Welfare Dashboard
 * File: src/components/Dashboard/Dashboard.jsx
 * ============================================================
 * Central hub displaying:
 *   - Citizen profile summary
 *   - Matched benefits at-a-glance
 *   - Top 3 urgent deadlines widget
 *   - My Applications pipeline snapshot
 *   - Quick-access AI Agent prompt launcher
 *   - Global scheme search bar
 * ============================================================
 */

import { useState } from "react";
import schemesData from "../../data/schemes.json";
import { sortSchemesByUrgency, getUrgencyInfo, calculateDaysRemaining } from "../../utils/deadlineUtils";
import { getBookmarkedSchemeIds, getAllStatuses } from "../../utils/storageUtils";
import { t } from "../../utils/i18n";
import ApplicationModal from "../ApplicationModal/ApplicationModal";

export default function Dashboard({
  userProfile,
  matchResults,
  onNavigateToForm,
  onNavigateToResults,
  onNavigateToDeadlines,
  onNavigateToMyApps,
  onNavigateToAi,
  onNavigateToExplorer,
  lang = "en",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState(null);

  // Urgent deadlines: take top 3 most urgent from schemes database
  const sortedDeadlines = sortSchemesByUrgency(schemesData).slice(0, 3);

  // My Applications snapshot
  const bookmarkedIds = getBookmarkedSchemeIds();
  const allStatuses = getAllStatuses();
  const myAppStats = bookmarkedIds.reduce(
    (acc, id) => {
      const st = allStatuses[id] || "Not Started";
      if (st === "Not Started") acc.notStarted++;
      else if (st === "Documents Ready") acc.docsReady++;
      else if (st === "Submitted") acc.submitted++;
      else if (st === "Approved") acc.approved++;
      return acc;
    },
    { notStarted: 0, docsReady: 0, submitted: 0, approved: 0, total: bookmarkedIds.length }
  );

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (onNavigateToExplorer) {
      onNavigateToExplorer(searchQuery.trim());
    }
  }

  function handleAiPromptClick(promptText) {
    if (onNavigateToAi) {
      onNavigateToAi(promptText);
    }
  }

  return (
    <div className="dashboard-page">
      {/* ── Global Search Bar Header ───────────────────────────── */}
      <div className="dashboard-search-section">
        <form className="global-search-bar" onSubmit={handleSearchSubmit}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="global-search-input"
            placeholder={t("searchBoxPlaceholder", lang)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="global-search-btn">
            Explore Schemes →
          </button>
        </form>
      </div>

      {/* ── Citizen Profile Banner ─────────────────────────────── */}
      <div className="dashboard-profile-banner">
        {userProfile ? (
          <div className="dp-inner">
            <div className="dp-left">
              <span className="dp-badge">👤 {t("profileBadge", lang)}</span>
              <h2 className="dp-title">
                Welcome, Citizen of {userProfile.state || "India"}
              </h2>
              <div className="dp-pills">
                <span className="dp-pill">📍 {userProfile.state}</span>
                <span className="dp-pill">💼 {userProfile.occupation}</span>
                <span className="dp-pill">🏷️ {userProfile.category}</span>
                <span className="dp-pill">👤 {userProfile.age} yrs</span>
                <span className="dp-pill">₹ {parseInt(userProfile.income || 0).toLocaleString("en-IN")}/yr</span>
              </div>
            </div>
            <div className="dp-right">
              <button className="btn btn-secondary btn-sm" onClick={onNavigateToForm}>
                Edit Profile ↺
              </button>
            </div>
          </div>
        ) : (
          <div className="dp-guest-banner">
            <div className="dpg-content">
              <span className="dp-badge dpg-badge">🏛️ {t("noProfileBadge", lang)}</span>
              <h2 className="dp-title">{t("dashboardTitle", lang)}</h2>
              <p className="dpg-desc">{t("profileCta", lang)}</p>
            </div>
            <button className="btn btn-primary" onClick={onNavigateToForm}>
              Check Eligibility (2 min) →
            </button>
          </div>
        )}
      </div>

      {/* ── Main Dashboard Grid ────────────────────────────────── */}
      <div className="dashboard-grid">
        {/* Widget 1: Matched Benefits Summary */}
        <div className="dash-card dash-card-matched">
          <div className="dash-card-header">
            <div className="dch-title-group">
              <span className="dash-icon">🎯</span>
              <h3 className="dash-card-title">{t("matchedHeading", lang)}</h3>
            </div>
            {matchResults && (
              <button className="dash-link-btn" onClick={onNavigateToResults}>
                {t("viewResults", lang)}
              </button>
            )}
          </div>

          {matchResults ? (
            <div className="matched-stats-container">
              <div className="mstat-box box-green">
                <span className="mstat-value">{matchResults.fullyEligible.length}</span>
                <span className="mstat-title">{t("fullyEligible", lang)}</span>
                <span className="mstat-sub">100% hard criteria pass</span>
              </div>
              <div className="mstat-box box-yellow">
                <span className="mstat-value">{matchResults.partiallyEligible.length}</span>
                <span className="mstat-title">{t("checkManually", lang)}</span>
                <span className="mstat-sub">Review conditions</span>
              </div>
              <div className="mstat-box box-blue">
                <span className="mstat-value">
                  {matchResults.fullyEligible.length + matchResults.partiallyEligible.length}
                </span>
                <span className="mstat-title">{t("totalMatched", lang)}</span>
                <span className="mstat-sub">Available for you</span>
              </div>
            </div>
          ) : (
            <div className="dash-empty-matched">
              <p>You haven't run your eligibility check yet.</p>
              <button className="btn btn-outline btn-sm" onClick={onNavigateToForm}>
                Check Schemes You Qualify For →
              </button>
            </div>
          )}
        </div>

        {/* Widget 2: Upcoming Deadlines (Top 3) */}
        <div className="dash-card dash-card-deadlines">
          <div className="dash-card-header">
            <div className="dch-title-group">
              <span className="dash-icon">⏰</span>
              <h3 className="dash-card-title">{t("urgentDeadlinesHeading", lang)}</h3>
            </div>
            <button className="dash-link-btn" onClick={onNavigateToDeadlines}>
              {t("viewAllDeadlines", lang)}
            </button>
          </div>

          <div className="dash-deadlines-list">
            {sortedDeadlines.map((scheme) => {
              const urgency = getUrgencyInfo(scheme.deadline);
              const days = calculateDaysRemaining(scheme.deadline);
              return (
                <div key={scheme.id} className="dash-deadline-item">
                  <div className="ddi-top">
                    <span className="ddi-name">{scheme.name}</span>
                    <span className={`urgency-pill ${urgency.tagClass}`}>
                      {urgency.icon} {urgency.shortLabel}
                    </span>
                  </div>
                  <div className="ddi-bottom">
                    <span className="ddi-date">
                      {days !== null ? `${days} calendar days remaining` : scheme.deadlineLabel}
                    </span>
                    <button
                      className="btn-text-action"
                      onClick={() => setSelectedSchemeForModal(scheme)}
                    >
                      Draft Application →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Widget 3: My Applications Snapshot */}
        <div className="dash-card dash-card-pipeline">
          <div className="dash-card-header">
            <div className="dch-title-group">
              <span className="dash-icon">📁</span>
              <h3 className="dash-card-title">{t("myAppsSnapshot", lang)}</h3>
            </div>
            <button className="dash-link-btn" onClick={onNavigateToMyApps}>
              {t("viewMyApps", lang)}
            </button>
          </div>

          <div className="pipeline-stats-grid">
            <div className="pstat-item">
              <span className="pstat-num">{myAppStats.total}</span>
              <span className="pstat-label">Saved</span>
            </div>
            <div className="pstat-item pstat-docs">
              <span className="pstat-num">{myAppStats.docsReady}</span>
              <span className="pstat-label">{t("docsReady", lang)}</span>
            </div>
            <div className="pstat-item pstat-sub">
              <span className="pstat-num">{myAppStats.submitted}</span>
              <span className="pstat-label">{t("submitted", lang)}</span>
            </div>
            <div className="pstat-item pstat-app">
              <span className="pstat-num">{myAppStats.approved}</span>
              <span className="pstat-label">{t("approved", lang)}</span>
            </div>
          </div>
        </div>

        {/* Widget 4: AI Agent Quick Launcher */}
        <div className="dash-card dash-card-ai">
          <div className="dash-card-header">
            <div className="dch-title-group">
              <span className="dash-icon">🤖</span>
              <h3 className="dash-card-title">{t("aiAssistantTitle", lang)}</h3>
            </div>
            <button className="btn btn-hero-ai btn-sm" onClick={() => onNavigateToAi()}>
              <span className="ai-btn-dot" />
              Open Chat
            </button>
          </div>

          <p className="ai-dash-sub">{t("aiAssistantSub", lang)}</p>

          <div className="ai-starter-pills">
            <button
              className="ai-starter-pill"
              onClick={() => handleAiPromptClick(t("askAiPrompt1", lang))}
            >
              💬 "{t("askAiPrompt1", lang)}"
            </button>
            <button
              className="ai-starter-pill"
              onClick={() => handleAiPromptClick(t("askAiPrompt2", lang))}
            >
              💬 "{t("askAiPrompt2", lang)}"
            </button>
            <button
              className="ai-starter-pill"
              onClick={() => handleAiPromptClick(t("askAiPrompt3", lang))}
            >
              💬 "{t("askAiPrompt3", lang)}"
            </button>
          </div>
        </div>
      </div>

      {/* ── Auto-Draft Application Modal ──────────────────────────── */}
      {selectedSchemeForModal && (
        <ApplicationModal
          scheme={selectedSchemeForModal}
          userProfile={userProfile || {}}
          onClose={() => setSelectedSchemeForModal(null)}
        />
      )}
    </div>
  );
}
