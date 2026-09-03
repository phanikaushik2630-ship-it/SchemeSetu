/**
 * ============================================================
 * server/tools.js — Tool Implementations
 * ============================================================
 * Implements the 4 tools the Claude agent can call.
 * Each function mirrors exactly what the Phase 1 engine does,
 * so there is ONE source of truth for eligibility logic.
 *
 * IMPORTANT: This file runs on the server (Node.js), so it
 * reads schemes.json via fs.readFileSync — not via import.
 * ============================================================
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Resolve path to schemes.json relative to this file
const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMES_PATH = join(__dirname, "../src/data/schemes.json");

// Cache schemes in memory (loaded once on server start)
let _schemes = null;
function getSchemes() {
  if (!_schemes) {
    _schemes = JSON.parse(readFileSync(SCHEMES_PATH, "utf-8"));
  }
  return _schemes;
}

// ── Education ordering (mirrors Phase 1 engine) ────────────
const EDUCATION_ORDER = {
  "below 10th": 1,
  "10th-12th": 2,
  graduate: 3,
  postgraduate: 4,
};

// ============================================================
// Tool 1: search_schemes
// ============================================================
/**
 * Searches schemes.json with flexible criteria.
 * Returns matched schemes with id, name, type, state, description, benefit.
 *
 * @param {Object} criteria - { occupation, state, category, keyword, gender, benefitType }
 * @returns {Object} { matches: [], totalFound: number }
 */
export function search_schemes(criteria = {}) {
  const schemes = getSchemes();
  const { occupation, state, category, keyword, gender, benefitType } = criteria;

  const matches = schemes.filter((scheme) => {
    const { eligibility } = scheme;

    // Occupation filter — scheme must list this occupation (if criteria given)
    if (occupation && eligibility.occupation) {
      if (!eligibility.occupation.includes(occupation)) return false;
    }

    // State filter — only include state schemes that match, or central schemes
    if (state && eligibility.state) {
      if (!eligibility.state.includes(state)) return false;
    }

    // Category filter
    if (category && eligibility.category) {
      if (!eligibility.category.includes(category)) return false;
    }

    // Gender filter
    if (gender && eligibility.gender) {
      if (eligibility.gender !== gender) return false;
    }

    // Benefit type filter
    if (benefitType && scheme.benefitType !== benefitType) return false;

    // Keyword search — check name, description, notes, benefit
    if (keyword) {
      const kw = keyword.toLowerCase();
      const searchable = [
        scheme.name,
        scheme.description,
        scheme.benefit,
        scheme.notes || "",
        scheme.benefitType,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(kw)) return false;
    }

    return true;
  });

  return {
    totalFound: matches.length,
    matches: matches.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      state: s.state || null,
      description: s.description,
      benefit: s.benefit,
      benefitType: s.benefitType,
    })),
  };
}

// ============================================================
// Tool 2: check_eligibility
// ============================================================
/**
 * Runs the eligibility engine (same logic as Phase 1's matchSchemes)
 * for a single scheme + user profile.
 *
 * @param {string} schemeId
 * @param {Object} userProfile
 * @returns {Object} { verdict, matchedCriteria, missedCriteria, matchScore, scheme }
 */
