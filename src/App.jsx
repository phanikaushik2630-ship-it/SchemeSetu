/**
 * ============================================================
 * App.jsx — SchemeSetu Main Application (Phase 1 + 2 + 3 + 4)
 * ============================================================
 * Views:
 *   1. "dashboard"       — Unified Civic-Tech Dashboard (Phase 4)
 *   2. "explorer"        — Searchable Scheme Explorer (Phase 4)
 *   3. "landing"         — Hero Landing Page
 *   4. "form"            — Multi-step Profile Questionnaire (Phase 1)
 *   5. "results"         — Matched Results with Auto-Draft (Phase 1+3)
 *   6. "chat"            — Autonomous AI Agent Chat (Phase 2)
 *   7. "deadlines"       — Deadline Urgency Tracker (Phase 3)
 *   8. "my-applications" — Saved Applications & Status Pipeline (Phase 3)
 * ============================================================
 */

import { useState, useEffect } from "react";
import MultiStepForm from "./components/MultiStepForm/MultiStepForm";
import ResultsPage from "./components/ResultsPage/ResultsPage";
import ChatInterface from "./components/ChatInterface/ChatInterface";
import DeadlineTracker from "./components/DeadlineTracker/DeadlineTracker";
import MyApplications from "./components/MyApplications/MyApplications";
import Dashboard from "./components/Dashboard/Dashboard";
import SchemeExplorer from "./components/SchemeExplorer/SchemeExplorer";
import { matchSchemes } from "./engine/matchSchemes";
import schemesData from "./data/schemes.json";
import { getBookmarkedSchemeIds } from "./utils/storageUtils";
import { getClosingSoonCount } from "./utils/deadlineUtils";
import {
  t,
  SUPPORTED_LANGUAGES,
  getStoredLanguage,
  setStoredLanguage,
  getStoredFontScale,
  setStoredFontScale,
  applyFontScale,
  getStoredTheme,
  setStoredTheme,
  applyTheme,
} from "./utils/i18n";
import "./App.css";

