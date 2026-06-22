# A1_OUTPUT_041
N_ID: N_041
Files changed:
- components/research/ResearchCard.tsx — compound name text-xl→text-2xl tracking-tight;
  finding text-sm→text-[0.9375rem] leading-relaxed; tier badge px-2.5→px-3 py-1.5;
  meta dl gap stepped to gap-x-4 gap-y-2.5.
- components/research/ResearchFeed.tsx — Today's read banner p-5→p-6, mb-3→mb-4,
  label gets tracking-[0.18em] font-medium; strong-picks count line wrapped in a
  flex row with a trailing hr rule (flex-1 h-px bg-paper/10).
- components/research/Sparkline.tsx — VolumeBar track h-1.5→h-2;
  TierMeter segments h-1.5 w-5→h-2 w-6.
- components/research/StatStrip.tsx — density chart rows gap-2.5→gap-3;
  bar track h-2→h-2.5.
Commands run: tsc 0; build 0.
Notes: pure visual/typographic pass; no data change, no new deps, no engine change.
