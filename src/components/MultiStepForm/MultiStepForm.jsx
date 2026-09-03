/**
 * ============================================================
 * MultiStepForm.jsx
 * File: src/components/MultiStepForm/MultiStepForm.jsx
 * ============================================================
 * An 8-step form that collects the user's profile.
 * Each step is a separate section; validation runs before advancing.
 *
 * Props:
 *   onSubmit(profile) — called when the user completes the form.
 *                       Receives the complete profile JSON object.
 * ============================================================
 */

import { useState } from "react";
import ProgressBar from "../shared/ProgressBar";
import {
  INDIAN_STATES,
  OCCUPATIONS,
  CATEGORIES,
  EDUCATION_LEVELS,
  GENDERS,
  MARITAL_STATUSES,
  EMPTY_PROFILE,
} from "../../data/formOptions";

// Step labels shown in the progress bar
const STEP_LABELS = [
  "Personal",
  "Location",
  "Income",
  "Occupation",
  "Category",
  "Education",
  "Health",
  "Review",
];

export default function MultiStepForm({ onSubmit }) {
  // The form data — starts as an empty profile
  const [profile, setProfile] = useState({ ...EMPTY_PROFILE });

  // Which step we're on (0-indexed)
  const [currentStep, setCurrentStep] = useState(0);

  // Validation error message for the current step
  const [error, setError] = useState("");

  // ── Helper: update a single field ──────────────────────────────────────
  function updateField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  }

  // ── Validation: returns error string or "" if valid ─────────────────────
  function validateStep() {
    switch (currentStep) {
      case 0: // Personal
        if (!profile.age || isNaN(profile.age) || profile.age < 0 || profile.age > 120)
          return "Please enter a valid age (0–120).";
        if (!profile.gender) return "Please select your gender.";
        if (!profile.maritalStatus) return "Please select your marital status.";
        return "";
      case 1: // Location
        if (!profile.state) return "Please select your state / UT.";
        return "";
      case 2: // Income
        if (profile.income === "" || isNaN(profile.income) || profile.income < 0)
          return "Please enter your annual family income (enter 0 if no income).";
        return "";
      case 3: // Occupation
        if (!profile.occupation) return "Please select your occupation.";
        return "";
      case 4: // Category
        if (!profile.category) return "Please select your social category.";
        return "";
      case 5: // Education
        if (!profile.education) return "Please select your highest education level.";
        return "";
      case 6: // Health / Disability
        // Disability is boolean with a default, so always valid
        return "";
      case 7: // Review
        return ""; // No new input on review step
      default:
        return "";
    }
  }

  // ── Navigate forward ────────────────────────────────────────────────────
  function handleNext() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setCurrentStep((s) => s + 1);
  }

  // ── Navigate backward ───────────────────────────────────────────────────
  function handleBack() {
    setError("");
    setCurrentStep((s) => s - 1);
  }

  // ── Final submit ────────────────────────────────────────────────────────
  function handleSubmit() {
    // Convert string numbers to actual numbers before submitting
    const finalProfile = {
      ...profile,
      age: parseInt(profile.age, 10),
      income: parseInt(profile.income, 10),
    };
    onSubmit(finalProfile);
  }

  // ── Render step content ─────────────────────────────────────────────────
  function renderStep() {
    switch (currentStep) {
      // ── Step 0: Personal ────────────────────────────────────────────────
      case 0:
        return (
          <div className="form-step">
            <h2 className="step-title">Tell us about yourself</h2>
            <p className="step-subtitle">Basic personal details help us find the right schemes for you.</p>

            <div className="field-group">
              <label className="field-label" htmlFor="age">Your Age *</label>
              <input
                id="age"
                type="number"
                min="0"
                max="120"
                className="field-input"
                placeholder="e.g. 28"
                value={profile.age}
                onChange={(e) => updateField("age", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Gender *</label>
              <div className="radio-group">
                {GENDERS.map((g) => (
                  <label key={g.value} className={`radio-card ${profile.gender === g.value ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="gender"
                      value={g.value}
                      checked={profile.gender === g.value}
                      onChange={() => updateField("gender", g.value)}
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="maritalStatus">Marital Status *</label>
              <select
                id="maritalStatus"
                className="field-select"
                value={profile.maritalStatus}
                onChange={(e) => updateField("maritalStatus", e.target.value)}
              >
                <option value="">— Select —</option>
                {MARITAL_STATUSES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
        );

      // ── Step 1: Location ─────────────────────────────────────────────────
      case 1:
        return (
          <div className="form-step">
            <h2 className="step-title">Where do you live?</h2>
            <p className="step-subtitle">State-specific schemes are only available to residents of that state.</p>

            <div className="field-group">
              <label className="field-label" htmlFor="state">State / Union Territory *</label>
              <select
                id="state"
                className="field-select"
                value={profile.state}
                onChange={(e) => updateField("state", e.target.value)}
              >
                <option value="">— Select your state —</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="info-box">
              <span className="info-icon">ℹ️</span>
              <span>Central government schemes are available to all Indian citizens regardless of state.</span>
            </div>
          </div>
        );

      // ── Step 2: Income ──────────────────────────────────────────────────
      case 2:
        return (
          <div className="form-step">
            <h2 className="step-title">Family income</h2>
            <p className="step-subtitle">Enter your total annual household income in Indian Rupees. Include all earning members.</p>

            <div className="field-group">
              <label className="field-label" htmlFor="income">Annual Family Income (₹) *</label>
              <div className="input-with-prefix">
                <span className="input-prefix">₹</span>
                <input
                  id="income"
                  type="number"
                  min="0"
                  className="field-input with-prefix"
                  placeholder="e.g. 120000"
                  value={profile.income}
                  onChange={(e) => updateField("income", e.target.value)}
                />
              </div>
              {profile.income !== "" && !isNaN(profile.income) && (
                <p className="field-hint">
                  ≈ ₹{Math.round(profile.income / 12).toLocaleString("en-IN")} per month
                </p>
              )}
            </div>

            <div className="income-brackets">
              <p className="brackets-label">Quick select:</p>
              {[
                { label: "Below ₹1 lakh", value: 99000 },
                { label: "₹1 – 2.5 lakh", value: 175000 },
                { label: "₹2.5 – 5 lakh", value: 375000 },
                { label: "₹5 – 8 lakh", value: 650000 },
                { label: "Above ₹8 lakh", value: 900000 },
              ].map((b) => (
                <button
                  key={b.value}
                  className={`bracket-chip ${profile.income == b.value ? "selected" : ""}`}
                  onClick={() => updateField("income", b.value)}
                  type="button"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        );

      // ── Step 3: Occupation ───────────────────────────────────────────────
      case 3:
        return (
          <div className="form-step">
            <h2 className="step-title">Your occupation</h2>
            <p className="step-subtitle">Many schemes target specific groups — select the one that best describes you.</p>

            <div className="occupation-grid">
              {OCCUPATIONS.map((o) => (
                <label
                  key={o.value}
                  className={`occupation-card ${profile.occupation === o.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="occupation"
                    value={o.value}
                    checked={profile.occupation === o.value}
                    onChange={() => updateField("occupation", o.value)}
                  />
                  <span className="occ-icon">{OCCUPATION_ICONS[o.value]}</span>
                  <span className="occ-label">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      // ── Step 4: Category ─────────────────────────────────────────────────
      case 4:
        return (
          <div className="form-step">
            <h2 className="step-title">Social category</h2>
            <p className="step-subtitle">
              Many government schemes reserve benefits for specific categories. This information is confidential and only used for scheme matching.
            </p>

            <div className="category-grid">
              {CATEGORIES.map((c) => (
                <label
                  key={c.value}
                  className={`category-card ${profile.category === c.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={c.value}
                    checked={profile.category === c.value}
                    onChange={() => updateField("category", c.value)}
                  />
                  <span className="cat-value">{c.value}</span>
                  <span className="cat-label">{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      // ── Step 5: Education ─────────────────────────────────────────────────
      case 5:
        return (
          <div className="form-step">
            <h2 className="step-title">Highest education level</h2>
            <p className="step-subtitle">Scholarship and skill development schemes often have education requirements.</p>

            <div className="edu-list">
              {EDUCATION_LEVELS.map((e) => (
                <label
                  key={e.value}
                  className={`edu-card ${profile.education === e.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="education"
                    value={e.value}
                    checked={profile.education === e.value}
                    onChange={() => updateField("education", e.value)}
                  />
                  <div className="edu-content">
                    <span className="edu-label">{e.label}</span>
                  </div>
                  {profile.education === e.value && (
                    <span className="edu-check">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      // ── Step 6: Disability ────────────────────────────────────────────────
      case 6:
        return (
          <div className="form-step">
            <h2 className="step-title">Health &amp; disability status</h2>
            <p className="step-subtitle">
              Persons with disabilities get priority in several schemes and may have higher income ceilings.
            </p>

            <div className="disability-options">
              <label className={`dis-card ${!profile.disability ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="disability"
                  checked={!profile.disability}
                  onChange={() => updateField("disability", false)}
                />
                <span className="dis-icon">🙋</span>
                <div>
                  <strong>No disability</strong>
                  <p>I do not have a recognized disability</p>
                </div>
              </label>

              <label className={`dis-card ${profile.disability ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="disability"
                  checked={profile.disability}
                  onChange={() => updateField("disability", true)}
                />
                <span className="dis-icon">♿</span>
                <div>
                  <strong>Person with Disability (PwD)</strong>
                  <p>I have a UDID card or recognized disability certificate</p>
                </div>
              </label>
            </div>

            <div className="info-box">
              <span className="info-icon">ℹ️</span>
              <span>
                This information is used only for scheme matching and is never stored on any server.
              </span>
            </div>
          </div>
        );

      // ── Step 7: Review ───────────────────────────────────────────────────
      case 7:
        return (
          <div className="form-step">
            <h2 className="step-title">Review your details</h2>
            <p className="step-subtitle">Confirm your information before we find matching schemes.</p>

            <div className="review-grid">
              <ReviewRow label="Age" value={`${profile.age} years`} step={0} onEdit={setCurrentStep} />
              <ReviewRow label="Gender" value={profile.gender} step={0} onEdit={setCurrentStep} />
              <ReviewRow label="Marital Status" value={profile.maritalStatus} step={0} onEdit={setCurrentStep} />
              <ReviewRow label="State" value={profile.state} step={1} onEdit={setCurrentStep} />
              <ReviewRow
                label="Annual Income"
                value={`₹${parseInt(profile.income).toLocaleString("en-IN")}`}
                step={2}
                onEdit={setCurrentStep}
              />
              <ReviewRow label="Occupation" value={profile.occupation} step={3} onEdit={setCurrentStep} />
              <ReviewRow label="Category" value={profile.category} step={4} onEdit={setCurrentStep} />
              <ReviewRow label="Education" value={profile.education} step={5} onEdit={setCurrentStep} />
              <ReviewRow
                label="Disability"
                value={profile.disability ? "Yes (PwD)" : "No"}
                step={6}
                onEdit={setCurrentStep}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="form-wrapper">
      <ProgressBar
        currentStep={currentStep}
        totalSteps={STEP_LABELS.length}
        stepLabels={STEP_LABELS}
      />

      <div className="form-card">
        {renderStep()}

        {/* Error message */}
        {error && (
          <div className="form-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="form-nav">
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={handleBack}>
              ← Back
            </button>
          )}

          {currentStep < STEP_LABELS.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button className="btn btn-submit" onClick={handleSubmit}>
              🔍 Find My Schemes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Icons for occupation cards ────────────────────────────────────────────
const OCCUPATION_ICONS = {
  student: "🎓",
  farmer: "🌾",
  unemployed: "🔍",
  "small business owner": "🏪",
  salaried: "💼",
  "daily wage worker": "🔧",
};

// ── ReviewRow helper component ────────────────────────────────────────────
function ReviewRow({ label, value, step, onEdit }) {
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{value}</span>
      <button
        className="review-edit-btn"
        onClick={() => onEdit(step)}
        type="button"
        title={`Edit ${label}`}
      >
        ✏️
      </button>
    </div>
  );
}
