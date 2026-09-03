/**
 * ============================================================
 * SchemeSetu — Eligibility Matching Engine
 * File: src/engine/matchSchemes.js
 * ============================================================
 *
 * This is the CORE function of Phase 1. It is a pure function —
 * it takes a user profile and scheme list, and returns matches.
 *
 * PHASE 2 EXTENSION POINT:
 *   An AI agent can call matchSchemes() directly, or wrap it
 *   with an LLM explanation layer for each matched scheme.
 *   The function signature will remain stable across phases.
 * ============================================================
 */

/**
 * Checks whether a user's value matches a scheme's allowed values.
 * Returns: "match" | "no_match" | "not_required"
 *
 * @param {any} userValue - The user's profile value for this criterion
 * @param {any} schemeValue - The scheme's required value(s). If null, criterion is not required.
 */
function checkCriterion(userValue, schemeValue) {
  // If the scheme has no requirement for this field, it's not required (soft match)
  if (schemeValue === null || schemeValue === undefined) {
    return "not_required";
  }

  // If scheme requires an array of allowed values (e.g. category: ["SC", "ST", "OBC"])
  if (Array.isArray(schemeValue)) {
    return schemeValue.includes(userValue) ? "match" : "no_match";
  }

  // Direct equality check (e.g. gender: "female", maritalStatus: "unmarried")
  return String(userValue).toLowerCase() === String(schemeValue).toLowerCase()
    ? "match"
    : "no_match";
}

/**
 * Checks occupation: a scheme can require one of several occupations.
 */
function checkOccupation(userOccupation, schemeOccupations) {
  if (!schemeOccupations || schemeOccupations.length === 0) return "not_required";
  return schemeOccupations.includes(userOccupation) ? "match" : "no_match";
}

/**
 * Checks income: user must be AT OR BELOW the scheme's ceiling.
 */
function checkIncome(userIncome, schemeIncomeCeiling) {
  if (schemeIncomeCeiling === null || schemeIncomeCeiling === undefined) {
    return "not_required";
  }
  return userIncome <= schemeIncomeCeiling ? "match" : "no_match";
}

/**
 * Checks age: user must be within [ageMin, ageMax].
 * Either bound can be null (meaning no bound on that side).
 */
function checkAge(userAge, ageMin, ageMax) {
  const hasMin = ageMin !== null && ageMin !== undefined;
  const hasMax = ageMax !== null && ageMax !== undefined;

  if (!hasMin && !hasMax) return "not_required";

  if (hasMin && userAge < ageMin) return "no_match";
  if (hasMax && userAge > ageMax) return "no_match";
  return "match";
}

/**
 * Checks state: scheme may be state-specific (array) or central (null).
 */
function checkState(userState, schemeStates) {
  if (!schemeStates || schemeStates.length === 0) return "not_required";
  return schemeStates.includes(userState) ? "match" : "no_match";
}

/**
 * Education level ordering — used to check "educationMax" ceiling.
 * The scheme sets a maximum education level (e.g. pre-matric scholarship
 * is for students currently in class 9-10, so educationMax = "10th-12th").
 */
const EDUCATION_ORDER = {
  "below 10th": 1,
  "10th-12th": 2,
  graduate: 3,
  postgraduate: 4,
};

function checkEducation(userEducation, schemeEducationMax) {
  if (!schemeEducationMax) return "not_required";
  const userLevel = EDUCATION_ORDER[userEducation] || 0;
  const maxLevel = EDUCATION_ORDER[schemeEducationMax] || 0;
  return userLevel <= maxLevel ? "match" : "no_match";
}

// ============================================================
// MAIN EXPORT: matchSchemes
// ============================================================

/**
 * Core eligibility matching function.
 *
 * @param {Object} userProfile - Structured user profile from the form
 * @param {Array}  schemesList - Array of scheme objects from schemes.json
 *
 * @returns {Object} {
 *   fullyEligible: [...],    // All hard criteria matched
 *   partiallyEligible: [...] // Passed income+category check but missed something else
 * }
 *
 * Each result item contains:
 *   - scheme: the original scheme object
 *   - matchScore: number (how many criteria matched, including soft ones)
 *   - matchedCriteria: array of human-readable strings explaining what matched
 *   - missedCriteria: array of human-readable strings explaining what didn't match
 *   - eligibilityType: "full" | "partial"
 */
