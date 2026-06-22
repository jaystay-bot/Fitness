// N=028: Retailer registry + deterministic outbound search-URL builders.
//
// We never invent product SKUs or prices. Each builder returns the retailer's
// own SEARCH results page for the product's query string — a real, always-valid
// outbound URL. Live price + exact-product resolution is a later cycle (requires
// retailer APIs / affiliate feeds and network egress); until then offers carry
// priceCents = null and the UI shows "Check price".

import type { Retailer, RetailOffer, VitaminProduct } from "./types";

export interface RetailerMeta {
  id: Retailer;
  name: string;
  /** Builds the retailer's search-results URL for a free-text query. */
  searchUrl: (query: string) => string;
  affiliateReady: boolean;
  isDirectBrand: boolean;
  /** Pickup/local availability is meaningful for this retailer. */
  locationSensitive: boolean;
  /** Default surfacing order when no verified price ranks the offers. */
  priorityRank: number;
}

const q = (s: string) => encodeURIComponent(s.trim());

export const RETAILERS: Record<Exclude<Retailer, "brand">, RetailerMeta> = {
  amazon: {
    id: "amazon",
    name: "Amazon",
    searchUrl: (query) => `https://www.amazon.com/s?k=${q(query)}`,
    affiliateReady: true,
    isDirectBrand: false,
    locationSensitive: false,
    priorityRank: 1,
  },
  walmart: {
    id: "walmart",
    name: "Walmart",
    searchUrl: (query) => `https://www.walmart.com/search?q=${q(query)}`,
    affiliateReady: true,
    isDirectBrand: false,
    locationSensitive: true,
    priorityRank: 2,
  },
  iherb: {
    id: "iherb",
    name: "iHerb",
    searchUrl: (query) => `https://www.iherb.com/search?kw=${q(query)}`,
    affiliateReady: true,
    isDirectBrand: false,
    locationSensitive: false,
    priorityRank: 3,
  },
  walgreens: {
    id: "walgreens",
    name: "Walgreens",
    searchUrl: (query) =>
      `https://www.walgreens.com/search/results.jsp?Ntt=${q(query)}`,
    affiliateReady: false,
    isDirectBrand: false,
    locationSensitive: true,
    priorityRank: 4,
  },
  cvs: {
    id: "cvs",
    name: "CVS",
    searchUrl: (query) => `https://www.cvs.com/search?searchTerm=${q(query)}`,
    affiliateReady: false,
    isDirectBrand: false,
    locationSensitive: true,
    priorityRank: 5,
  },
  target: {
    id: "target",
    name: "Target",
    searchUrl: (query) => `https://www.target.com/s?searchTerm=${q(query)}`,
    affiliateReady: true,
    isDirectBrand: false,
    locationSensitive: true,
    priorityRank: 6,
  },
  costco: {
    id: "costco",
    name: "Costco",
    searchUrl: (query) =>
      `https://www.costco.com/CatalogSearch?keyword=${q(query)}`,
    affiliateReady: false,
    isDirectBrand: false,
    locationSensitive: true,
    priorityRank: 7,
  },
  gnc: {
    id: "gnc",
    name: "GNC",
    searchUrl: (query) => `https://www.gnc.com/search?q=${q(query)}`,
    affiliateReady: true,
    isDirectBrand: false,
    locationSensitive: true,
    priorityRank: 8,
  },
};

/** The retailers an offer set spans by default, in priority order. */
export const DEFAULT_RETAILERS: Array<Exclude<Retailer, "brand">> = [
  "amazon",
  "walmart",
  "iherb",
  "walgreens",
  "cvs",
  "target",
];

/** Deterministic search query for a product (brand-agnostic when brand is null). */
export function productQuery(product: VitaminProduct): string {
  const parts = [product.brand, product.name, product.strengthLabel].filter(
    (p): p is string => Boolean(p),
  );
  return parts.join(" ");
}

/**
 * Build the outbound retail offers for a product. Deterministic and pure.
 * Prices are intentionally null (UI shows "Check price"); verification of live
 * price/stock is a future cycle. Identical input → identical output.
 */
export function buildOffers(
  product: VitaminProduct,
  retailers: Array<Exclude<Retailer, "brand">> = DEFAULT_RETAILERS,
): RetailOffer[] {
  const query = productQuery(product);
  return retailers.map((id) => {
    const meta = RETAILERS[id];
    return {
      id: `${product.id}__${id}`,
      productId: product.id,
      retailer: id,
      retailerProductUrl: meta.searchUrl(query),
      priceCents: null,
      currency: "USD",
      availabilityStatus: "unknown",
      shippingAvailable: true,
      pickupAvailable: meta.locationSensitive,
      locationSensitive: meta.locationSensitive,
      lastVerifiedAt: null,
      affiliateReady: meta.affiliateReady,
      isDirectBrand: meta.isDirectBrand,
      priorityRank: meta.priorityRank,
    };
  });
}

/**
 * Order offers cheapest-first when prices are verified, otherwise by priority.
 * Returns a new array. The "best visible price" is the cheapest VERIFIED offer,
 * or null when none are verified (so the UI never badges a guess).
 */
export function rankOffers(offers: RetailOffer[]): {
  ordered: RetailOffer[];
  bestPriceOfferId: string | null;
} {
  const ordered = [...offers].sort((a, b) => {
    const ap = a.priceCents;
    const bp = b.priceCents;
    if (ap != null && bp != null) return ap - bp;
    if (ap != null) return -1;
    if (bp != null) return 1;
    return a.priorityRank - b.priorityRank;
  });
  const verified = ordered.filter((o) => o.priceCents != null);
  const bestPriceOfferId = verified.length > 0 ? verified[0].id : null;
  return { ordered, bestPriceOfferId };
}
