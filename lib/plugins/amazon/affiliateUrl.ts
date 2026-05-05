// N=015: pure deterministic Amazon affiliate URL generator. No I/O, no
// `'use client'`, no dependencies beyond URLSearchParams (a Web standard).
// Identical inputs always produce identical URLs.
//
// URL form:
//   https://www.amazon.com/s?k=<encoded supplement>&tag=<associates tag>
//
// When the supplement name is empty or whitespace, the URL falls back to a
// tag-only generic Amazon search root so the affiliate attribution still
// fires even if the calling site omits a search term. When the associates
// tag is empty, the `tag` parameter is omitted entirely and no affiliate
// revenue accrues — the redirect still works for the user.

const AMAZON_SEARCH_ROOT = "https://www.amazon.com/s";
const AMAZON_HOME = "https://www.amazon.com/";

export function generateAmazonAffiliateUrl(
  supplementName: string,
  associatesTag: string,
): string {
  const trimmedName = typeof supplementName === "string" ? supplementName.trim() : "";
  const trimmedTag = typeof associatesTag === "string" ? associatesTag.trim() : "";

  // Empty supplement name → fall back to tag-only search URL or the
  // Amazon home page if no tag is configured.
  if (trimmedName.length === 0) {
    if (trimmedTag.length === 0) return AMAZON_HOME;
    const params = new URLSearchParams();
    params.set("tag", trimmedTag);
    return `${AMAZON_SEARCH_ROOT}?${params.toString()}`;
  }

  const params = new URLSearchParams();
  params.set("k", trimmedName);
  if (trimmedTag.length > 0) params.set("tag", trimmedTag);
  return `${AMAZON_SEARCH_ROOT}?${params.toString()}`;
}
