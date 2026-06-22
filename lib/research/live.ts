// N=038: live PubMed study counts via NCBI E-utilities, fetched server-side.
//
// Production (Vercel) can reach eutils.ncbi.nlm.nih.gov, so the real count for
// each compound is fetched and overlaid onto the curated feed. Everything is
// defensive: a failed compound keeps its labeled estimate, an overall timeout
// guards the request, and any total failure (including the egress-blocked dev
// sandbox) returns the static feed unchanged. The page renders either way.

import { RESEARCH_ITEMS, type ResearchItem } from "./feed";
import { SUPPLEMENTS } from "../supplements";

const ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const OVERALL_TIMEOUT_MS = 8000;
const CHUNK = 3; // polite concurrency — NCBI allows ~3 req/s without a key

export interface LiveFeed {
  items: ResearchItem[];
  live: boolean;
  fetchedAt: string | null;
}

async function fetchCount(term: string, signal: AbortSignal): Promise<number | null> {
  const url = `${ESEARCH}?db=pubmed&retmode=json&retmax=0&tool=apex-protocol&term=${encodeURIComponent(term)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data = (await res.json()) as { esearchresult?: { count?: string } };
  const c = Number(data?.esearchresult?.count);
  return Number.isFinite(c) && c > 0 ? c : null;
}

export async function getLiveResearchItems(): Promise<LiveFeed> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OVERALL_TIMEOUT_MS);

  try {
    const out: ResearchItem[] = [...RESEARCH_ITEMS];
    for (let i = 0; i < RESEARCH_ITEMS.length; i += CHUNK) {
      const chunk = RESEARCH_ITEMS.slice(i, i + CHUNK);
      const counts = await Promise.all(
        chunk.map(async (item) => {
          const sup = SUPPLEMENTS.find((s) => s.id === item.id);
          const term = `${sup?.name ?? item.name} supplementation`;
          try {
            return await fetchCount(term, controller.signal);
          } catch {
            return null;
          }
        }),
      );
      counts.forEach((count, j) => {
        if (count != null) {
          const idx = i + j;
          out[idx] = { ...out[idx], studyCount: count };
        }
      });
    }
    clearTimeout(timeout);

    const live = out.some((o, i) => o.studyCount !== RESEARCH_ITEMS[i].studyCount);
    return {
      items: out,
      live,
      fetchedAt: live ? new Date().toISOString() : null,
    };
  } catch {
    clearTimeout(timeout);
    return { items: RESEARCH_ITEMS, live: false, fetchedAt: null };
  }
}
