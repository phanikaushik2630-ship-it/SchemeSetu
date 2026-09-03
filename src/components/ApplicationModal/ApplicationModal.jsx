/**
 * ============================================================
 * ApplicationModal.jsx — Auto-Draft Application Generator Modal
 * File: src/components/ApplicationModal/ApplicationModal.jsx
 * ============================================================
 * Displays pre-filled applicant demographic information,
 * collects any supplementary details (Aadhaar, Bank, IFSC),
 * shows document readiness, and generates a downloadable PDF draft.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { generateApplicationDraftPdf } from "../../utils/pdfGenerator";
import {
  getCachedDraftDetails,
  saveCachedDraftDetails,
  getDocumentChecks,
  toggleDocumentCheck,
  getDocumentProgress,
} from "../../utils/storageUtils";
import { getUrgencyInfo } from "../../utils/deadlineUtils";

export default function ApplicationModal({ scheme, userProfile = {}, onClose }) {
  const [formData, setFormData] = useState(() => {
    const cached = getCachedDraftDetails();
    return {
      fullName: cached.fullName || userProfile.fullName || "",
      fatherSpouseName: cached.fatherSpouseName || "",
      mobileNumber: cached.mobileNumber || "",
      emailAddress: cached.emailAddress || "",
      aadhaarNumber: cached.aadhaarNumber || "",
      bankAccountNo: cached.bankAccountNo || "",
      bankIfscCode: cached.bankIfscCode || "",
      bankName: cached.bankName || "",
      ...cached,
    };
  });

  const [docChecks, setDocChecks] = useState(() => getDocumentChecks(scheme.id));
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const urgency = getUrgencyInfo(scheme.deadline);
  const progress = getDocumentProgress(scheme.id, scheme.requiredDocuments);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleDocToggle(docName) {
    toggleDocumentCheck(scheme.id, docName);
    setDocChecks({ ...getDocumentChecks(scheme.id) });
  }

  function handleDownloadPdf(e) {
    e.preventDefault();
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      // Save details to localStorage cache for future schemes
      saveCachedDraftDetails(formData);

      // Generate the PDF file
      generateApplicationDraftPdf({
        scheme,
        userProfile,
        supplementary: formData,
        documentChecks: docChecks,
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please check your inputs.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* ── Modal Header ────────────────────────────────────── */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge">📝 SchemeSetu Auto-Draft</span>
            <h2 className="modal-title">{scheme.name}</h2>
            <div className="modal-meta-row">
              <span className={`urgency-pill ${urgency.tagClass}`}>
                {urgency.icon} {urgency.label}
              </span>
              <span className="modal-mode">📍 {scheme.applicationMode || "Online Portal"}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* ── Modal Body ──────────────────────────────────────── */}
        <form className="modal-body" onSubmit={handleDownloadPdf}>
          {/* Official Notice Alert */}
          <div className="modal-notice">
            <span className="notice-icon">💡</span>
            <div>
              <strong>Pre-Filled Draft Generator:</strong> This will compile an official-style application draft with your data and document checklist to assist your manual or CSC portal submission.
            </div>
          </div>

          {/* Section 1: Pre-filled Profile Info */}
          <div className="modal-section">
            <h3 className="section-title">1. Citizen Demographics (from Profile)</h3>
            <div className="form-grid-3">
              <div className="form-field">
                <label className="field-label">Age</label>
                <input
                  type="text"
                  className="field-input"
                  value={userProfile.age ? `${userProfile.age} years` : "Not specified"}
                  readOnly
                />
              </div>
              <div className="form-field">
                <label className="field-label">State</label>
                <input
                  type="text"
                  className="field-input"
                  value={userProfile.state || "Not specified"}
                  readOnly
                />
              </div>
              <div className="form-field">
                <label className="field-label">Social Category</label>
                <input
                  type="text"
                  className="field-input"
                  value={userProfile.category || "Not specified"}
                  readOnly
                />
              </div>
            </div>
            <div className="form-grid-2" style={{ marginTop: "10px" }}>
              <div className="form-field">
                <label className="field-label">Occupation</label>
                <input
                  type="text"
                  className="field-input"
                  value={userProfile.occupation || "Not specified"}
                  readOnly
                />
              </div>
              <div className="form-field">
                <label className="field-label">Annual Family Income</label>
                <input
                  type="text"
                  className="field-input"
                  value={userProfile.income ? `₹${parseInt(userProfile.income).toLocaleString("en-IN")}` : "Not specified"}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Section 2: Supplementary Applicant Details */}
          <div className="modal-section">
            <h3 className="section-title">2. Applicant & Direct Benefit Transfer (DBT)</h3>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="field-label">Full Legal Name *</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="As on Aadhaar Card"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="field-label">Father's / Spouse's Name</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Father or Husband name"
                  value={formData.fatherSpouseName}
                  onChange={(e) => handleChange("fatherSpouseName", e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "10px" }}>
              <div className="form-field">
                <label className="field-label">Mobile Number</label>
                <input
                  type="tel"
                  className="field-input"
                  placeholder="10-digit mobile"
                  value={formData.mobileNumber}
                  onChange={(e) => handleChange("mobileNumber", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="field-label">Aadhaar Card Number</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="12-digit UID"
                  maxLength="14"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleChange("aadhaarNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3" style={{ marginTop: "10px" }}>
              <div className="form-field">
                <label className="field-label">Bank Account No.</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Account Number"
                  value={formData.bankAccountNo}
                  onChange={(e) => handleChange("bankAccountNo", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="field-label">Bank Name</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. SBI / Andhra Bank"
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="field-label">IFSC Code</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. SBIN0001234"
                  value={formData.bankIfscCode}
                  onChange={(e) => handleChange("bankIfscCode", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Scheme-Specific Fields */}
          {scheme.supplementaryFields && scheme.supplementaryFields.length > 0 && (
            <div className="modal-section">
              <h3 className="section-title">3. Scheme-Specific Details ({scheme.name.split(" ")[0]})</h3>
              <div className="form-grid-2">
                {scheme.supplementaryFields.map((field) => (
                  <div key={field.id} className="form-field">
                    <label className="field-label">
                      {field.label} {field.required ? "*" : ""}
                    </label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder={field.placeholder}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Document Checklist Tracker */}
          <div className="modal-section">
            <div className="checklist-header">
              <h3 className="section-title">4. Document Readiness Checklist</h3>
              <span className="checklist-progress">
                {progress.completed} of {progress.total} arranged ({progress.percent}%)
              </span>
            </div>
            <div className="checklist-bar">
              <div className="checklist-fill" style={{ width: `${progress.percent}%` }} />
            </div>

            <div className="checklist-items">
              {scheme.requiredDocuments.map((doc) => {
                const isChecked = !!docChecks[doc];
                return (
                  <label key={doc} className={`checklist-item ${isChecked ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleDocToggle(doc)}
                    />
                    <span className="checklist-box">{isChecked ? "✓" : ""}</span>
                    <span className="checklist-text">{doc}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Download Success Notice */}
          {downloadSuccess && (
            <div className="download-success-banner">
              ✅ <strong>Application Draft Downloaded!</strong> Check your Downloads folder for the PDF.
            </div>
          )}

          {/* ── Modal Footer Actions ────────────────────────────── */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <a
              href={scheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Open Official Portal ↗
            </a>
            <button
              type="submit"
              className="btn btn-primary btn-download"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span>Generating PDF...</span>
              ) : (
                <span>📥 Download Draft Application (PDF)</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
