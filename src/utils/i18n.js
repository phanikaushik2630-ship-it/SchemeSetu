/**
 * ============================================================
 * src/utils/i18n.js — Multi-Language & Accessibility Layer
 * ============================================================
 * Supports:
 *  - English (en)
 *  - తెలుగు (te - Telugu)
 *  - हिन्दी (hi - Hindi)
 *  - Font size scaling manager (A-, A, A+)
 * ============================================================
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

export const TRANSLATIONS = {
  en: {
    // Navigation
    navDashboard: "Dashboard",
    navExplore: "Explore Schemes",
    navEligibility: "Eligibility Check",
    navDeadlines: "Deadlines",
    navMyApplications: "My Applications",
    navAskAi: "Ask AI",

    // Accessibility Bar
    skipToMain: "Skip to main content",
    fontSize: "Text Size:",
    language: "Language:",

    // Dashboard
    dashboardTitle: "Citizen Welfare Dashboard",
    dashboardSub: "Discover benefits, track deadlines, monitor applications, and consult your autonomous AI assistant.",
    profileBadge: "Citizen Profile Active",
    noProfileBadge: "Guest Mode · Profile Not Set",
    profileCta: "Complete your 2-minute profile check to discover customized benefits →",
    matchedHeading: "Your Matched Benefits",
    fullyEligible: "Fully Eligible",
    checkManually: "Check Conditions",
    totalMatched: "Total Matched",
    viewResults: "View All Matched Schemes →",
    urgentDeadlinesHeading: "⏰ Urgent Deadlines (Next 30 Days)",
    viewAllDeadlines: "View Full Deadline Calendar →",
    myAppsSnapshot: "📁 My Applications Pipeline",
    notStarted: "Not Started",
    docsReady: "Docs Ready",
    submitted: "Submitted",
    approved: "Approved",
    viewMyApps: "Manage My Applications →",
    aiAssistantTitle: "🤖 Ask SchemeSetu AI Agent",
    aiAssistantSub: "Ask natural language questions about subsidies, student grants, pensions, or state benefits.",
    askAiPrompt1: "Find schemes for a farmer in Andhra Pradesh",
    askAiPrompt2: "What scholarships can engineering students apply for?",
    askAiPrompt3: "Housing subsidies for rural low-income families",
    searchBoxPlaceholder: "Search any scheme by name, keyword, state, or benefit...",

    // Explorer
    explorerTitle: "Explore All Government Schemes",
    explorerSub: "Browse 20 verified central and state schemes across India. Search by keyword or filter by category.",
    filterAll: "All Schemes",
    filterCentral: "Central Schemes",
    filterState: "State Schemes",
    filterCategory: "Category",
    filterBenefitType: "Benefit Type",
    searchPlaceholder: "Search by scheme name, benefit, or keyword...",
    schemesFound: "schemes available",

    // Common Card & Action Buttons
    generateApp: "Generate Application",
    officialPortal: "Official Portal",
    save: "Save",
    saved: "Saved",
    daysRemaining: "days left",
    closingSoon: "Closing Soon!",
    rollingOpen: "Rolling / Open",
    themeLight: "Light",
    themeDark: "Dark",
    themeLabel: "Theme:",
  },

  te: {
    // Navigation
    navDashboard: "డాష్‌బోర్డ్",
    navExplore: "పథకాలు అన్వేషించండి",
    navEligibility: "అర్హత తనిఖీ",
    navDeadlines: "గడువులు",
    navMyApplications: "నా దరఖాస్తులు",
    navAskAi: "AI ని అడగండి",

    // Accessibility Bar
    skipToMain: "ప్రధాన కంటెంట్‌కు వెళ్లండి",
    fontSize: "అక్షర పరిమాణం:",
    language: "భాష:",

    // Dashboard
    dashboardTitle: "పౌర సంక్షేమ డాష్‌బోర్డ్",
    dashboardSub: "ప్రభుత్వ సంక్షేమ పథకాలు కనుగొనండి, గడువులను ట్రాక్ చేయండి మరియు AI సహాయకుడిని సంప్రదించండి.",
    profileBadge: "పౌరుడి ప్రొఫైల్ సక్రియం",
    noProfileBadge: "అతిథి మోడ్ · ప్రొఫైల్ సెట్ చేయలేదు",
    profileCta: "వ్యక్తిగత పథకాలను కనుగొనడానికి 2 నిమిషాల అర్హత తనిఖీ పూర్తి చేయండి →",
    matchedHeading: "మీకు సరిపోయే పథకాలు",
    fullyEligible: "పూర్తి అర్హత",
    checkManually: "షరతులు సరిచూడండి",
    totalMatched: "మొత్తం పథకాలు",
    viewResults: "అన్ని సరిపోలిన పథకాలను చూడండి →",
    urgentDeadlinesHeading: "⏰ రాబోయే ముఖ్యమైన గడువులు (30 రోజుల్లో)",
    viewAllDeadlines: "పూర్తి గడువుల క్యాలెండర్ చూడండి →",
    myAppsSnapshot: "📁 నా దరఖాస్తుల స్థితి",
    notStarted: "ప్రారంభించలేదు",
    docsReady: "పత్రాలు సిద్ధం",
    submitted: "సమర్పించబడింది",
    approved: "ఆమోదించబడింది",
    viewMyApps: "నా దరఖాస్తులను నిర్వహించండి →",
    aiAssistantTitle: "🤖 SchemeSetu AI సహాయకుడిని అడగండి",
    aiAssistantSub: "రైతు రాయితీలు, విద్యార్థి స్కాలర్‌షిప్‌లు లేదా పింఛన్ల గురించి సహజ భాషలో అడగండి.",
    askAiPrompt1: "ఆంధ్రప్రదేశ్‌లోని రైతులకు ఏ పథకాలు ఉన్నాయి?",
    askAiPrompt2: "ఇంజనీరింగ్ విద్యార్థులకు ఏ స్కాలర్‌షిప్‌లు ఉన్నాయి?",
    askAiPrompt3: "గ్రామీణ పేద కుటుంబాలకు గృహ నిర్మాణ పథకాలు",
    searchBoxPlaceholder: "పథకం పేరు, కీవర్డ్ లేదా రాష్ట్రం ద్వారా శోధించండి...",

    // Explorer
    explorerTitle: "అన్ని ప్రభుత్వ పథకాలను అన్వేషించండి",
    explorerSub: "భారతదేశం అంతటా 20 ధృవీకరించబడిన కేంద్ర మరియు రాష్ట్ర పథకాలను బ్రౌజ్ చేయండి.",
    filterAll: "అన్ని పథకాలు",
    filterCentral: "కేంద్ర పథకాలు",
    filterState: "రాష్ట్ర పథకాలు",
    filterCategory: "వర్గం",
    filterBenefitType: "ప్రయోజనం రకం",
    searchPlaceholder: "పథకం పేరు లేదా కీవర్డ్ ద్వారా శోధించండి...",
    schemesFound: "పథకాలు అందుబాటులో ఉన్నాయి",

    // Common Card & Action Buttons
    generateApp: "దరఖాస్తు ముసాయిదా చేయండి",
    officialPortal: "అధికారిక పోర్టల్",
    save: "భద్రపరచు",
    saved: "భద్రపరచబడింది",
    daysRemaining: "రోజులు మిగిలి ఉన్నాయి",
    closingSoon: "త్వరలో ముగియనుంది!",
    rollingOpen: "ఎల్లప్పుడూ తెరిచి ఉంటుంది",
    themeLight: "లైట్",
    themeDark: "డార్క్",
    themeLabel: "థీమ్:",
  },

  hi: {
    // Navigation
    navDashboard: "डैशबोर्ड",
    navExplore: "योजनाएं देखें",
    navEligibility: "पात्रता जांच",
    navDeadlines: "अंतिम तिथियां",
    navMyApplications: "मेरे आवेदन",
    navAskAi: "AI से पूछें",

    // Accessibility Bar
    skipToMain: "मुख्य सामग्री पर जाएं",
    fontSize: "फ़ॉन्ट आकार:",
    language: "भाषा:",

    // Dashboard
    dashboardTitle: "नागरिक कल्याण डैशबोर्ड",
    dashboardSub: "सरकारी योजनाओं की खोज करें, समय सीमा ट्रैक करें और AI सहायक से मार्गदर्शन लें।",
    profileBadge: "नागरिक प्रोफ़ाइल सक्रिय",
    noProfileBadge: "अतिथि मोड · प्रोफ़ाइल सेट नहीं है",
    profileCta: "व्यक्तिगत लाभ खोजने के लिए अपनी 2 मिनट की पात्रता जांच पूरी करें →",
    matchedHeading: "आपके लिए उपयुक्त योजनाएं",
    fullyEligible: "पूर्णतः पात्र",
    checkManually: "शर्तें जांचें",
    totalMatched: "कुल योजनाएं",
    viewResults: "सभी उपयुक्त योजनाएं देखें →",
    urgentDeadlinesHeading: "⏰ आगामी अंतिम तिथियां (30 दिनों के भीतर)",
    viewAllDeadlines: "पूर्ण समय सीमा कैलेंडर देखें →",
    myAppsSnapshot: "📁 मेरे आवेदनों की प्रगति",
    notStarted: "शुरू नहीं",
    docsReady: "दस्तावेज़ तैयार",
    submitted: "जमा किया गया",
    approved: "स्वीकृत",
    viewMyApps: "मेरे आवेदनों को प्रबंधित करें →",
    aiAssistantTitle: "🤖 SchemeSetu AI सहायक से पूछें",
    aiAssistantSub: "किसान सब्सिडी, छात्रवृत्ति, आवास या पेंशन के बारे में अपनी भाषा में प्रश्न पूछें।",
    askAiPrompt1: "आंध्र प्रदेश में किसानों के लिए कौन सी योजनाएं हैं?",
    askAiPrompt2: "इंजीनियरिंग छात्रों के लिए कौन सी छात्रवृत्तियां हैं?",
    askAiPrompt3: "ग्रामीण परिवारों के लिए आवास सहायता योजनाएं",
    searchBoxPlaceholder: "योजना का नाम, कीवर्ड या राज्य द्वारा खोजें...",

    // Explorer
    explorerTitle: "सभी सरकारी योजनाओं का अन्वेषण करें",
    explorerSub: "भारत भर की 20 सत्यापित केंद्रीय और राज्य सरकारी योजनाओं की सूची ब्राउज़ करें।",
    filterAll: "सभी योजनाएं",
    filterCentral: "केंद्रीय योजनाएं",
    filterState: "राज्य योजनाएं",
    filterCategory: "श्रेणी",
    filterBenefitType: "लाभ प्रकार",
    searchPlaceholder: "योजना के नाम या कीवर्ड से खोजें...",
    schemesFound: "योजनाएं उपलब्ध हैं",

    // Common Card & Action Buttons
    generateApp: "आवेदन प्रारूप बनाएं",
    officialPortal: "आधिकारिक पोर्टल",
    save: "सहेजें",
    saved: "सहेजा गया",
    daysRemaining: "दिन शेष",
    closingSoon: "जल्द समाप्त!",
    rollingOpen: "वर्ष भर खुला",
    themeLight: "लाइट",
    themeDark: "डार्क",
    themeLabel: "थीम:",
  },
};

/**
 * Safe translation getter with English fallback.
 */
