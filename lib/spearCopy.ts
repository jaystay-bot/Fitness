// Top-of-page positioning copy.
// These strings appear in the rendered UI verbatim. As of N=024 they describe
// the app's actual mission — minimal-input, evidence-backed supplement and
// nutrition guidance — replacing the earlier "un-insurance / vault" framing,
// which read as misconstrued. Do not reintroduce financial/insurance claims
// without a Commander-level contract change.

export const SPEAR_COPY = {
  heroEyebrow: "EVIDENCE-BACKED SUPPLEMENT & NUTRITION",
  heroHeadline: "The basics your body needs, settled by the science.",
  heroSubhead:
    "Answer a few quick questions and get a clear, evidence-tiered plan: your daily protein and water targets, the supplements actually worth taking, and what to skip.",
  heroPanel: {
    title: "What you get",
    items: [
      "A ranked supplement stack with the evidence tier on every pick",
      "Daily protein and water targets sized to your body",
      "Eat-more / eat-less food guidance for your goal",
      "A plain-language 30-day plan",
    ],
  },
  threeButtons: {
    whatHurts: "What hurts",
    whatDoINeed: "What do I need",
    iKnowProduct: "I know the product",
  },
  buttonCaptions: {
    whatHurts: "Tell us a symptom and we will route you",
    whatDoINeed: "Personalized protocol from your inputs",
    iKnowProduct: "Skip to the recommendation",
  },
  preview: {
    heading: "What your protocol covers",
    tag: "Preview",
    cards: [
      {
        label: "Supplement stack",
        value: "Ranked",
        caption: "evidence-tiered, 3–7 picks",
      },
      {
        label: "Daily targets",
        value: "Protein + water",
        caption: "sized to your body",
      },
      {
        label: "Food protocol",
        value: "Eat more / less",
        caption: "matched to your goal",
      },
      {
        label: "30-day plan",
        value: "Week by week",
        caption: "plain-language steps",
      },
    ],
  },
  thesisBullets: [
    "Know what to take.",
    "Know why it is on the list.",
    "Skip the wasted spend.",
  ] as const,
  closer: "Evidence first. No hype. No filler.",
} as const;

export const ASSESSMENT_FORM_ANCHOR = "assessment-form";
