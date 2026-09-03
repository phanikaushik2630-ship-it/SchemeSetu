/**
 * ============================================================
 * SchemeExplorer.jsx — Searchable Scheme Explorer (Phase 4)
 * File: src/components/SchemeExplorer/SchemeExplorer.jsx
 * ============================================================
 * Searchable catalog of all 20 Central & State schemes:
 *  - Real-time keyword search
 *  - Type filter (Central vs State)
 *  - Benefit type filter (Cash, Loan, Scholarship, Subsidy, etc.)
 *  - Category filter chips (Farmers, Students, Health, Women, etc.)
 *  - 1-click bookmarking & Auto-Draft PDF generation
 * ============================================================
 */

import { useState, useMemo } from "react";
import schemesData from "../../data/schemes.json";
import { getUrgencyInfo } from "../../utils/deadlineUtils";
import {
  isSchemeBookmarked,
  toggleSchemeBookmark,
  getDocumentChecks,
  toggleDocumentCheck,
  getDocumentProgress,
} from "../../utils/storageUtils";
import { t } from "../../utils/i18n";
import ApplicationModal from "../ApplicationModal/ApplicationModal";

const BENEFIT_CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "farmer", label: "🌾 Agriculture & Farmers" },
  { id: "student", label: "📚 Students & Education" },
  { id: "business", label: "🏦 MSME & Small Business" },
  { id: "housing", label: "🏠 Housing & Infrastructure" },
  { id: "health", label: "🛡️ Healthcare & Insurance" },
  { id: "women", label: "👩 Women & Child Welfare" },
  { id: "pension", label: "👴 Pensions & Social Security" },
];

