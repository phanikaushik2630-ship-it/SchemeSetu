# 🏛️ SchemeSetu (स्कीमसेतु / పథకసేతు)
### Autonomous AI-Powered Civic Welfare Bridge for Indian Citizens

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20SchemeSetu-2563eb?style=for-the-badge&logo=google-chrome&logoColor=white)](https://phanikaushik2630-ship-it.github.io/SchemeSetu/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-SchemeSetu-10b981?style=for-the-badge&logo=github&logoColor=white)](https://github.com/phanikaushik2630-ship-it/SchemeSetu)

> 🌐 **Live Demo Website**: **[https://phanikaushik2630-ship-it.github.io/SchemeSetu/](https://phanikaushik2630-ship-it.github.io/SchemeSetu/)**  
> **Find, track, and draft applications for Indian Central & State Government Schemes in under 2 minutes.**  
> Built with React + Vite, Node.js/Express, Google AI Studio (`gemini-3.1-flash-lite`), and `jsPDF`.

---

## 🌟 Highlights & Key Features

- **📋 Phase 1 — Eligibility Engine & Multi-Step Questionnaire**:
  - Deterministic evaluation of age, family income, state, occupation, caste category, and education against 20 verified schemes.
  - Granular matching with **Fully Eligible** (100% hard criteria pass) and **Partially Eligible** breakdowns.

- **🤖 Phase 2 — Autonomous AI Agent (Google AI Studio Gemini)**:
  - Multi-step function calling using `@google/genai` (`gemini-3.1-flash-lite`).
  - Tools implemented: `search_schemes`, `check_eligibility`, `get_scheme_details`, and `get_required_documents`.
  - Transparent **Reasoning Trace** panel displaying agent thoughts, tool inputs, results, and execution latency.
  - Built-in exponential backoff retry system to handle API rate spikes smoothly.

- **📄 Phase 3 — Auto-Draft Application Generator & Deadline Tracker**:
  - Client-side A4 application draft generation (`jsPDF`) with citizen demographics, Direct Benefit Transfer (DBT) details, document checklists, and citizen self-declarations.
  - Interactive document checklist with progress tracking (`localStorage`).
  - Deadline urgency calendar with countdown timers and alerts (🔴 Critical < 30 days, 🟡 Upcoming, 🟢 Rolling).
  - "My Applications" pipeline tracker (`Not Started` ➔ `Documents Ready` ➔ `Submitted` ➔ `Approved`).
  - **100% Verified Official Portals**: Every scheme links to an authenticated `.gov.in` / `.nic.in` portal or `myscheme.gov.in`.

- **🏛️ Phase 4 — Unified Dashboard, Scheme Explorer & Visual Polish**:
  - Central citizen dashboard displaying profile summary, matched schemes, urgent cutoffs, and AI quick launchers.
  - Searchable Scheme Explorer with real-time keyword search and category filters (Farmers, Students, Women, MSME, Housing, Healthcare, Pensions).
  - **Accessibility Toolbar**: Text size adjustments (`A-`, `A`, `A+`) and **Tri-Language Support** (**English**, **తెలుగు**, **हिन्दी**).
  - **Light & Dark Theme Adjuster**: Crisp government light mode or slate navy dark mode.
  - **Human Civic Typography**: Clean, neutral, high-legibility typefaces (`Inter` + `Noto Sans`) designed for citizen trust.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite 5, Vanilla CSS Design System (`index.css`, `civic-theme.css`)
- **Backend / AI Engine**: Node.js, Express, Google Gen AI SDK (`@google/genai`), Anthropic Claude SDK
- **PDF Generation**: `jspdf` (100% client-side, zero data sent to external servers)
- **Persistence**: `localStorage` (bookmarks, application pipeline states, language, theme, font scaling)

---

## 🚀 Quickstart Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/phanikaushik2630-ship-it/SchemeSetu.git
cd SchemeSetu
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` and add your Google AI Studio Gemini key:
```env
PORT=3001
GEMINI_API_KEY=your_google_ai_studio_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
```

### 3. Run the Application
Run both the Express AI server and Vite dev frontend concurrently:
```bash
npm run dev
```
- **Frontend**: `http://localhost:5174/` (or `5173`)
- **AI Backend**: `http://localhost:3001/`

---

## 📜 Verified Schemes Included (Sample)

| Scheme | Type | Ministry / Portal |
|---|---|---|
| **PM-KISAN** | Central | [pmkisan.gov.in](https://pmkisan.gov.in/) |
| **Ayushman Bharat (PM-JAY)** | Central | [pmjay.gov.in](https://pmjay.gov.in/) |
| **PMAY-Gramin & Urban** | Central | [pmayg.nic.in](https://pmayg.nic.in/) / [pmaymis.gov.in](https://pmaymis.gov.in/) |
| **NSP Scholarships (Pre/Post Matric)** | Central | [scholarships.gov.in](https://scholarships.gov.in/) |
| **PM MUDRA Yojana** | Central | [mudra.org.in](https://www.mudra.org.in/) |
| **Stand-Up India** | Central | [standupmitra.in](https://www.standupmitra.in/) |
| **PM Vishwakarma** | Central | [pmvishwakarma.gov.in](https://pmvishwakarma.gov.in/) |
| **Sukanya Samriddhi Yojana** | Central | [myscheme.gov.in](https://www.myscheme.gov.in/schemes/ssy) |
| **YSR Rythu Bharosa** | Andhra Pradesh | [ysrrythubharosa.ap.gov.in](https://ysrrythubharosa.ap.gov.in/) |
| **Dr. YSR Aarogyasri** | Andhra Pradesh | [aarogyasri.ap.gov.in](https://aarogyasri.ap.gov.in/) |
| **Rythu Bandhu** | Telangana | [rythubandhu.telangana.gov.in](https://rythubandhu.telangana.gov.in/) |
| **KCR Kit** | Telangana | [kcrkit.telangana.gov.in](https://kcrkit.telangana.gov.in/) |

---

## 🔒 Privacy & Citizen Data Security
- All eligibility calculations run entirely on your device.
- PDF generation operates 100% client-side in the browser.
- No personally identifiable information (PII) is stored on remote servers.

---

## 📄 License
MIT License. Built for Indian Citizens with ❤️.
