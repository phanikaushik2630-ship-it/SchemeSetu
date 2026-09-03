/**
 * ============================================================
 * src/utils/pdfGenerator.js — Auto-Draft PDF Generator
 * ============================================================
 * Uses jsPDF to compile a structured, official-style A4
 * application draft with tricolor header, applicant info,
 * document checklist, signature block, and official disclaimers.
 * ============================================================
 */

import { jsPDF } from "jspdf";

export function generateApplicationDraftPdf({
  scheme,
  userProfile = {},
  supplementary = {},
  documentChecks = {},
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── 1. Tricolor Header Accent ──────────────────────────────
  doc.setFillColor(255, 153, 51); // Indian Saffron
  doc.rect(margin, y, contentWidth / 2, 2.5, "F");
  doc.setFillColor(19, 136, 8); // India Green
  doc.rect(margin + contentWidth / 2, y, contentWidth / 2, 2.5, "F");
  y += 6;

  // Title & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 25, 40);
  doc.text("SCHEMESETU CITIZEN AID — DRAFT APPLICATION", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 130);
  const refId = `SETU-${scheme.id.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`Ref ID: ${refId}  |  Generated on: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, y, { align: "right" });
  y += 6;

  // Sub-header bar
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ── 2. Scheme Details Box ──────────────────────────────────
  doc.setFillColor(245, 247, 252);
  doc.setDrawColor(200, 215, 240);
  doc.roundedRect(margin, y, contentWidth, 25, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 30, 70);
  const schemeTitle = doc.splitTextToSize(scheme.name, contentWidth - 10);
  doc.text(schemeTitle, margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 70, 90);
  doc.text(`Benefit: ${scheme.benefit}`, margin + 4, y + 12);
  doc.text(`Type: ${scheme.type} Scheme ${scheme.state ? `(${scheme.state})` : ""} | Deadline: ${scheme.deadlineLabel || scheme.deadline}`, margin + 4, y + 17);
  doc.text(`Official Portal: ${scheme.officialLink}`, margin + 4, y + 22);
  y += 30;

  // Helper function for field rows
  function renderSectionHeader(title) {
    doc.setFillColor(235, 240, 250);
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20, 40, 90);
    doc.text(title, margin + 3, y + 4.2);
    y += 8;
  }

  function renderFieldPair(label1, val1, label2, val2) {
    const colW = contentWidth / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 120);
    doc.text(label1, margin + 2, y);
    doc.text(label2, margin + colW + 2, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(20, 25, 35);
    doc.text(String(val1 || "—"), margin + 2, y + 4.5);
    doc.text(String(val2 || "—"), margin + colW + 2, y + 4.5);

    // Subtle divider
    doc.setDrawColor(240, 242, 248);
    doc.line(margin, y + 7, pageWidth - margin, y + 7);
    y += 9;
  }

  // ── 3. Section 1: Applicant Demographics ──────────────────
  renderSectionHeader("1. APPLICANT DEMOGRAPHIC DETAILS");
  renderFieldPair(
    "Full Legal Name",
    supplementary.fullName || "—",
    "Father's / Spouse's Name",
    supplementary.fatherSpouseName || "—"
  );
  renderFieldPair(
    "Age / Gender",
    `${userProfile.age || supplementary.age || "—"} yrs / ${userProfile.gender || "—"}`,
    "Marital Status",
    userProfile.maritalStatus || "—"
  );
  renderFieldPair(
    "State of Residence",
    userProfile.state || supplementary.state || "—",
    "Social Category",
    userProfile.category || "—"
  );
  renderFieldPair(
    "Occupation",
    userProfile.occupation || "—",
    "Annual Family Income",
    userProfile.income ? `Rs. ${parseInt(userProfile.income).toLocaleString("en-IN")}` : "—"
  );
  y += 2;

  // ── 4. Section 2: Identification & Bank Details ────────────
  renderSectionHeader("2. IDENTIFICATION & DIRECT BENEFIT TRANSFER (DBT)");
  renderFieldPair(
    "Aadhaar Number",
    supplementary.aadhaarNumber ? `XXXX-XXXX-${supplementary.aadhaarNumber.slice(-4)}` : "—",
    "Primary Contact Mobile",
    supplementary.mobileNumber || "—"
  );
  renderFieldPair(
    "Bank Account Number",
    supplementary.bankAccountNo || "—",
    "Bank Name & IFSC Code",
    `${supplementary.bankName || "Bank"} (IFSC: ${supplementary.bankIfscCode || "—"})`
  );

  // Any scheme-specific supplementary fields
  if (scheme.supplementaryFields && scheme.supplementaryFields.length > 0) {
    const sFields = scheme.supplementaryFields;
    for (let i = 0; i < sFields.length; i += 2) {
      const f1 = sFields[i];
      const f2 = sFields[i + 1];
      renderFieldPair(
        f1.label,
        supplementary[f1.id] || "—",
        f2 ? f2.label : "",
        f2 ? supplementary[f2.id] || "—" : ""
      );
    }
  }
  y += 2;

  // ── 5. Section 3: Document Verification Checklist ──────────
  renderSectionHeader("3. ATTACHED DOCUMENTS & VERIFICATION CHECKLIST");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 110);
  doc.text("Verify that valid copies of the following documents are enclosed with this submission:", margin + 2, y);
  y += 5;

  const docs = scheme.requiredDocuments || [];
  docs.forEach((d, idx) => {
    const isReady = !!documentChecks[d];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    if (isReady) {
      doc.setTextColor(19, 136, 8); // Green
      doc.text(`[ X ]  READY`, margin + 3, y);
    } else {
      doc.setTextColor(160, 130, 20); // Amber
      doc.text(`[   ]  PENDING`, margin + 3, y);
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 35, 50);
    doc.text(`${idx + 1}. ${d}`, margin + 28, y);
    y += 5.5;
  });
  y += 3;

  // ── 6. Section 4: Citizen Self-Declaration ────────────────
  renderSectionHeader("4. CITIZEN SELF-DECLARATION & SUBMISSION");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 70, 85);
  const declarationText = `I hereby solemnly declare that all particulars furnished above in this draft application are true, complete, and correct to the best of my knowledge and belief. I understand that false or misleading claims may lead to disqualification and legal action under prevailing regulations.`;
  const splitDec = doc.splitTextToSize(declarationText, contentWidth - 4);
  doc.text(splitDec, margin + 2, y);
  y += 12;

  // Signature lines
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 110);
  doc.text(`Place: ___________________________`, margin + 2, y);
  doc.text(`Applicant Signature: ___________________________`, margin + contentWidth / 2 + 2, y);
  y += 5;
  doc.text(`Date:  ${new Date().toLocaleDateString("en-IN")}`, margin + 2, y);
  doc.text(`Thumb Impression / Name: _____________________`, margin + contentWidth / 2 + 2, y);
  y += 10;

  // ── 7. Mandatory Official Legal Disclaimer ──────────────────
  doc.setFillColor(255, 250, 240);
  doc.setDrawColor(240, 180, 80);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 90, 10);
  doc.text("⚠️ IMPORTANT LEGAL NOTICE / ASSISTANCE DRAFT ONLY:", margin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 70, 20);
  const disclaimerBody = `This draft application is generated by SchemeSetu to assist Indian citizens in organizing information and preparing documents. It is NOT an official government certificate or final online submission. To complete your benefit claim, please visit the authorized portal (${scheme.officialLink}) or submit this draft along with original certificates at your nearest Common Service Centre (CSC) or administrative office.`;
  const splitDisc = doc.splitTextToSize(disclaimerBody, contentWidth - 6);
  doc.text(splitDisc, margin + 3, y + 8.5);

  // Footer page number
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140, 150, 170);
  doc.text("SchemeSetu Phase 3 — National Government Scheme Bridge · Page 1 of 1", pageWidth / 2, pageHeight - 5, { align: "center" });

  // Save the PDF
  const filename = `SchemeSetu_Draft_${scheme.id}_${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}
