/**
 * ============================================================
 * DeadlineTracker.jsx — Dedicated Deadline & Urgency Dashboard
 * File: src/components/DeadlineTracker/DeadlineTracker.jsx
 * ============================================================
 * Features:
 *   - Overview stats (Closing Soon, Upcoming, Rolling)
 *   - Reminder alert banner for schemes closing within 30 days
 *   - Urgency filters & countdown timers
 *   - Quick "Generate Application" and "Apply" buttons
 * ============================================================
 */

import { useState } from "react";
import schemesData from "../../data/schemes.json";
import { getUrgencyInfo, calculateDaysRemaining, sortSchemesByUrgency } from "../../utils/deadlineUtils";
import ApplicationModal from "../ApplicationModal/ApplicationModal";
import { isSchemeBookmarked, toggleSchemeBookmark } from "../../utils/storageUtils";

export default function DeadlineTracker({ userProfile = {}, onNavigateToForm, onNavigateToAi }) {
  const [filter, setFilter] = useState("all"); // "all" | "critical" | "upcoming" | "rolling"
  const [search, setSearch] = useState("");
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => schemesData.map((s) => ({ id: s.id, saved: isSchemeBookmarked(s.id) })));

  // Calculate statistics across all 20 schemes
  const stats = schemesData.reduce(
    (acc, s) => {
      const u = getUrgencyInfo(s.deadline);
      if (u.level === "critical") acc.critical++;
      else if (u.level === "upcoming") acc.upcoming++;
      else acc.rolling++;
      return acc;
    },
    { critical: 0, upcoming: 0, rolling: 0, total: schemesData.length }
  );

  // Filter and sort schemes
  const sorted = sortSchemesByUrgency(schemesData);
  const filtered = sorted.filter((s) => {
    const u = getUrgencyInfo(s.deadline);
    if (filter === "critical" && u.level !== "critical") return false;
    if (filter === "upcoming" && u.level !== "upcoming") return false;
    if (filter === "rolling" && u.level !== "rolling") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchState = s.state?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchState) return false;
    }
    return true;
  });

  const criticalSchemes = schemesData.filter((s) => getUrgencyInfo(s.deadline).level === "critical");

  function handleBookmarkToggle(schemeId) {
    toggleSchemeBookmark(schemeId);
    setBookmarks(schemesData.map((s) => ({ id: s.id, saved: isSchemeBookmarked(s.id) })));
  }

  return (
    <div className="deadline-tracker-page">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="deadline-hero">
        <div className="deadline-hero-badge">⏰ Government Scheme Deadline Tracker</div>
        <h1 className="deadline-title">Application Deadlines & Cycles</h1>
        <p className="deadline-subtitle">
          Never miss an application window. Monitor recurring cutoff dates, academic scholarship deadlines, and continuous rolling schemes across India.
        </p>
      </div>

      {/* ── Closing Soon Notification Banner ─────────────────────── */}
      {criticalSchemes.length > 0 && (
        <div className="deadline-alert-banner">
          <div className="alert-icon-pulse">🚨</div>
          <div className="alert-content">
            <h3 className="alert-title">
              {criticalSchemes.length} Scheme{criticalSchemes.length > 1 ? "s" : ""} Closing Within 30 Days!
            </h3>
            <p className="alert-desc">
              Applications for <strong>{criticalSchemes.map((s) => s.name.split(" ")[0]).join(", ")}</strong> have cutoff dates approaching. Prepare your verification documents and draft applications now.
            </p>
          </div>
          <button
            className="alert-action-btn"
            onClick={() => {
              setFilter("critical");
              window.scrollTo({ top: 350, behavior: "smooth" });
            }}
          >
            View Urgent Schemes →
          </button>
        </div>
      )}

      {/* ── Stat Counters ────────────────────────────────────────── */}
      <div className="deadline-stats-grid">
        <div
          className={`dstat-card dstat-critical ${filter === "critical" ? "active" : ""}`}
          onClick={() => setFilter(filter === "critical" ? "all" : "critical")}
        >
          <div className="dstat-top">
            <span className="dstat-icon">🔴</span>
            <span className="dstat-num">{stats.critical}</span>
          </div>
          <span className="dstat-label">Closing Soon (&lt; 30d)</span>
          <span className="dstat-sub">High urgency</span>
        </div>

        <div
          className={`dstat-card dstat-upcoming ${filter === "upcoming" ? "active" : ""}`}
          onClick={() => setFilter(filter === "upcoming" ? "all" : "upcoming")}
        >
          <div className="dstat-top">
            <span className="dstat-icon">🟡</span>
            <span className="dstat-num">{stats.upcoming}</span>
          </div>
          <span className="dstat-label">Upcoming (1–3 Months)</span>
          <span className="dstat-sub">Active cycles</span>
        </div>

        <div
          className={`dstat-card dstat-rolling ${filter === "rolling" ? "active" : ""}`}
          onClick={() => setFilter(filter === "rolling" ? "all" : "rolling")}
        >
          <div className="dstat-top">
            <span className="dstat-icon">🟢</span>
            <span className="dstat-num">{stats.rolling}</span>
          </div>
          <span className="dstat-label">Rolling / Open All Year</span>
          <span className="dstat-sub">Continuous enrollment</span>
        </div>

        <div
          className={`dstat-card dstat-total ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          <div className="dstat-top">
            <span className="dstat-icon">📋</span>
            <span className="dstat-num">{stats.total}</span>
          </div>
          <span className="dstat-label">Total Monitored</span>
          <span className="dstat-sub">Central & State schemes</span>
        </div>
      </div>

      {/* ── Filter Bar & Search ──────────────────────────────────── */}
      <div className="deadline-filter-bar">
        <div className="filter-pill-group">
          <button
            className={`filter-pill ${filter === "all" ? "pill-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Schemes ({stats.total})
          </button>
          <button
            className={`filter-pill pill-critical ${filter === "critical" ? "pill-active" : ""}`}
            onClick={() => setFilter("critical")}
          >
            🔴 Closing Soon ({stats.critical})
          </button>
          <button
            className={`filter-pill pill-upcoming ${filter === "upcoming" ? "pill-active" : ""}`}
            onClick={() => setFilter("upcoming")}
          >
            🟡 Upcoming ({stats.upcoming})
          </button>
          <button
            className={`filter-pill pill-rolling ${filter === "rolling" ? "pill-active" : ""}`}
            onClick={() => setFilter("rolling")}
          >
            🟢 Rolling ({stats.rolling})
          </button>
        </div>

        <div className="deadline-search-box">
          <input
            type="text"
            className="deadline-search-input"
            placeholder="Search scheme by name or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Schemes Deadline Grid ────────────────────────────────── */}
      <div className="deadline-grid">
        {filtered.map((scheme) => {
          const urgency = getUrgencyInfo(scheme.deadline);
          const days = calculateDaysRemaining(scheme.deadline);
          const isSaved = isSchemeBookmarked(scheme.id);

          return (
            <div key={scheme.id} className={`deadline-card ${urgency.tagClass}`}>
              <div className="dcard-top">
                <div className="dcard-badges">
                  <span className={`badge ${scheme.type === "Central" ? "badge-central" : "badge-state"}`}>
                    {scheme.type}
                  </span>
                  {scheme.state && <span className="badge badge-state-name">{scheme.state}</span>}
                  <span className={`urgency-pill ${urgency.tagClass}`}>
                    {urgency.icon} {urgency.shortLabel}
                  </span>
                </div>
                <button
                  className={`dcard-bookmark-btn ${isSaved ? "saved" : ""}`}
                  onClick={() => handleBookmarkToggle(scheme.id)}
                  title={isSaved ? "Saved in My Applications" : "Save to My Applications"}
                >
                  {isSaved ? "★" : "☆"}
                </button>
              </div>

              <h3 className="dcard-title">{scheme.name}</h3>

              {/* Deadline countdown feature */}
              <div className="dcard-countdown-box">
                <span className="countdown-label">DEADLINE / CUTOFF</span>
                <span className="countdown-value">{scheme.deadlineLabel || scheme.deadline}</span>
                {days !== null && days >= 0 && (
                  <div className="countdown-timer">
                    ⏳ <strong>{days} calendar day{days === 1 ? "" : "s"} remaining</strong>
                  </div>
                )}
              </div>

              <div className="dcard-details">
                <div className="ddetail-row">
                  <span className="ddetail-label">Benefit:</span>
                  <span className="ddetail-val">{scheme.benefit}</span>
                </div>
                <div className="ddetail-row">
                  <span className="ddetail-label">Mode:</span>
                  <span className="ddetail-val">{scheme.applicationMode || "Online Portal"}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="dcard-actions">
                <button
                  className="btn btn-draft-app btn-dcard"
                  onClick={() => setSelectedSchemeForModal(scheme)}
                >
                  📝 Generate Application
                </button>
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-dcard"
                >
                  Official Portal ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="deadline-empty">
          <p>No schemes match your filter or search criteria.</p>
          <button className="btn btn-secondary" onClick={() => { setFilter("all"); setSearch(""); }}>
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Modal for Auto-Draft ──────────────────────────────────── */}
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
