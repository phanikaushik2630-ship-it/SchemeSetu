/**
 * ============================================================
 * server/toolDefinitions.js — AI Tool Schemas
 * ============================================================
 * Defines the 4 tools for SchemeSetu AI Agent:
 *  1. search_schemes
 *  2. check_eligibility
 *  3. get_scheme_details
 *  4. get_required_documents
 *
 * Supports both:
 *  - Google Gemini API (Google AI Studio)
 *  - Anthropic Claude API
 * ============================================================
 */

// ── Anthropic Claude format ─────────────────────────────────
export const TOOL_DEFINITIONS = [
  {
    name: "search_schemes",
    description: "Search the SchemeSetu database of 20 real Indian government schemes using flexible criteria (occupation, state, category, keyword, gender, benefitType). Returns matching scheme IDs, names, and summaries.",
    input_schema: {
      type: "object",
      properties: {
        occupation: { type: "string", description: "Filter by occupation: student, farmer, unemployed, 'small business owner', salaried, 'daily wage worker'" },
        state: { type: "string", description: "Filter by state, e.g. 'Andhra Pradesh', 'Telangana'" },
        category: { type: "string", description: "Filter by social category: General, OBC, SC, ST, EWS" },
        keyword: { type: "string", description: "Keyword to search in name, description, benefit" },
        gender: { type: "string", description: "Filter by gender: male, female" },
        benefitType: { type: "string", description: "Filter by benefit: cash, grant, subsidy, insurance, scholarship, loan, pension, savings, stipend, training_and_cash, grant_and_loan, property_rights" },
      },
      required: [],
    },
  },
  {
    name: "check_eligibility",
    description: "Run eligibility matching for ONE specific scheme against a user profile. Returns verdict (ELIGIBLE, PARTIALLY_ELIGIBLE, NOT_ELIGIBLE), match score, matched and missed criteria.",
    input_schema: {
      type: "object",
      properties: {
        schemeId: { type: "string", description: "ID of the scheme, e.g. 'pm-kisan', 'ayushman-bharat', 'ysr-rythu-bharosa'" },
        userProfile: {
          type: "object",
          description: "User details to check",
          properties: {
            age: { type: "number", description: "Age in years" },
            income: { type: "number", description: "Annual income in INR" },
            state: { type: "string", description: "State of residence" },
            occupation: { type: "string", description: "Occupation" },
            category: { type: "string", description: "Category: General, OBC, SC, ST, EWS" },
            education: { type: "string", description: "Education level" },
            gender: { type: "string", description: "Gender: male, female, other" },
            disability: { type: "boolean", description: "Person with Disability (true/false)" },
            maritalStatus: { type: "string", description: "Marital status: unmarried, married, divorced, widowed" },
          },
        },
      },
      required: ["schemeId", "userProfile"],
    },
  },
  {
    name: "get_scheme_details",
    description: "Get comprehensive details for a specific scheme including description, benefit amount, official portal link, and rules.",
    input_schema: {
      type: "object",
      properties: {
        schemeId: { type: "string", description: "Scheme ID, e.g. 'pm-kisan', 'ayushman-bharat'" },
      },
      required: ["schemeId"],
    },
  },
  {
    name: "get_required_documents",
    description: "Get the complete checklist of official documents required to apply for a specific scheme.",
    input_schema: {
      type: "object",
      properties: {
        schemeId: { type: "string", description: "Scheme ID, e.g. 'pm-kisan', 'ysr-rythu-bharosa'" },
      },
      required: ["schemeId"],
    },
  },
];

// ── Google Gemini format (@google/genai) ────────────────────
export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "search_schemes",
        description: "Search SchemeSetu's 20 Indian government schemes by occupation, state, category, keyword, gender, or benefitType.",
        parameters: {
          type: "OBJECT",
          properties: {
            occupation: { type: "STRING", description: "student, farmer, unemployed, small business owner, salaried, daily wage worker" },
            state: { type: "STRING", description: "State, e.g. Andhra Pradesh, Telangana" },
            category: { type: "STRING", description: "General, OBC, SC, ST, EWS" },
            keyword: { type: "STRING", description: "Search keyword, e.g. scholarship, pension, loan, health" },
            gender: { type: "STRING", description: "male or female" },
            benefitType: { type: "STRING", description: "Benefit type, e.g. cash, loan, insurance" },
          },
        },
      },
      {
        name: "check_eligibility",
        description: "Verify eligibility for a single scheme against a user profile with criteria pass/fail reasoning and score.",
        parameters: {
          type: "OBJECT",
          properties: {
            schemeId: { type: "STRING", description: "Scheme ID, e.g. 'pm-kisan', 'ayushman-bharat'" },
            userProfile: {
              type: "OBJECT",
              description: "User details object containing age, income, state, occupation, category, gender, education, disability, maritalStatus",
              properties: {
                age: { type: "NUMBER" },
                income: { type: "NUMBER" },
                state: { type: "STRING" },
                occupation: { type: "STRING" },
                category: { type: "STRING" },
                gender: { type: "STRING" },
                education: { type: "STRING" },
                disability: { type: "BOOLEAN" },
                maritalStatus: { type: "STRING" },
              },
            },
          },
          required: ["schemeId", "userProfile"],
        },
      },
      {
        name: "get_scheme_details",
        description: "Get full details, official benefits, and application link for a government scheme.",
        parameters: {
          type: "OBJECT",
          properties: {
            schemeId: { type: "STRING", description: "Scheme ID, e.g. 'pm-kisan', 'ayushman-bharat'" },
          },
          required: ["schemeId"],
        },
      },
      {
        name: "get_required_documents",
        description: "Get the checklist of required verification documents to apply for a scheme.",
        parameters: {
          type: "OBJECT",
          properties: {
            schemeId: { type: "STRING", description: "Scheme ID, e.g. 'pm-kisan', 'ysr-rythu-bharosa'" },
          },
          required: ["schemeId"],
        },
      },
    ],
  },
];
