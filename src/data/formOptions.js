/**
 * ============================================================
 * SchemeSetu — Form Data Constants
 * File: src/data/formOptions.js
 * ============================================================
 * Centralizes all dropdown/select options for the multi-step
 * form. Edit this file to add new states, occupations, etc.
 * ============================================================
 */

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const OCCUPATIONS = [
  { value: "student", label: "Student" },
  { value: "farmer", label: "Farmer / Agricultural Worker" },
  { value: "unemployed", label: "Unemployed / Job Seeker" },
  { value: "small business owner", label: "Small Business Owner / Self-Employed" },
  { value: "salaried", label: "Salaried Employee" },
  { value: "daily wage worker", label: "Daily Wage Worker / Labourer" },
];

export const CATEGORIES = [
  { value: "General", label: "General" },
  { value: "OBC", label: "OBC (Other Backward Classes)" },
  { value: "SC", label: "SC (Scheduled Caste)" },
  { value: "ST", label: "ST (Scheduled Tribe)" },
  { value: "EWS", label: "EWS (Economically Weaker Section)" },
];

export const EDUCATION_LEVELS = [
  { value: "below 10th", label: "Below 10th (Primary / Middle School)" },
  { value: "10th-12th", label: "10th – 12th (Secondary / Senior Secondary)" },
  { value: "graduate", label: "Graduate (B.A. / B.Sc. / B.Com. / B.Tech. etc.)" },
  { value: "postgraduate", label: "Post-Graduate (M.A. / M.Sc. / MBA / M.Tech. etc.)" },
];

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other / Prefer not to say" },
];

export const MARITAL_STATUSES = [
  { value: "unmarried", label: "Unmarried / Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced / Separated" },
  { value: "widowed", label: "Widowed" },
];

/**
 * Empty default profile — used to initialize form state.
 * PHASE 2: This object's shape is the contract between the form and the AI agent.
 */
export const EMPTY_PROFILE = {
  age: "",
  income: "",
  state: "",
  occupation: "",
  category: "",
  education: "",
  gender: "",
  disability: false,
  maritalStatus: "",
};