export function t(key, lang = "en") {
  const currentDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return currentDict[key] || TRANSLATIONS.en[key] || key;
}

// ── Theme & Accessibility Persistence ───────────────────────
const THEME_KEY = "schemeSetu_theme";
const FONT_SCALE_KEY = "schemeSetu_fontScale";
const LANG_KEY = "schemeSetu_language";

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "light"; // Default to clean, official light civic mode
  } catch {
    return "light";
  }
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  } catch {}
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
}

export function getStoredLanguage() {
  try {
    return localStorage.getItem(LANG_KEY) || "en";
  } catch {
    return "en";
  }
}

export function setStoredLanguage(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
}

export function getStoredFontScale() {
  try {
    return localStorage.getItem(FONT_SCALE_KEY) || "normal"; // "small" | "normal" | "large"
  } catch {
    return "normal";
  }
}

export function setStoredFontScale(scale) {
  try {
    localStorage.setItem(FONT_SCALE_KEY, scale);
    applyFontScale(scale);
  } catch {}
}

export function applyFontScale(scale) {
  const root = document.documentElement;
  if (scale === "small") {
    root.style.setProperty("--font-scale", "0.92");
  } else if (scale === "large") {
    root.style.setProperty("--font-scale", "1.12");
  } else {
    root.style.setProperty("--font-scale", "1.0");
  }
}
