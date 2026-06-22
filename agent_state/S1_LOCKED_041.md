# S1_LOCKED_041

N_ID: N_041

Intent:
Premium Typography & Visual Hierarchy pass on The Wire research components.
Tighten the reading experience across ResearchCard, ResearchFeed, Sparkline,
and StatStrip without touching the data layer or engine:

1. ResearchCard: compound name stepped up to text-2xl for visual authority;
   finding text promoted to 15px / leading-relaxed; tier badge gets a slightly
   larger pill; bottom meta row (Evidence / Studies) gets taller segments.
2. ResearchFeed: "Today's read" banner gets a stronger label + spacing; the
   strong-picks count line becomes a proper section divider with a rule; the
   sticky filter row gets refined chip sizing.
3. Sparkline: VolumeBar and TierMeter segments stepped from h-1.5 to h-2
   for better visual weight at card scale.
4. StatStrip: density chart rows get slightly more vertical breathing room.

No data change, no new deps, no engine/route change.

Scope / Allowed files:
- components/research/ResearchCard.tsx
- components/research/ResearchFeed.tsx
- components/research/Sparkline.tsx
- components/research/StatStrip.tsx
- agent_state/* (trail)

Forbidden files:
- everything else.

Deliverables:
- Typography improvements live; build + typecheck green; screenshot of
  an improved card and the feed header.

Verify command:
```bash
npx tsc --noEmit && npm run build
```

Parallel safe: false (shared components). Stop: tsc/build non-zero; forbidden edit.
