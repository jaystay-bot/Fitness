// Project Spear locked positioning copy.
// These strings appear in the rendered UI verbatim. The wedge depends
// on the exact phrasing — do not paraphrase, abbreviate, or add emphasis
// markers without an architect-level contract change.

export const SPEAR_COPY = {
  heroEyebrow: "PROJECT SPEAR",
  heroHeadline: "This is not insurance. This is ownership.",
  heroSubhead:
    "Insurance hopes you get sick and do not use it. We hope you stay healthy and keep your money.",
  threeButtons: {
    whatHurts: "What hurts",
    whatDoINeed: "What do I need",
    iKnowProduct: "I know the product",
  },
  buttonCaptions: {
    whatHurts: "Tell us a symptom and we will route you",
    whatDoINeed: "Personalized protocol from your inputs",
    iKnowProduct: "Skip to recommendation",
  },
  vaultLabels: {
    balance: "Vault Balance",
    savedThisMonth: "This Month Saved",
    healthScore: "Health Score",
    findCare: "Find Care",
  },
  vaultMath: {
    monthlyContribution: 200,
    yearOneKept: 2400,
    yearTwoKept: 4800,
    traditionalKept: 0,
  },
  vaultCaptions: {
    balance: "after 12 months at $200/mo",
    savedThisMonth: "kept by you",
    healthScore: "verified by your activity",
    findCare: "Browse",
  },
  vaultDisclosure:
    "Preview only. Vault funding ships in N=010. Provider marketplace ships in N=011.",
  thesisBullets: [
    "Find care yourself.",
    "Pay yourself.",
    "Own yourself.",
  ] as const,
  closer: "No co-pays. No denials. No leakage.",
} as const;

export const ASSESSMENT_FORM_ANCHOR = "assessment-form";
