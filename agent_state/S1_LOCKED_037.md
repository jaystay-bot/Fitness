# S1_LOCKED_037

N_ID: N_037

Intent:
Make The Wire personal — "Your Channel". When a user has built a protocol, the
research feed knows the compounds in their stack and surfaces them: a "For you"
filter, an "In your stack" flag on matching cards, stack-first sorting, and a
deterministic "Today's read" featured pick so each visit surfaces something.
Client-side personalization via localStorage (works for anonymous users); no
backend, no fabricated data.

Scope / Allowed files:
- lib/research/personal.ts          (new — localStorage read/write of the user's stack)
- components/ResultCard.tsx          (persist the built stack to localStorage)
- components/research/ResearchFeed.tsx (For you filter, badges, sort, Today pick)
- components/research/ResearchCard.tsx (optional "In your stack" badge prop)
- agent_state/* (trail)

Forbidden files:
- lib/** except new personal.ts ; app/api/** ; package.json/lock

Hydration safety:
- Personalization (stack, featured) is read in useEffect and rendered only after
  mount, so SSR output matches and there is no hydration mismatch.

Deliverables:
- Result build saves the stack; /research shows "For you" + "In your stack" +
  a daily "Today's read"; stack compounds sort first.
- Build + typecheck green; screenshots.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus a screenshot of /research after a protocol is built (personalized state).

Parallel safe: false (shared ResultCard/feed). Stop: tsc/build non-zero; forbidden edit.