export function matchSchemes(userProfile, schemesList) {
  const results = [];

  for (const scheme of schemesList) {
    const { eligibility } = scheme;
    const matched = [];   // Criteria that matched
    const missed = [];    // Criteria that didn't match
    let hardFail = false; // True if any HARD criterion fails

    // ── 1. OCCUPATION CHECK (Hard) ────────────────────────────────────────
    const occResult = checkOccupation(userProfile.occupation, eligibility.occupation);
    if (occResult === "match") {
      matched.push(`Occupation (${userProfile.occupation}) is eligible`);
    } else if (occResult === "no_match") {
      missed.push(`Occupation must be: ${eligibility.occupation.join(" / ")}`);
      hardFail = true;
    }

    // ── 2. AGE CHECK (Hard) ────────────────────────────────────────────────
    const ageResult = checkAge(userProfile.age, eligibility.ageMin, eligibility.ageMax);
    if (ageResult === "match") {
      const range = [
        eligibility.ageMin !== null ? `${eligibility.ageMin}+` : null,
        eligibility.ageMax !== null ? `up to ${eligibility.ageMax}` : null,
      ]
        .filter(Boolean)
        .join(" & ");
      matched.push(`Age ${userProfile.age} is within eligible range (${range})`);
    } else if (ageResult === "no_match") {
      const minStr = eligibility.ageMin !== null ? `min ${eligibility.ageMin}` : "";
      const maxStr = eligibility.ageMax !== null ? `max ${eligibility.ageMax}` : "";
      missed.push(`Age requirement: ${[minStr, maxStr].filter(Boolean).join(", ")} years`);
      hardFail = true;
    }

    // ── 3. INCOME CHECK (Hard) ─────────────────────────────────────────────
    const incomeResult = checkIncome(userProfile.income, eligibility.incomeCeiling);
    if (incomeResult === "match") {
      matched.push(
        `Income (₹${userProfile.income.toLocaleString("en-IN")}) is within ceiling (₹${eligibility.incomeCeiling?.toLocaleString("en-IN")})`
      );
    } else if (incomeResult === "no_match") {
      missed.push(
        `Income ceiling: ₹${eligibility.incomeCeiling?.toLocaleString("en-IN")} (yours: ₹${userProfile.income.toLocaleString("en-IN")})`
      );
      hardFail = true;
    }

    // ── 4. CATEGORY CHECK (Hard) ───────────────────────────────────────────
    // Special rule: Stand-Up India has an alternate eligibility for women
    let categoryResult = checkCriterion(userProfile.category, eligibility.category);

    // Check Stand-Up India alternate eligibility (female OR SC/ST)
    if (categoryResult === "no_match" && scheme.eligibilityAlternate) {
      const altGender = checkCriterion(userProfile.gender, scheme.eligibilityAlternate.gender);
      if (altGender === "match") {
        categoryResult = "match"; // Women qualify regardless of category
      }
    }

    if (categoryResult === "match") {
      matched.push(`Category (${userProfile.category}) is eligible`);
    } else if (categoryResult === "no_match") {
      missed.push(`Category must be: ${eligibility.category.join(" / ")}`);
      hardFail = true;
    }

    // ── 5. STATE CHECK (Hard for state schemes) ────────────────────────────
    const stateResult = checkState(userProfile.state, eligibility.state);
    if (stateResult === "match") {
      matched.push(`State (${userProfile.state}) matches scheme coverage`);
    } else if (stateResult === "no_match") {
      missed.push(`State must be: ${eligibility.state.join(" or ")}`);
      hardFail = true;
    }

    // ── 6. GENDER CHECK (Soft — adds score, but only hard-fails if scheme is gender-exclusive) ──
    const genderResult = checkCriterion(userProfile.gender, eligibility.gender);
    if (genderResult === "match") {
      matched.push(`Gender (${userProfile.gender}) matches`);
    } else if (genderResult === "no_match") {
      // Gender is a hard fail only for gender-exclusive schemes (Sukanya Samriddhi, KCR Kit)
      missed.push(`Scheme is for ${eligibility.gender} applicants only`);
      hardFail = true;
    }

    // ── 7. EDUCATION CHECK (Soft) ─────────────────────────────────────────
    const educResult = checkEducation(userProfile.education, eligibility.educationMax);
    if (educResult === "match") {
      matched.push(`Education level (${userProfile.education}) meets requirement`);
    } else if (educResult === "no_match") {
      missed.push(`Education level required: up to ${eligibility.educationMax}`);
      // Education is soft — doesn't hard-fail unless it's a scholarship scheme
      if (scheme.type !== "Central" || eligibility.occupation?.includes("student")) {
        hardFail = true;
      }
    }

    // ── 8. MARITAL STATUS CHECK (Hard when specified) ─────────────────────
    const maritalResult = checkCriterion(userProfile.maritalStatus, eligibility.maritalStatus);
    if (maritalResult === "match") {
      matched.push(`Marital status (${userProfile.maritalStatus}) is eligible`);
    } else if (maritalResult === "no_match") {
      missed.push(`Marital status required: ${eligibility.maritalStatus}`);
      hardFail = true;
    }

    // ── 9. SCORE CALCULATION ──────────────────────────────────────────────
    // Score = matched criteria count / total evaluated criteria count
    const totalEvaluated = matched.length + missed.length;
    const matchScore = totalEvaluated > 0 ? Math.round((matched.length / totalEvaluated) * 100) : 50;

    // ── 10. CLASSIFY & STORE ───────────────────────────────────────────────
    // A scheme is "Fully Eligible" if no hard criteria failed.
    // "Partially Eligible" means hard criteria passed but some soft ones didn't,
    // OR the scheme has no hard criteria set (very broad eligibility).
    if (!hardFail || matched.length > 0) {
      results.push({
        scheme,
        matchScore,
        matchedCriteria: matched,
        missedCriteria: missed,
        eligibilityType: hardFail ? "partial" : "full",
      });
    }
  }

  // Sort by matchScore descending within each group
  const fullyEligible = results
    .filter((r) => r.eligibilityType === "full")
    .sort((a, b) => b.matchScore - a.matchScore);

  const partiallyEligible = results
    .filter((r) => r.eligibilityType === "partial")
    .sort((a, b) => b.matchScore - a.matchScore);

  return { fullyEligible, partiallyEligible };
}
