/**
 * ============================================================
 * src/utils/deadlineUtils.js — Deadline & Urgency Helpers
 * ============================================================
 * Calculates days remaining, urgency buckets (red, amber, green),
 * and sorting algorithms for SchemeSetu Phase 3.
 * ============================================================
 */

/**
 * Calculates the calendar days remaining until a deadline.
 * @param {string} deadlineStr - ISO string (YYYY-MM-DD) or "Rolling"
 * @returns {number|null} Days remaining, or null if rolling
 */
export function calculateDaysRemaining(deadlineStr) {
  if (!deadlineStr || deadlineStr === "Rolling" || deadlineStr.toLowerCase().includes("rolling")) {
    return null;
  }

  const targetDate = new Date(deadlineStr);
  if (isNaN(targetDate.getTime())) {
    return null;
  }

  // Use midnight of current day for comparison
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  targetDate.setHours(23, 59, 59, 999);

  const diffMs = targetDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Returns urgency metadata including color code, badges, and label.
 * @param {string} deadlineStr - e.g. "2026-09-30" or "Rolling"
 * @returns {Object} { level, label, badgeColor, isClosingSoon, daysRemaining }
 */
export function getUrgencyInfo(deadlineStr) {
  const days = calculateDaysRemaining(deadlineStr);

  if (days === null) {
    return {
      level: "rolling",
      badgeColor: "green",
      label: "Rolling / Open All Year",
      shortLabel: "Open",
      isClosingSoon: false,
      daysRemaining: null,
      tagClass: "urgency-green",
      icon: "🟢",
    };
  }

  if (days < 0) {
    return {
      level: "expired",
      badgeColor: "gray",
      label: "Cycle Ended",
      shortLabel: "Ended",
      isClosingSoon: false,
      daysRemaining: days,
      tagClass: "urgency-gray",
      icon: "⚪",
    };
  }

  if (days <= 30) {
    return {
      level: "critical",
      badgeColor: "red",
      label: `${days} day${days === 1 ? "" : "s"} left (Closing Soon!)`,
      shortLabel: `${days}d left`,
      isClosingSoon: true,
      daysRemaining: days,
      tagClass: "urgency-red",
      icon: "🔴",
    };
  }

  if (days <= 90) {
    return {
      level: "upcoming",
      badgeColor: "amber",
      label: `${days} days left`,
      shortLabel: `${days}d left`,
      isClosingSoon: false,
      daysRemaining: days,
      tagClass: "urgency-amber",
      icon: "🟡",
    };
  }

  return {
    level: "open",
    badgeColor: "green",
    label: `${days} days left`,
    shortLabel: `${days}d left`,
    isClosingSoon: false,
    daysRemaining: days,
    tagClass: "urgency-green",
    icon: "🟢",
  };
}

/**
 * Sorts scheme objects or match result objects by urgency (soonest deadline first).
 * Schemes with fixed closing-soon deadlines appear first, followed by
 * upcoming deadlines, followed by rolling schemes.
 */
export function sortSchemesByUrgency(items) {
  return [...items].sort((a, b) => {
    const schemeA = a.scheme || a;
    const schemeB = b.scheme || b;

    const daysA = calculateDaysRemaining(schemeA.deadline);
    const daysB = calculateDaysRemaining(schemeB.deadline);

    // If both have fixed deadlines
    if (daysA !== null && daysB !== null) {
      return daysA - daysB;
    }
    // Fixed deadlines come before rolling
    if (daysA !== null && daysB === null) return -1;
    if (daysA === null && daysB !== null) return 1;

    // Both rolling: alphabetical by name
    return schemeA.name.localeCompare(schemeB.name);
  });
}

/**
 * Counts how many schemes in a list have deadlines closing within 30 days.
 */
export function getClosingSoonCount(items) {
  if (!items || !Array.isArray(items)) return 0;
  return items.filter((item) => {
    const scheme = item.scheme || item;
    const days = calculateDaysRemaining(scheme.deadline);
    return days !== null && days >= 0 && days <= 30;
  }).length;
}
