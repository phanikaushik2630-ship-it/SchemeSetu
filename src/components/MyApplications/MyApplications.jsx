/**
 * ============================================================
 * MyApplications.jsx — Saved Schemes & Application Status Tracker
 * File: src/components/MyApplications/MyApplications.jsx
 * ============================================================
 * Features:
 *   - Tracks bookmarked schemes
 *   - Multi-stage lifecycle: Not Started -> Documents Ready -> Submitted -> Approved
 *   - Interactive document checklist per saved scheme
 *   - One-click PDF Application Draft generator
 * ============================================================
 */

import { useState } from "react";
import schemesData from "../../data/schemes.json";
import {
  getBookmarkedSchemeIds,
  toggleSchemeBookmark,
  getSchemeStatus,
  setSchemeStatus,
  APPLICATION_STATUSES,
  getDocumentChecks,
  toggleDocumentCheck,
  getDocumentProgress,
} from "../../utils/storageUtils";
import { getUrgencyInfo } from "../../utils/deadlineUtils";
import ApplicationModal from "../ApplicationModal/ApplicationModal";

export default function MyApplications({ userProfile = {}, onGoToForm, onGoToAi }) {
  const [savedIds, setSavedIds] = useState(() => getBookmarkedSchemeIds());
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState(null);
  const [statuses, setStatuses] = useState(() => {
    const map = {};
    schemesData.forEach((s) => {
      map[s.id] = getSchemeStatus(s.id);
    });
    return map;
  });
  const [docChecks, setDocChecks] = useState(() => {
    const map = {};
    schemesData.forEach((s) => {
      map[s.id] = getDocumentChecks(s.id);
    });
    return map;
  });

  // Get full scheme objects for all bookmarked IDs
  const bookmarkedSchemes = schemesData.filter((s) => savedIds.includes(s.id));

  // Compute stats across bookmarked applications
  const stats = bookmarkedSchemes.reduce(
    (acc, s) => {
      const st = statuses[s.id] || "Not Started";
      if (st === "Not Started") acc.notStarted++;
      else if (st === "Documents Ready") acc.docsReady++;
      else if (st === "Submitted") acc.submitted++;
      else if (st === "Approved") acc.approved++;
      return acc;
    },
    { notStarted: 0, docsReady: 0, submitted: 0, approved: 0, total: bookmarkedSchemes.length }
  );

  function handleStatusChange(schemeId, newStatus) {
    setSchemeStatus(schemeId, newStatus);
    setStatuses((prev) => ({ ...prev, [schemeId]: newStatus }));
  }

  function handleRemoveBookmark(schemeId) {
    toggleSchemeBookmark(schemeId);
    setSavedIds(getBookmarkedSchemeIds());
  }

  function handleDocToggle(schemeId, docName) {
    toggleDocumentCheck(schemeId, docName);
    setDocChecks((prev) => ({
      ...prev,
      [schemeId]: { ...getDocumentChecks(schemeId) },
    }));
  }

  // Filter schemes by status tab
  const filtered = bookmarkedSchemes.filter((s) => {
    if (statusFilter === "all") return true;
    return (statuses[s.id] || "Not Started") === statusFilter;
  });

  return (
    <div className="my-applications-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="myapps-hero">
        <div className="myapps-badge">📁 Application Management Dashboard</div>
        <h1 className="myapps-title">My Saved Applications</h1>
        <p className="myapps-subtitle">
          Track your progress, organize verification documents, monitor application stages, and generate auto-filled drafts for submission.
        </p>
      </div>

      {/* ── Status Metrics Bar ─────────────────────────────────── */}
      <div className="myapps-stats-row">
        <div
          className={`mstat-card ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <span className="mstat-num">{stats.total}</span>
          <span className="mstat-label">Total Saved</span>
        </div>
        <div
          className={`mstat-card mstat-notstarted ${statusFilter === "Not Started" ? "active" : ""}`}
          onClick={() => setStatusFilter("Not Started")}
        >
          <span className="mstat-num">{stats.notStarted}</span>
          <span className="mstat-label">Not Started</span>
        </div>
        <div
          className={`mstat-card mstat-docs ${statusFilter === "Documents Ready" ? "active" : ""}`}
          onClick={() => setStatusFilter("Documents Ready")}
        >
          <span className="mstat-num">{stats.docsReady}</span>
          <span className="mstat-label">Docs Ready</span>
        </div>
        <div
          className={`mstat-card mstat-submitted ${statusFilter === "Submitted" ? "active" : ""}`}
          onClick={() => setStatusFilter("Submitted")}
        >
          <span className="mstat-num">{stats.submitted}</span>
          <span className="mstat-label">Submitted</span>
        </div>
        <div
          className={`mstat-card mstat-approved ${statusFilter === "Approved" ? "active" : ""}`}
          onClick={() => setStatusFilter("Approved")}
        >
          <span className="mstat-num">{stats.approved}</span>
          <span className="mstat-label">Approved</span>
        </div>
      </div>

      {/* ── Filter Tabs ────────────────────────────────────────── */}
      {bookmarkedSchemes.length > 0 && (
        <div className="myapps-tabs">
          <button
            className={`myapps-tab ${statusFilter === "all" ? "tab-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Saved ({stats.total})
          </button>
          {APPLICATION_STATUSES.map((st) => (
            <button
              key={st}
              className={`myapps-tab ${statusFilter === st ? "tab-active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* ── Applications List ──────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="myapps-grid">
          {filtered.map((scheme) => {
            const currentStatus = statuses[scheme.id] || "Not Started";
            const urgency = getUrgencyInfo(scheme.deadline);
            const progress = getDocumentProgress(scheme.id, scheme.requiredDocuments);
            const checks = docChecks[scheme.id] || {};

            return (
              <div key={scheme.id} className="myapp-card">
                <div className="myapp-card-top">
                  <div className="myapp-badges">
                    <span className={`badge ${scheme.type === "Central" ? "badge-central" : "badge-state"}`}>
                      {scheme.type}
                    </span>
                    {scheme.state && <span className="badge badge-state-name">{scheme.state}</span>}
                    <span className={`urgency-pill ${urgency.tagClass}`}>
                      {urgency.icon} {urgency.label}
                    </span>
                  </div>
                  <button
                    className="myapp-remove-btn"
                    onClick={() => handleRemoveBookmark(scheme.id)}
                    title="Remove from saved"
                    aria-label="Remove scheme from saved"
                  >
                    🗑️
                  </button>
                </div>

                <h3 className="myapp-title">{scheme.name}</h3>
                <p className="myapp-benefit">
                  <strong>Benefit:</strong> {scheme.benefit}
                </p>

                {/* Status Stage Selector */}
                <div className="myapp-status-box">
                  <span className="status-label">Application Status:</span>
                  <div className="status-button-group">
                    {APPLICATION_STATUSES.map((st) => (
                      <button
                        key={st}
                        className={`status-btn ${currentStatus === st ? `status-active-${st.replace(/\s+/g, "").toLowerCase()}` : ""}`}
                        onClick={() => handleStatusChange(scheme.id, st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Document Readiness Progress */}
                <div className="myapp-doc-tracker">
                  <div className="doc-tracker-header">
                    <span className="doc-tracker-title">📄 Documents Checklist</span>
                    <span className="doc-tracker-count">
                      {progress.completed}/{progress.total} arranged ({progress.percent}%)
                    </span>
                  </div>
                  <div className="doc-tracker-bar">
                    <div
                      className={`doc-tracker-fill ${progress.isAllReady ? "fill-complete" : ""}`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <div className="doc-tracker-checklist">
                    {scheme.requiredDocuments.map((doc) => {
                      const isReady = !!checks[doc];
                      return (
                        <label key={doc} className={`doc-mini-row ${isReady ? "ready" : ""}`}>
                          <input
                            type="checkbox"
                            checked={isReady}
                            onChange={() => handleDocToggle(scheme.id, doc)}
                          />
                          <span className="doc-mini-box">{isReady ? "✓" : ""}</span>
                          <span className="doc-mini-name">{doc}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="myapp-actions">
                  <button
                    className="btn btn-draft-app"
                    onClick={() => setSelectedSchemeForModal(scheme)}
                  >
                    📝 Generate Application Draft
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
            );
          })}
        </div>
      ) : (
        <div className="myapps-empty">
          <div className="empty-icon">📁</div>
          <h3 className="empty-title">
            {savedIds.length === 0
              ? "No saved applications yet"
              : `No applications with status "${statusFilter}"`}
          </h3>
          <p className="empty-desc">
            {savedIds.length === 0
              ? "Bookmark schemes from your eligibility results or search to track your document checklist, application status, and generate auto-filled drafts."
              : "Try selecting a different status filter above to see your other saved schemes."}
          </p>
          {savedIds.length === 0 && (
            <div className="empty-action-btns">
              <button className="btn btn-primary" onClick={onGoToForm}>
                Check Eligibility Now →
              </button>
              <button className="btn btn-secondary" onClick={onGoToAi}>
                Ask AI to Find Schemes →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Auto-Draft Application Modal ──────────────────────────── */}
      {selectedSchemeForModal && (
        <ApplicationModal
          scheme={selectedSchemeForModal}
          userProfile={userProfile}
          onClose={() => setSelectedSchemeForModal(null)}
        />
      )}
    </div>
  );
}
