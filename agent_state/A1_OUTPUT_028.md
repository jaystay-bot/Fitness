# A1_OUTPUT_028

N_ID: N_028

Files changed (all new):
- lib/commerce/types.ts — VitaminProduct, RetailOffer, ProductImage,
  HealthComplianceNote, ResolvedProduct + enums (Retailer, ProductForm,
  AvailabilityStatus, ImageType, LicenseType, ComplianceNoteType).
- lib/commerce/retailers.ts — RETAILERS registry (Amazon, Walmart, iHerb,
  Walgreens, CVS, Target, Costco, GNC) with deterministic search-URL builders;
  buildOffers() (price=null, "Check price"); rankOffers() (cheapest VERIFIED
  first, else priority; best price null when nothing verified).
- lib/commerce/images.ts — placeholderImage(); LICENSED_IMAGE_REFS (Wikimedia/
  Unsplash source-page metadata + attribution, lastVerifiedAt=null);
  resolveProductImage() → placeholder until a verified bottle image exists.
- lib/commerce/compliance.ts — STANDARD/PRICE/ROUTING disclaimers; CONSULT_DOCTOR;
  BLOCKED_CLAIM_PATTERNS; containsMedicalClaim(); auditCopy(); ALLOWED_LEAD_INS.
- lib/commerce/products.ts — 5 seed vitamins (brand=null, no fake price), each
  resolved with offers + placeholder image + compliance notes; build-time guard
  throws if any seed copy trips a blocked claim.

Commands run:
- npx tsc --noEmit → 0 ; npm run build → 0 (guard did not throw → copy clean).

Notes:
- Reuses the engine's getSupplement() to attach real evidence tier + PMID to
  source notes — ties commerce back to the deterministic engine.
- No dependency added; no existing file modified; no UI this cycle.

Out-of-scope noticed:
- Live price/stock + exact-SKU resolution needs retailer APIs + egress → later.
- Real bottle imagery needs egress to verify/download → later (placeholder now).
