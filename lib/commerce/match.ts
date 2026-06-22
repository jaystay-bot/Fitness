// N=031: map an engine supplement display name (SupplementPick.name) to a
// commerce product slug on /shop, when one exists. Intentionally a tiny static
// map (no products import) so it stays cheap to pull into the client bundle.
// Returns null when no commerce product covers the supplement yet.

const SUPPLEMENT_TO_SLUG: ReadonlyArray<readonly [string, string]> = [
  ["creatine", "creatine-monohydrate"],
  ["vitamin d3", "vitamin-d3"],
  ["omega", "omega-3-fish-oil"],
  ["magnesium", "magnesium-glycinate"],
  ["b12", "vitamin-b12-methylcobalamin"],
];

export function shopSlugForSupplement(name: string): string | null {
  const n = name.toLowerCase();
  for (const [keyword, slug] of SUPPLEMENT_TO_SLUG) {
    if (n.includes(keyword)) return slug;
  }
  return null;
}

export function shopHrefForSupplement(name: string): string | null {
  const slug = shopSlugForSupplement(name);
  return slug ? `/shop#product-${slug}` : null;
}
