# A1_OUTPUT_037
N_ID: N_037
Files changed:
- lib/research/personal.ts (new) — saveStack/readStack (localStorage) + dailyIndex.
- components/ResultCard.tsx — persist the built stack on result (useEffect).
- components/research/ResearchFeed.tsx — "For you" filter, "In your stack" badges,
  stack-first sort, daily "Today's read"; personalization read in useEffect to
  avoid hydration mismatch.
- components/research/ResearchCard.tsx — optional inStack badge + highlight.
Commands run: tsc 0; build 0; live flow: built a protocol → stack saved to
localStorage → /research shows For-you chip (1), In-your-stack badges (7), and a
"Today's read" featured card. Screenshots: yourchannel, yourchannel_foryou.
Notes: anonymous-friendly (localStorage, no PII); no backend/dependency change.