export default function SchemeExplorer({
  userProfile = {},
  initialQuery = "",
  lang = "en",
}) {
  const [search, setSearch] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "Central" | "State"
  const [stateFilter, setStateFilter] = useState("all"); // "all" | "Andhra Pradesh" | "Telangana"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [benefitTypeFilter, setBenefitTypeFilter] = useState("all");
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState(null);
  const [expandedDocs, setExpandedDocs] = useState({});
  const [bookmarks, setBookmarks] = useState(() =>
    schemesData.reduce((acc, s) => ({ ...acc, [s.id]: isSchemeBookmarked(s.id) }), {})
  );
  const [docChecks, setDocChecks] = useState(() =>
    schemesData.reduce((acc, s) => ({ ...acc, [s.id]: getDocumentChecks(s.id) }), {})
  );

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemesData.filter((s) => {
      // 1. Keyword search (Name, description, benefit, notes)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchBenefit = s.benefit.toLowerCase().includes(q);
        const matchNotes = s.notes?.toLowerCase().includes(q);
        const matchState = s.state?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchBenefit && !matchNotes && !matchState) {
          return false;
        }
      }

      // 2. Scheme Type Filter
      if (typeFilter !== "all" && s.type !== typeFilter) return false;

      // 3. State Filter
      if (stateFilter !== "all" && s.state !== stateFilter) return false;

      // 4. Benefit Type Filter
      if (benefitTypeFilter !== "all" && s.benefitType !== benefitTypeFilter) return false;

      // 5. Category filter
      if (categoryFilter !== "all") {
        if (categoryFilter === "farmer") {
          const isAgri = s.eligibility?.occupation?.includes("farmer") || s.name.toLowerCase().includes("kisan") || s.name.toLowerCase().includes("rythu");
          if (!isAgri) return false;
        } else if (categoryFilter === "student") {
          const isEdu = s.eligibility?.occupation?.includes("student") || s.benefitType === "scholarship" || s.name.toLowerCase().includes("scholarship");
          if (!isEdu) return false;
        } else if (categoryFilter === "business") {
          const isBiz = s.eligibility?.occupation?.includes("small business owner") || s.benefitType === "loan" || s.name.toLowerCase().includes("mudra") || s.name.toLowerCase().includes("stand-up") || s.name.toLowerCase().includes("vishwakarma");
          if (!isBiz) return false;
        } else if (categoryFilter === "housing") {
          const isHouse = s.name.toLowerCase().includes("awas") || s.name.toLowerCase().includes("pmay") || s.name.toLowerCase().includes("svamitva");
          if (!isHouse) return false;
        } else if (categoryFilter === "health") {
          const isHealth = s.benefitType === "insurance" || s.name.toLowerCase().includes("aarogyasri") || s.name.toLowerCase().includes("ayushman") || s.name.toLowerCase().includes("bima");
          if (!isHealth) return false;
        } else if (categoryFilter === "women") {
          const isWomen = s.eligibility?.gender === "female" || s.name.toLowerCase().includes("sukanya") || s.name.toLowerCase().includes("kcr kit") || s.name.toLowerCase().includes("stand-up");
          if (!isWomen) return false;
        } else if (categoryFilter === "pension") {
          const isPen = s.benefitType === "pension" || s.name.toLowerCase().includes("pension");
          if (!isPen) return false;
        }
      }

      return true;
    });
  }, [search, typeFilter, stateFilter, categoryFilter, benefitTypeFilter]);

  function handleBookmarkToggle(schemeId) {
    const isNow = toggleSchemeBookmark(schemeId);
    setBookmarks((prev) => ({ ...prev, [schemeId]: isNow }));
  }

  function handleDocCheckToggle(schemeId, docName) {
    toggleDocumentCheck(schemeId, docName);
    setDocChecks((prev) => ({
      ...prev,
      [schemeId]: { ...getDocumentChecks(schemeId) },
    }));
  }

  function toggleDocsList(schemeId) {
    setExpandedDocs((prev) => ({ ...prev, [schemeId]: !prev[schemeId] }));
  }

  function handleResetFilters() {
    setSearch("");
    setTypeFilter("all");
    setStateFilter("all");
    setCategoryFilter("all");
    setBenefitTypeFilter("all");
  }

  return (
    <div className="explorer-page">
      {/* ── Explorer Hero ────────────────────────────────────────── */}
      <div className="explorer-hero">
        <span className="explorer-badge">🔎 {t("navExplore", lang)}</span>
        <h1 className="explorer-title">{t("explorerTitle", lang)}</h1>
        <p className="explorer-subtitle">{t("explorerSub", lang)}</p>

        {/* Big Search Bar */}
        <div className="explorer-search-wrapper">
          <span className="es-icon">🔍</span>
          <input
            type="text"
            className="explorer-search-input"
            placeholder={t("searchPlaceholder", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="es-clear" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Controls Section ──────────────────────────────── */}
      <div className="explorer-filters-panel">
        {/* Category Filter Chips */}
        <div className="filter-chips-row">
          {BENEFIT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`filter-chip ${categoryFilter === cat.id ? "chip-active" : ""}`}
              onClick={() => setCategoryFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="filter-dropdowns-row">
          <div className="dropdown-group">
            <label className="dropdown-label">{t("filterCategory", lang)}:</label>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Schemes ({schemesData.length})</option>
              <option value="Central">Central Govt (16)</option>
              <option value="State">State Govt (4)</option>
            </select>
          </div>

          <div className="dropdown-group">
            <label className="dropdown-label">State:</label>
            <select
              className="filter-select"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="all">All States</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
            </select>
          </div>

          <div className="dropdown-group">
            <label className="dropdown-label">{t("filterBenefitType", lang)}:</label>
            <select
              className="filter-select"
              value={benefitTypeFilter}
              onChange={(e) => setBenefitTypeFilter(e.target.value)}
            >
              <option value="all">All Benefits</option>
              <option value="cash">Direct Cash Transfer</option>
              <option value="grant">Grant / Housing</option>
              <option value="loan">Loans & Credit</option>
              <option value="scholarship">Scholarships</option>
              <option value="insurance">Health & Life Insurance</option>
              <option value="pension">Pension</option>
            </select>
          </div>

          {(search || typeFilter !== "all" || stateFilter !== "all" || categoryFilter !== "all" || benefitTypeFilter !== "all") && (
            <button className="reset-filters-btn" onClick={handleResetFilters}>
              Reset Filters ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Results Count Bar ────────────────────────────────────── */}
      <div className="explorer-results-bar">
        <span className="results-count-text">
          Showing <strong>{filteredSchemes.length}</strong> {t("schemesFound", lang)}
        </span>
      </div>

      {/* ── Schemes Grid ─────────────────────────────────────────── */}
      <div className="explorer-grid">
        {filteredSchemes.map((scheme) => {
          const isSaved = !!bookmarks[scheme.id];
          const urgency = getUrgencyInfo(scheme.deadline);
          const progress = getDocumentProgress(scheme.id, scheme.requiredDocuments);
          const docsOpen = !!expandedDocs[scheme.id];
          const checks = docChecks[scheme.id] || {};

          return (
            <div key={scheme.id} className="explorer-card">
              <div className="ec-top">
                <div className="ec-badges">
                  <span className={`badge ${scheme.type === "Central" ? "badge-central" : "badge-state"}`}>
                    {scheme.type}
                  </span>
                  {scheme.state && <span className="badge badge-state-name">{scheme.state}</span>}
                  <span className={`urgency-pill ${urgency.tagClass}`}>
                    {urgency.icon} {urgency.shortLabel}
                  </span>
                </div>
                <button
                  className={`bookmark-btn ${isSaved ? "bookmarked" : ""}`}
                  onClick={() => handleBookmarkToggle(scheme.id)}
                  title={isSaved ? "Saved in My Applications" : "Save to My Applications"}
                >
                  <span className="bookmark-icon">{isSaved ? "★" : "☆"}</span>
                  <span>{isSaved ? t("saved", lang) : t("save", lang)}</span>
                </button>
              </div>

              <h3 className="ec-title">{scheme.name}</h3>
              <p className="ec-desc">{scheme.description}</p>

              <div className="ec-benefit-box">
                <span className="ec-benefit-label">Benefit:</span>
                <span className="ec-benefit-val">{scheme.benefit}</span>
              </div>

              {/* Deadline reminder */}
              <div className="ec-deadline-line">
                <span className="ed-icon">⏰</span>
                <span className="ed-text">{scheme.deadlineLabel || scheme.deadline}</span>
              </div>

              {/* Interactive Document Checklist Toggle */}
              <div className="ec-docs-area">
                <button
                  className="ec-docs-toggle"
                  onClick={() => toggleDocsList(scheme.id)}
                >
                  <span>📄 Documents ({progress.completed}/{progress.total} arranged)</span>
                  <span className={`docs-arrow ${docsOpen ? "open" : ""}`}>▼</span>
                </button>

                {docsOpen && (
                  <div className="ec-docs-list">
                    {scheme.requiredDocuments.map((doc) => {
                      const isChecked = !!checks[doc];
                      return (
                        <label key={doc} className={`doc-mini-row ${isChecked ? "ready" : ""}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleDocCheckToggle(scheme.id, doc)}
                          />
                          <span className="doc-mini-box">{isChecked ? "✓" : ""}</span>
                          <span className="doc-mini-name">{doc}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="ec-actions">
                <button
                  className="btn btn-draft-app"
                  onClick={() => setSelectedSchemeForModal(scheme)}
                >
                  📝 {t("generateApp", lang)}
                </button>
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-apply"
                >
                  {t("officialPortal", lang)} →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="explorer-empty">
          <div className="empty-icon">🔎</div>
          <h3>No schemes matched your search</h3>
          <p>Try searching with a broader term or resetting your filters.</p>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      )}

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
