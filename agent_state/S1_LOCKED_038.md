# S1_LOCKED_038

N_ID: N_038

Intent:
Make The Wire LIVE — fetch real study counts from PubMed (NCBI E-utilities)
server-side on Vercel, with ISR revalidation, and overlay them onto the feed.
Falls back to the existing curated data on any failure (and in the no-egress dev
sandbox), so the page always renders. When live data is present, the page labels
it "Live · PubMed".

Key constraints:
- Fetch is SERVER-SIDE on Vercel (production reaches PubMed). The dev sandbox is
  egress-blocked → the fetch aborts → static fallback → build stays green here.
- Robust: per-compound try/catch (a failed compound keeps its estimate), an
  overall AbortController timeout, polite chunked concurrency, NCBI tool param.
- No fabricated data: live = real PubMed counts; fallback = labeled estimates.

Scope / Allowed files:
- lib/research/live.ts            (new — getLiveResearchItems(): fetch + fallback)
- components/research/ResearchFeed.tsx (accept items + max as props)
- components/research/StatStrip.tsx     (accept items + live/fetchedAt as props)
- app/research/page.tsx                 (async server component; revalidate; live indicator)
- agent_state/* (trail)

Forbidden files:
- lib/** except new live.ts ; app/api/** ; package.json/lock

Deliverables:
- Production /research shows live PubMed counts (labeled "Live"); dev/build falls
  back to estimates with no error.
- Build + typecheck green; screenshot of fallback render.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
(Build proves the fallback path renders; live path verified in production deploy.)

Parallel safe: false (shared research components). Stop: tsc/build non-zero; forbidden edit.
