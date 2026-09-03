/**
 * ============================================================
 * SchemeCard.jsx — Rich Scheme Result Card (Phase 1 + 3)
 * File: src/components/SchemeCard/SchemeCard.jsx
 * ============================================================
 * Features:
 *   - Match score bar & qualification criteria (Phase 1)
 *   - Deadline Urgency Badge (Phase 3)
 *   - Interactive Document Checklist Tracker (Phase 3)
 *   - Bookmark / Save to My Applications toggle (Phase 3)
 *   - "Generate Application" Auto-Draft trigger (Phase 3)
 * ============================================================
 */

import { useState } from "react";
import { getUrgencyInfo } from "../../utils/deadlineUtils";
import {
  isSchemeBookmarked,
  toggleSchemeBookmark,
  getDocumentChecks,
  toggleDocumentCheck,
  getDocumentProgress,
} from "../../utils/storageUtils";
import ApplicationModal from "../ApplicationModal/ApplicationModal";

// Maps benefit type keys to human-readable labels and icons
const BENEFIT_TYPE_META = {
  cash: { icon: "💵", label: "Cash Transfer" },
  grant: { icon: "🏗️", label: "Grant" },
  subsidy: { icon: "📉", label: "Subsidy" },
  insurance: { icon: "🛡️", label: "Insurance" },
  scholarship: { icon: "📚", label: "Scholarship" },
  loan: { icon: "🏦", label: "Loan" },
  pension: { icon: "👴", label: "Pension" },
  savings: { icon: "🐖", label: "Savings Scheme" },
  stipend: { icon: "💰", label: "Stipend" },
  training_and_cash: { icon: "🎯", label: "Training + Cash" },
  grant_and_loan: { icon: "🤝", label: "Grant + Loan" },
  property_rights: { icon: "📜", label: "Property Rights" },
};

const TYPE_META = {
  Central: { badge: "Central Scheme", color: "badge-central" },
  State: { badge: "State Scheme", color: "badge-state" },
};

