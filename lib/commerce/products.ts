// N=028: Seed vitamin products + resolver. Five common, widely-available
// supplements. No fabricated brand or price: brand is null (we route to a
// brand-agnostic retailer search) and every offer's price is null ("Check
// price"). Copy uses structure-function-safe phrasing and is checked against the
// compliance guard at module load — unsafe seed copy fails the build by design.

import { getSupplement } from "../supplements";
import { auditCopy, CONSULT_DOCTOR, STANDARD_DISCLAIMER } from "./compliance";
import { resolveProductImage } from "./images";
import { buildOffers, rankOffers } from "./retailers";
import type {
  HealthComplianceNote,
  ResolvedProduct,
  VitaminProduct,
} from "./types";

const NOW = "2026-06-22T00:00:00.000Z";

function product(p: Omit<VitaminProduct, "createdAt" | "updatedAt" | "imageId">): VitaminProduct {
  return { ...p, imageId: `${p.id}__placeholder`, createdAt: NOW, updatedAt: NOW };
}

export const SEED_PRODUCTS: VitaminProduct[] = [
  product({
    id: "vitamin-d3",
    slug: "vitamin-d3",
    name: "Vitamin D3",
    brand: null,
    category: "vitamin",
    form: "softgel",
    strengthLabel: "2000 IU",
    countLabel: "120 softgels",
    descriptionShort:
      "Commonly used to support everyday bone, muscle, and immune health. Labels typically list 2000 IU per softgel.",
    evidenceNotes:
      "Strong evidence tier in the Apex engine; one of the most widely studied supplements.",
    warningNotes:
      "Fat-soluble — take with a meal. Skip high doses with hypercalcemia or sarcoidosis without clinician oversight.",
    engineSupplementId: "vitamin-d3",
  }),
  product({
    id: "omega-3",
    slug: "omega-3-fish-oil",
    name: "Omega-3 Fish Oil (EPA/DHA)",
    brand: null,
    category: "omega",
    form: "softgel",
    strengthLabel: "1000 mg (EPA+DHA)",
    countLabel: "180 softgels",
    descriptionShort:
      "Commonly taken to support heart and brain health. Labels list combined EPA + DHA per serving.",
    evidenceNotes:
      "Strong evidence tier in the Apex engine. Algae-based versions exist for plant-based diets.",
    warningNotes:
      "Talk to a clinician first if you take anticoagulants or have a bleeding disorder.",
    engineSupplementId: "omega-3",
  }),
  product({
    id: "magnesium-glycinate",
    slug: "magnesium-glycinate",
    name: "Magnesium Glycinate",
    brand: null,
    category: "mineral",
    form: "capsule",
    strengthLabel: "400 mg elemental",
    countLabel: "120 capsules",
    descriptionShort:
      "A gentle, well-absorbed magnesium form commonly used to support sleep and relaxation.",
    evidenceNotes:
      "Strong evidence tier in the Apex engine; the glycinate form is easier on digestion.",
    warningNotes:
      "Keep 4+ hours from caffeine. Use caution with severe kidney impairment.",
    engineSupplementId: "magnesium-glycinate",
  }),
  product({
    id: "creatine",
    slug: "creatine-monohydrate",
    name: "Creatine Monohydrate",
    brand: null,
    category: "amino",
    form: "powder",
    strengthLabel: "5 g per serving",
    countLabel: "60 servings",
    descriptionShort:
      "The most-studied performance compound, commonly used to support strength and lean mass.",
    evidenceNotes:
      "Strong evidence tier in the Apex engine across performance and cognition.",
    warningNotes:
      "Drink water. Talk to a clinician first with chronic kidney disease.",
    engineSupplementId: "creatine",
  }),
  product({
    id: "b12",
    slug: "vitamin-b12-methylcobalamin",
    name: "Vitamin B12 (Methylcobalamin)",
    brand: null,
    category: "vitamin",
    form: "lozenge",
    strengthLabel: "1000 mcg",
    countLabel: "100 lozenges",
    descriptionShort:
      "Commonly used to support energy and nervous-system health, especially on plant-based diets.",
    evidenceNotes:
      "Strong evidence tier in the Apex engine; a priority for vegan and vegetarian diets.",
    warningNotes:
      "Generally well tolerated. Persistent fatigue warrants a blood test, not just a supplement.",
    engineSupplementId: "b12",
  }),
];

// Build-time compliance guard: if any seed copy ever trips a blocked claim,
// the module throws and the build fails. Safe copy is a hard precondition.
const SEED_ISSUES = SEED_PRODUCTS.flatMap((p) =>
  auditCopy({
    [`${p.id}.descriptionShort`]: p.descriptionShort,
    [`${p.id}.evidenceNotes`]: p.evidenceNotes,
    [`${p.id}.warningNotes`]: p.warningNotes,
  }),
);
if (SEED_ISSUES.length > 0) {
  throw new Error(
    `Commerce seed copy contains blocked medical claims: ${JSON.stringify(SEED_ISSUES)}`,
  );
}

function complianceNotes(p: VitaminProduct): HealthComplianceNote[] {
  const notes: HealthComplianceNote[] = [
    { productId: p.id, noteType: "disclaimer", body: STANDARD_DISCLAIMER, sourceUrl: null, lastVerifiedAt: NOW },
    { productId: p.id, noteType: "dosage_label", body: `Label: ${p.strengthLabel}, ${p.countLabel}. Follow the directions on the bottle.`, sourceUrl: null, lastVerifiedAt: NOW },
    { productId: p.id, noteType: "consult_doctor", body: CONSULT_DOCTOR, sourceUrl: null, lastVerifiedAt: NOW },
  ];
  if (p.warningNotes) {
    notes.push({ productId: p.id, noteType: "warning", body: p.warningNotes, sourceUrl: null, lastVerifiedAt: NOW });
  }
  // Link the evidence note back to the engine's PubMed example when available.
  if (p.engineSupplementId) {
    try {
      const entry = getSupplement(p.engineSupplementId);
      if (entry.pubmedExample) {
        notes.push({
          productId: p.id,
          noteType: "source_note",
          body: `Apex evidence tier: ${entry.evidenceTier}. Example reference: ${entry.pubmedExample}.`,
          sourceUrl: null,
          lastVerifiedAt: NOW,
        });
      }
    } catch {
      /* unknown engine id — skip the source note */
    }
  }
  return notes;
}

/** Resolve a single product into its renderable shape (offers, image, notes). */
export function resolveProduct(p: VitaminProduct): ResolvedProduct {
  const { ordered, bestPriceOfferId } = rankOffers(buildOffers(p));
  return {
    product: p,
    image: resolveProductImage(p),
    offers: ordered,
    compliance: complianceNotes(p),
    bestPriceOfferId,
  };
}

/** All seed products, fully resolved. */
export function getResolvedProducts(): ResolvedProduct[] {
  return SEED_PRODUCTS.map(resolveProduct);
}

/** Resolve one product by slug, or null. */
export function getResolvedProductBySlug(slug: string): ResolvedProduct | null {
  const p = SEED_PRODUCTS.find((x) => x.slug === slug);
  return p ? resolveProduct(p) : null;
}