export function check_eligibility(schemeId, userProfile) {
  const schemes = getSchemes();
  const scheme = schemes.find((s) => s.id === schemeId);

  if (!scheme) {
    return { error: `Scheme '${schemeId}' not found. Use search_schemes to find valid IDs.` };
  }

  const { eligibility } = scheme;
  const profile = userProfile || {};
  const matched = [];
  const missed = [];
  const skipped = []; // criteria we couldn't evaluate due to missing profile info
  let hardFail = false;

  // Helper: add to appropriate list
  function evalCriterion(label, result, reason) {
    if (result === "match") matched.push(reason);
    else if (result === "no_match") { missed.push(reason); hardFail = true; }
    else if (result === "unknown") skipped.push(reason);
  }

  // ── Occupation ────────────────────────────────────────────
  if (eligibility.occupation && eligibility.occupation.length > 0) {
    if (!profile.occupation) {
      skipped.push(`Occupation unknown (scheme requires: ${eligibility.occupation.join(" / ")})`);
    } else if (eligibility.occupation.includes(profile.occupation)) {
      matched.push(`✓ Occupation "${profile.occupation}" is eligible`);
    } else {
      missed.push(`✗ Occupation must be: ${eligibility.occupation.join(" / ")} (yours: ${profile.occupation})`);
      hardFail = true;
    }
  }

  // ── Age ───────────────────────────────────────────────────
  if (eligibility.ageMin !== null || eligibility.ageMax !== null) {
    if (!profile.age) {
      skipped.push(`Age unknown (scheme requires: ${eligibility.ageMin ?? 0}–${eligibility.ageMax ?? "no max"})`);
    } else {
      const age = Number(profile.age);
      const tooYoung = eligibility.ageMin !== null && age < eligibility.ageMin;
      const tooOld = eligibility.ageMax !== null && age > eligibility.ageMax;
      if (tooYoung || tooOld) {
        missed.push(`✗ Age ${age} is outside eligible range (${eligibility.ageMin ?? 0}–${eligibility.ageMax ?? "no max"})`);
        hardFail = true;
      } else {
        matched.push(`✓ Age ${age} is within eligible range`);
      }
    }
  }

  // ── Income ────────────────────────────────────────────────
  if (eligibility.incomeCeiling !== null) {
    if (profile.income === undefined || profile.income === null || profile.income === "") {
      skipped.push(`Income unknown (scheme ceiling: ₹${eligibility.incomeCeiling.toLocaleString("en-IN")})`);
    } else {
      const income = Number(profile.income);
      if (income > eligibility.incomeCeiling) {
        missed.push(`✗ Income ₹${income.toLocaleString("en-IN")} exceeds ceiling of ₹${eligibility.incomeCeiling.toLocaleString("en-IN")}`);
        hardFail = true;
      } else {
        matched.push(`✓ Income ₹${income.toLocaleString("en-IN")} is within the ceiling`);
      }
    }
  }

  // ── Category ──────────────────────────────────────────────
  if (eligibility.category && eligibility.category.length > 0) {
    // Special: Stand-Up India allows women regardless of category
    let categoryPass = false;
    if (profile.category && eligibility.category.includes(profile.category)) {
      categoryPass = true;
    }
    if (!categoryPass && scheme.eligibilityAlternate?.gender === "female" && profile.gender === "female") {
      categoryPass = true;
    }

    if (!profile.category && !profile.gender) {
      skipped.push(`Category unknown (scheme requires: ${eligibility.category.join(" / ")})`);
    } else if (categoryPass) {
      matched.push(`✓ Category "${profile.category}" is eligible`);
    } else {
      missed.push(`✗ Category must be: ${eligibility.category.join(" / ")}`);
      hardFail = true;
    }
  }

  // ── State ─────────────────────────────────────────────────
  if (eligibility.state && eligibility.state.length > 0) {
    if (!profile.state) {
      skipped.push(`State unknown (scheme only for: ${eligibility.state.join(", ")})`);
    } else if (eligibility.state.includes(profile.state)) {
      matched.push(`✓ State "${profile.state}" matches scheme coverage`);
    } else {
      missed.push(`✗ Scheme is only for: ${eligibility.state.join(", ")} (you are in: ${profile.state})`);
      hardFail = true;
    }
  }

  // ── Gender ────────────────────────────────────────────────
  if (eligibility.gender) {
    if (!profile.gender) {
      skipped.push(`Gender unknown (scheme is for: ${eligibility.gender})`);
    } else if (profile.gender === eligibility.gender) {
      matched.push(`✓ Gender "${profile.gender}" matches`);
    } else {
      missed.push(`✗ Scheme is for ${eligibility.gender} applicants only`);
      hardFail = true;
    }
  }

  // ── Education ─────────────────────────────────────────────
  if (eligibility.educationMax) {
    if (!profile.education) {
      skipped.push(`Education level unknown (scheme max: ${eligibility.educationMax})`);
    } else {
      const userLevel = EDUCATION_ORDER[profile.education] || 0;
      const maxLevel = EDUCATION_ORDER[eligibility.educationMax] || 0;
      if (userLevel > maxLevel) {
        missed.push(`✗ Education must be up to "${eligibility.educationMax}" (yours: ${profile.education})`);
        hardFail = eligibility.occupation?.includes("student") ? true : false;
      } else {
        matched.push(`✓ Education level "${profile.education}" meets requirement`);
      }
    }
  }

  // ── Marital Status ────────────────────────────────────────
  if (eligibility.maritalStatus) {
    if (!profile.maritalStatus) {
      skipped.push(`Marital status unknown (scheme requires: ${eligibility.maritalStatus})`);
    } else if (profile.maritalStatus === eligibility.maritalStatus) {
      matched.push(`✓ Marital status "${profile.maritalStatus}" is eligible`);
    } else {
      missed.push(`✗ Marital status must be: ${eligibility.maritalStatus}`);
      hardFail = true;
    }
  }

  // ── Score & Verdict ───────────────────────────────────────
  const total = matched.length + missed.length;
  const matchScore = total > 0 ? Math.round((matched.length / total) * 100) : 80;

  let verdict;
  if (hardFail) {
    verdict = "NOT_ELIGIBLE";
  } else if (skipped.length > 0) {
    verdict = "LIKELY_ELIGIBLE"; // matches all known criteria, some unknown
  } else {
    verdict = "ELIGIBLE";
  }

  return {
    schemeId,
    schemeName: scheme.name,
    verdict,
    matchScore,
    matchedCriteria: matched,
    missedCriteria: missed,
    skippedCriteria: skipped,
    benefit: scheme.benefit,
    officialLink: scheme.officialLink,
  };
}

