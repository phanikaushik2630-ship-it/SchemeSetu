/**
 * ============================================================
 * src/utils/storageUtils.js — LocalStorage Persistence Layer
 * ============================================================
 * Handles state persistence for SchemeSetu Phase 3:
 *  - Bookmarks (My Applications)
 *  - Application Statuses (Not Started -> Documents Ready -> Submitted -> Approved)
 *  - Interactive Document Checklists
 *  - Cached Draft Applicant Details
 * ============================================================
 */

const STORAGE_KEYS = {
  BOOKMARKS: "schemeSetu_bookmarks",
  STATUSES: "schemeSetu_statuses",
  DOC_CHECKS: "schemeSetu_docChecks",
  DRAFT_PROFILE: "schemeSetu_draftProfile",
};

// Safe JSON get helper
function getStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
    return fallback;
  }
}

// Safe JSON set helper
function setStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed to save ${key}:`, err);
  }
}

// ── 1. Bookmarks (Saved Schemes) ────────────────────────────
export function getBookmarkedSchemeIds() {
  return getStoredJson(STORAGE_KEYS.BOOKMARKS, []);
}

export function isSchemeBookmarked(schemeId) {
  const bookmarks = getBookmarkedSchemeIds();
  return bookmarks.includes(schemeId);
}

export function toggleSchemeBookmark(schemeId) {
  const bookmarks = getBookmarkedSchemeIds();
  const index = bookmarks.indexOf(schemeId);
  let updated;
  if (index > -1) {
    updated = bookmarks.filter((id) => id !== schemeId);
  } else {
    updated = [...bookmarks, schemeId];
  }
  setStoredJson(STORAGE_KEYS.BOOKMARKS, updated);
  return updated.includes(schemeId);
}

// ── 2. Application Statuses ─────────────────────────────────
// Allowed statuses
export const APPLICATION_STATUSES = [
  "Not Started",
  "Documents Ready",
  "Submitted",
  "Approved",
];

export function getSchemeStatus(schemeId) {
  const statuses = getStoredJson(STORAGE_KEYS.STATUSES, {});
  return statuses[schemeId] || "Not Started";
}

export function setSchemeStatus(schemeId, status) {
  const statuses = getStoredJson(STORAGE_KEYS.STATUSES, {});
  statuses[schemeId] = status;
  setStoredJson(STORAGE_KEYS.STATUSES, statuses);
  return status;
}

export function getAllStatuses() {
  return getStoredJson(STORAGE_KEYS.STATUSES, {});
}

// ── 3. Interactive Document Checklists ───────────────────────
export function getDocumentChecks(schemeId) {
  const allChecks = getStoredJson(STORAGE_KEYS.DOC_CHECKS, {});
  return allChecks[schemeId] || {};
}

export function toggleDocumentCheck(schemeId, docName) {
  const allChecks = getStoredJson(STORAGE_KEYS.DOC_CHECKS, {});
  const schemeChecks = allChecks[schemeId] || {};
  const newState = !schemeChecks[docName];
  schemeChecks[docName] = newState;
  allChecks[schemeId] = schemeChecks;
  setStoredJson(STORAGE_KEYS.DOC_CHECKS, allChecks);
  return newState;
}

export function getDocumentProgress(schemeId, requiredDocuments = []) {
  if (!requiredDocuments || requiredDocuments.length === 0) {
    return { completed: 0, total: 0, percent: 100, isAllReady: true };
  }

  const checks = getDocumentChecks(schemeId);
  const completed = requiredDocuments.filter((doc) => !!checks[doc]).length;
  const total = requiredDocuments.length;
  const percent = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percent,
    isAllReady: completed === total,
  };
}

// ── 4. Cached Draft Applicant Details ───────────────────────
export function getCachedDraftDetails() {
  return getStoredJson(STORAGE_KEYS.DRAFT_PROFILE, {
    fullName: "",
    fatherSpouseName: "",
    mobileNumber: "",
    emailAddress: "",
    aadhaarNumber: "",
    bankAccountNo: "",
    bankIfscCode: "",
    bankName: "",
    addressLine: "",
  });
}

export function saveCachedDraftDetails(data) {
  const existing = getCachedDraftDetails();
  const updated = { ...existing, ...data };
  setStoredJson(STORAGE_KEYS.DRAFT_PROFILE, updated);
  return updated;
}