export default function SchemeCard({ result, userProfile = {}, onBookmarkChange }) {
  const { scheme, matchScore, matchedCriteria, missedCriteria, eligibilityType } = result;

  // State
  const [docsOpen, setDocsOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isSchemeBookmarked(scheme.id));
  const [docChecks, setDocChecks] = useState(() => getDocumentChecks(scheme.id));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const benefitMeta = BENEFIT_TYPE_META[scheme.benefitType] || { icon: "📋", label: "Benefit" };
  const typeMeta = TYPE_META[scheme.type] || { badge: scheme.type, color: "badge-central" };
  const urgency = getUrgencyInfo(scheme.deadline);
  const docProgress = getDocumentProgress(scheme.id, scheme.requiredDocuments);

  function handleBookmarkToggle() {
    const isNowSaved = toggleSchemeBookmark(scheme.id);
    setBookmarked(isNowSaved);
    if (onBookmarkChange) onBookmarkChange(scheme.id, isNowSaved);
  }

  function handleDocCheckToggle(doc) {
    toggleDocumentCheck(scheme.id, doc);
    setDocChecks({ ...getDocumentChecks(scheme.id) });
  }

  return (
    <>
      <div className={`scheme-card ${eligibilityType === "full" ? "card-full" : "card-partial"}`}>
        {/* ── Card Header ─────────────────────────────────────────── */}
        <div className="card-header">
          <div className="card-top-bar">
            <div className="card-badges">
              <span className={`badge ${typeMeta.color}`}>{typeMeta.badge}</span>
              {scheme.state && (
                <span className="badge badge-state-name">{scheme.state}</span>
              )}
              {/* Phase 3 Deadline Urgency Pill */}
              <span className={`badge urgency-badge ${urgency.tagClass}`}>
                {urgency.icon} {urgency.label}
              </span>
            </div>

            {/* Bookmark button */}
            <button
              className={`bookmark-btn ${bookmarked ? "bookmarked" : ""}`}
              onClick={handleBookmarkToggle}
              title={bookmarked ? "Remove from My Applications" : "Save to My Applications"}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark scheme"}
            >
              <span className="bookmark-icon">{bookmarked ? "★" : "☆"}</span>
              <span className="bookmark-text">{bookmarked ? "Saved" : "Save"}</span>
            </button>
          </div>

          <h3 className="card-name">{scheme.name}</h3>
          <p className="card-description">{scheme.description}</p>
        </div>

        {/* ── Benefit Highlight ────────────────────────────────────── */}
        <div className="card-benefit">
          <span className="benefit-icon">{benefitMeta.icon}</span>
          <div>
            <span className="benefit-type-label">{benefitMeta.label}</span>
            <span className="benefit-value">{scheme.benefit}</span>
          </div>
        </div>

        {/* ── Match Score Bar ──────────────────────────────────────── */}
        <div className="match-score-row">
          <span className="match-score-label">Match Score</span>
          <div className="match-score-bar">
            <div
              className="match-score-fill"
              style={{ width: `${matchScore}%` }}
            />
          </div>
          <span className="match-score-pct">{matchScore}%</span>
        </div>

        {/* ── Why You Matched ──────────────────────────────────────── */}
        {matchedCriteria && matchedCriteria.length > 0 && (
          <div className="criteria-section">
            <p className="criteria-heading matched-heading">✅ Why you qualify:</p>
            <ul className="criteria-list">
              {matchedCriteria.map((c, i) => (
                <li key={i} className="criteria-item matched-item">
                  <span className="criteria-dot matched-dot" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Missed Criteria (only for partial) ──────────────────── */}
        {eligibilityType === "partial" && missedCriteria && missedCriteria.length > 0 && (
          <div className="criteria-section">
            <p className="criteria-heading missed-heading">⚠️ Check these conditions:</p>
            <ul className="criteria-list">
              {missedCriteria.map((c, i) => (
                <li key={i} className="criteria-item missed-item">
                  <span className="criteria-dot missed-dot" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Interactive Document Checklist Tracker (Phase 3) ─────── */}
        <div className="docs-section">
          <button
            className="docs-toggle"
            onClick={() => setDocsOpen((o) => !o)}
            aria-expanded={docsOpen}
          >
            <div className="docs-toggle-left">
              <span>📄 Document Checklist</span>
              <span className="docs-counter">
                {docProgress.completed}/{docProgress.total} Ready
              </span>
              {docProgress.isAllReady && (
                <span className="docs-ready-pill">All Ready!</span>
              )}
            </div>
            <span className={`docs-arrow ${docsOpen ? "open" : ""}`}>▼</span>
          </button>

          {/* Interactive Checklist List */}
          {docsOpen && (
            <div className="docs-interactive-box">
              <p className="docs-instruction">
                Tick off documents you have arranged (progress is saved automatically):
              </p>
              <div className="interactive-checklist">
                {scheme.requiredDocuments.map((doc) => {
                  const isChecked = !!docChecks[doc];
                  return (
                    <label key={doc} className={`doc-item-row ${isChecked ? "is-ready" : ""}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDocCheckToggle(doc)}
                      />
                      <span className="doc-check-box">{isChecked ? "✓" : ""}</span>
                      <span className="doc-item-name">{doc}</span>
                      {isChecked && <span className="doc-status-tag">Ready</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Notes (if any) ──────────────────────────────────────── */}
        {scheme.notes && (
          <div className="card-notes">
            <span className="notes-icon">💡</span>
            <span>{scheme.notes}</span>
          </div>
        )}

        {/* ── Card Footer Actions (Phase 1 Apply + Phase 3 Auto-Draft) ── */}
        <div className="card-footer card-actions-dual">
          <button
            className="btn btn-draft-app"
            onClick={() => setIsModalOpen(true)}
            title="Pre-fill and generate draft application PDF"
          >
            <span className="draft-btn-icon">📝</span>
            Generate Application
          </button>
          <a
            href={scheme.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-apply"
          >
            Official Portal →
          </a>
        </div>
      </div>

      {/* ── Application Draft Generator Modal ────────────────────── */}
      {isModalOpen && (
        <ApplicationModal
          scheme={scheme}
          userProfile={userProfile}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