// ============================================================
// Tool 3: get_scheme_details
// ============================================================
/**
 * Returns full scheme information for a specific scheme.
 *
 * @param {string} schemeId
 * @returns {Object} Full scheme object or error
 */
export function get_scheme_details(schemeId) {
  const schemes = getSchemes();
  const scheme = schemes.find((s) => s.id === schemeId);

  if (!scheme) {
    return {
      error: `Scheme '${schemeId}' not found.`,
      availableIds: schemes.map((s) => s.id),
    };
  }

  return {
    id: scheme.id,
    name: scheme.name,
    type: scheme.type,
    state: scheme.state || "All India",
    description: scheme.description,
    benefit: scheme.benefit,
    benefitType: scheme.benefitType,
    officialLink: scheme.officialLink,
    eligibilityRules: {
      occupation: scheme.eligibility.occupation || "Open to all occupations",
      ageRange: `${scheme.eligibility.ageMin ?? "no minimum"} – ${scheme.eligibility.ageMax ?? "no maximum"} years`,
      incomeCeiling: scheme.eligibility.incomeCeiling
        ? `₹${scheme.eligibility.incomeCeiling.toLocaleString("en-IN")}/year`
        : "No income ceiling",
      category: scheme.eligibility.category || "Open to all categories",
      gender: scheme.eligibility.gender || "All genders",
      state: scheme.eligibility.state || "All states",
      educationMax: scheme.eligibility.educationMax || "No education requirement",
    },
    notes: scheme.notes,
  };
}

// ============================================================
// Tool 4: get_required_documents
// ============================================================
/**
 * Returns the document checklist for a specific scheme.
 *
 * @param {string} schemeId
 * @returns {Object} { schemeName, documents, applicationLink }
 */
export function get_required_documents(schemeId) {
  const schemes = getSchemes();
  const scheme = schemes.find((s) => s.id === schemeId);

  if (!scheme) {
    return { error: `Scheme '${schemeId}' not found.` };
  }

  return {
    schemeId,
    schemeName: scheme.name,
    totalDocuments: scheme.requiredDocuments.length,
    documents: scheme.requiredDocuments,
    applicationLink: scheme.officialLink,
    notes: scheme.notes,
  };
}

// ============================================================
// Router: dispatch tool calls from Claude's response
// ============================================================
/**
 * Executes a tool by name with given input.
 * Called by the agent loop when Claude requests a tool call.
 *
 * @param {string} toolName
 * @param {Object} toolInput
 * @returns {any} Tool result
 */
export function executeTool(toolName, toolInput) {
  switch (toolName) {
    case "search_schemes":
      return search_schemes(toolInput);

    case "check_eligibility":
      return check_eligibility(toolInput.schemeId, toolInput.userProfile);

    case "get_scheme_details":
      return get_scheme_details(toolInput.schemeId);

    case "get_required_documents":
      return get_required_documents(toolInput.schemeId);

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
