// N=028: Product image metadata + attribution + safe placeholder resolution.
//
// Hard rule: we never present an image we cannot license-clear as if it were a
// real product photo. In this build environment there is no network egress, so
// no remote image can be downloaded or verified. Therefore resolveProductImage()
// returns an app-rendered PLACEHOLDER by default (clearly a representation, not a
// real bottle). Real licensed references are kept in LICENSED_IMAGE_REFS as
// metadata with full attribution and lastVerifiedAt=null, ready to be promoted
// once a human/agent verifies them with egress.

import type { ProductImage, VitaminProduct } from "./types";

/** App-rendered placeholder — no external license, never implies a real bottle. */
export function placeholderImage(productId: string): ProductImage {
  return {
    id: `${productId}__placeholder`,
    productId,
    imageType: "placeholder",
    imageSource: "app-svg",
    imageUrl: null,
    localPath: null,
    licenseType: "placeholder",
    attributionRequired: false,
    attributionText: null,
    lastVerifiedAt: null,
  };
}

// Curated, free-license imagery references for FUTURE promotion. These are
// recorded as metadata only — NOT rendered yet, because the raw asset URL must
// be verified (and, if attribution is required, surfaced) before use. The
// `imageUrl` here points at the human-verifiable SOURCE PAGE, not a hotlink.
export const LICENSED_IMAGE_REFS: ProductImage[] = [
  {
    id: "lifestyle__wellness-counter",
    productId: "*", // lifestyle/hero imagery, not product-specific
    imageType: "lifestyle",
    imageSource: "Wikimedia Commons",
    imageUrl: "https://commons.wikimedia.org/wiki/Category:Dietary_supplements",
    localPath: null,
    licenseType: "CC-BY-SA",
    attributionRequired: true,
    attributionText: "Wikimedia Commons contributors, CC BY-SA — verify file before use",
    lastVerifiedAt: null,
  },
  {
    id: "lifestyle__unsplash-wellness",
    productId: "*",
    imageType: "lifestyle",
    imageSource: "Unsplash",
    imageUrl: "https://unsplash.com/s/photos/vitamins",
    localPath: null,
    licenseType: "Unsplash",
    attributionRequired: false,
    attributionText: "Unsplash License — credit appreciated; verify photo before use",
    lastVerifiedAt: null,
  },
];

/**
 * Resolve the image to render for a product. Returns a verified, license-clear
 * image when one exists; otherwise the safe placeholder. Pure + deterministic.
 */
export function resolveProductImage(
  product: VitaminProduct,
  verified: ProductImage[] = [],
): ProductImage {
  const match = verified.find(
    (img) =>
      img.productId === product.id &&
      img.imageType === "bottle" &&
      (img.localPath != null || img.imageUrl != null) &&
      img.lastVerifiedAt != null,
  );
  return match ?? placeholderImage(product.id);
}