export default function App() {
  // View state: "dashboard" | "explorer" | "landing" | "form" | "results" | "chat" | "deadlines" | "my-applications"
  const [view, setView] = useState("dashboard");

  // Query passed from Dashboard search into Scheme Explorer
  const [explorerQuery, setExplorerQuery] = useState("");

  // The citizen profile JSON from questionnaire
  const [userProfile, setUserProfile] = useState(null);

  // Matched results returned by engine
  const [matchResults, setMatchResults] = useState(null);

  // Bookmarked count for header badge
  const [savedCount, setSavedCount] = useState(() => getBookmarkedSchemeIds().length);

  // Closing soon schemes count for header badge
  const criticalCount = getClosingSoonCount(schemesData);

  // Accessibility & i18n states
  const [lang, setLang] = useState(() => getStoredLanguage());
  const [fontScale, setFontScale] = useState(() => getStoredFontScale());
  const [theme, setTheme] = useState(() => getStoredTheme());

  // Apply font scale and theme on initial mount
  useEffect(() => {
    applyFontScale(fontScale);
    applyTheme(theme);
  }, []);

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    setStoredTheme(newTheme);
  }

  function handleLanguageChange(newLang) {
    setLang(newLang);
    setStoredLanguage(newLang);
  }

  function handleFontScaleChange(scale) {
    setFontScale(scale);
    setStoredFontScale(scale);
  }

  function handleFormSubmit(profile) {
    const results = matchSchemes(profile, schemesData);
    setUserProfile(profile);
    setMatchResults(results);
    setView("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStartForm() {
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOpenChat(prefillPrompt = "") {
    setView("chat");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOpenDeadlines() {
    setView("deadlines");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOpenMyApplications() {
    setSavedCount(getBookmarkedSchemeIds().length);
    setView("my-applications");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOpenExplorer(query = "") {
    setExplorerQuery(query);
    setView("explorer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-root">
      {/* ── 1. Top Government Accessibility Toolbar ─────────────── */}
      <div className="accessibility-bar">
        <div className="accessibility-inner">
          <div className="a11y-left">
            <span className="gov-flag-icon">🇮🇳</span>
            <span className="gov-tagline">
              National Government Scheme Bridge · SchemeSetu
            </span>
          </div>

          <div className="a11y-right">
            {/* Theme Background Adjust */}
            <div className="a11y-group theme-toggle-group">
              <span className="a11y-label">{t("themeLabel", lang)}</span>
              <button
                className={`theme-btn ${theme === "light" ? "active" : ""}`}
                onClick={() => handleThemeChange("light")}
                title="Light Background"
                aria-label="Light Background"
              >
                ☀️ {t("themeLight", lang)}
              </button>
              <button
                className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                onClick={() => handleThemeChange("dark")}
                title="Dark Background"
                aria-label="Dark Background"
              >
                🌙 {t("themeDark", lang)}
              </button>
            </div>

            {/* Font size scaling */}
            <div className="a11y-group">
              <span className="a11y-label">{t("fontSize", lang)}</span>
              <button
                className={`font-scale-btn ${fontScale === "small" ? "active" : ""}`}
                onClick={() => handleFontScaleChange("small")}
                title="Decrease Text Size"
                aria-label="Decrease Text Size"
              >
                A-
              </button>
              <button
                className={`font-scale-btn ${fontScale === "normal" ? "active" : ""}`}
                onClick={() => handleFontScaleChange("normal")}
                title="Default Text Size"
                aria-label="Default Text Size"
              >
                A
              </button>
              <button
                className={`font-scale-btn ${fontScale === "large" ? "active" : ""}`}
                onClick={() => handleFontScaleChange("large")}
                title="Increase Text Size"
                aria-label="Increase Text Size"
              >
                A+
              </button>
            </div>

            {/* Language Toggle */}
            <div className="a11y-group">
              <span className="a11y-label">{t("language", lang)}</span>
              {SUPPORTED_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  className={`lang-btn ${lang === item.code ? "active" : ""}`}
                  onClick={() => handleLanguageChange(item.code)}
                >
                  {item.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Primary Navigation Bar ─────────────────────────── */}
      <header className="app-header">
        <div className="header-inner">
          <button className="logo-btn" onClick={handleReset}>
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">
              Scheme<span className="logo-accent">Setu</span>
            </span>
          </button>

          <nav className="header-nav">
            {/* Unified Dashboard (Phase 4) */}
            <button
              className={`nav-link ${view === "dashboard" ? "nav-active" : ""}`}
              onClick={() => setView("dashboard")}
            >
              🏛️ {t("navDashboard", lang)}
            </button>

            {/* Explore Schemes Catalog (Phase 4) */}
            <button
              className={`nav-link ${view === "explorer" ? "nav-active" : ""}`}
              onClick={() => handleOpenExplorer("")}
            >
              🔎 {t("navExplore", lang)}
            </button>

            {/* Phase 1: Eligibility Check */}
            <button
              className={`nav-link ${view === "form" ? "nav-active" : ""}`}
              onClick={handleStartForm}
            >
              📋 {t("navEligibility", lang)}
            </button>

            {/* Phase 3: Deadlines Tracker */}
            <button
              className={`nav-link nav-deadlines-btn ${view === "deadlines" ? "nav-active" : ""}`}
              onClick={handleOpenDeadlines}
              title="Track application cutoffs and cycles"
            >
              ⏰ {t("navDeadlines", lang)}
              {criticalCount > 0 && (
                <span className="nav-urgent-badge" title={`${criticalCount} schemes closing soon`}>
                  {criticalCount}
                </span>
              )}
            </button>

            {/* Phase 3: My Applications */}
            <button
              className={`nav-link ${view === "my-applications" ? "nav-active" : ""}`}
              onClick={handleOpenMyApplications}
              title="View saved schemes & document progress"
            >
              📁 {t("navMyApplications", lang)}
              {savedCount > 0 && (
                <span className="nav-count-badge">{savedCount}</span>
              )}
            </button>

            {/* Phase 2: AI Agent button */}
            <button
              className={`nav-link nav-ai-btn ${view === "chat" ? "nav-active" : ""}`}
              onClick={() => handleOpenChat()}
              title="Ask AI Agent about schemes & eligibility"
            >
              <span className="nav-ai-dot" aria-hidden="true" />
              🤖 {t("navAskAi", lang)}
            </button>
          </nav>
        </div>
      </header>

      {/* ── 3. Main Views Content ─────────────────────────────── */}
      <main className="app-main">
        {/* Phase 4: Unified Dashboard */}
        {view === "dashboard" && (
          <Dashboard
            userProfile={userProfile}
            matchResults={matchResults}
            onNavigateToForm={handleStartForm}
            onNavigateToResults={() => setView("results")}
            onNavigateToDeadlines={handleOpenDeadlines}
            onNavigateToMyApps={handleOpenMyApplications}
            onNavigateToAi={handleOpenChat}
            onNavigateToExplorer={handleOpenExplorer}
            lang={lang}
          />
        )}

        {/* Phase 4: Searchable Scheme Explorer */}
        {view === "explorer" && (
          <SchemeExplorer
            userProfile={userProfile}
            initialQuery={explorerQuery}
            lang={lang}
          />
        )}

        {/* Phase 1: Multi-Step Form */}
        {view === "form" && <MultiStepForm onSubmit={handleFormSubmit} />}

        {/* Phase 1 + 3: Matched Results with Auto-Draft */}
        {view === "results" && matchResults && (
          <ResultsPage
            results={matchResults}
            userProfile={userProfile}
            onReset={handleReset}
            onChat={handleOpenChat}
            onNavigateToDeadlines={handleOpenDeadlines}
            onNavigateToSaved={handleOpenMyApplications}
          />
        )}

        {/* Phase 2: AI Agent Chat Interface */}
        {view === "chat" && (
          <ChatInterface
            userProfile={userProfile}
            onGoToForm={handleStartForm}
          />
        )}

        {/* Phase 3: Dedicated Deadline Urgency Calendar */}
        {view === "deadlines" && (
          <DeadlineTracker
            userProfile={userProfile}
            onNavigateToForm={handleStartForm}
            onNavigateToAi={handleOpenChat}
          />
        )}

        {/* Phase 3: My Applications Management Dashboard */}
        {view === "my-applications" && (
          <MyApplications
            userProfile={userProfile}
            onGoToForm={handleStartForm}
            onGoToAi={handleOpenChat}
          />
        )}
      </main>

      {/* ── 4. Civic-Tech Footer ───────────────────────────────── */}
      <footer className="app-footer">
        <p>
          SchemeSetu — Official Government Scheme Bridge for Indian Citizens.
          All application drafting operates 100% privately in your browser.
        </p>
        <p className="footer-sub">
          Phase 1 (Eligibility) · Phase 2 (Autonomous AI Agent) · Phase 3 (Auto-Draft &amp; Deadlines) · Phase 4 (Unified Dashboard &amp; Search)
        </p>
      </footer>
    </div>
  );
}
