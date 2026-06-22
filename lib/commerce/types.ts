// N=028: Commerce data foundation for the vitamin buy-box system.
//
// These types are the contract future agents extend (add products, retailers,
// images, offers) WITHOUT touching UI. Hard rules baked into the shapes:
//   - prices are optional + verifiable (price_cents?: number, last_verified_at)
//     so the UI can show "Check price" instead of a fabricated number;
//   - offers carry a real outbound retailer URL, never an invented SKU;
//   - images carry full licensing/attribution metadata.
//
// Nothing here performs I/O. Everything is pure, serializable data.

export type ProductForm =
  | "capsule"
  | "softgel"
  | "tablet"
  | "gummy"
  | "powder"
  | "liquid"
  | "lozenge"
  | "spray";

export type ProductCategory =
  | "vitamin"
  | "mineral"
  | "omega"
  | "amino"
  | "adaptogen"
  | "probiotic"
  | "electrolyte"
  | "other";

// The retailers we support outbound links to. Extend this union to add more.
export type Retailer =
  | "amazon"
  | "walmart"
  | "walgreens"
  | "cvs"
  | "target"
  | "costco"
  | "iherb"
  | "gnc"
  | "brand";

export type AvailabilityStatus =
  | "unknown" // default — we have not verified stock; UI shows "Check price"
  | "in_stock"
  | "out_of_stock"
  | "limited";

export type ImageType =
  | "bottle"
  | "lifestyle"
  | "placeholder"
  | "retailer_reference";

export type LicenseType =
  | "CC0"
  | "CC-BY"
  | "CC-BY-SA"
  | "Unsplash"
  | "Pexels"
  | "Pixabay"
  | "public-domain"
  | "placeholder"; // app-rendered SVG, no external license needed

export type ComplianceNoteType =
  | "disclaimer"
  | "warning"
  | "dosage_label"
  | "consult_doctor"
  | "source_note";

export interface ProductImage {
  id: string;
  productId: string;
  imageType: ImageType;
  imageSource: string; // e.g. "Wikimedia Commons", "Unsplash", "app-svg"
  imageUrl: string | null; // remote source URL, or null for app-rendered placeholder
  localPath: string | null; // set only if downloaded + license-cleared
  licenseType: LicenseType;
  attributionRequired: boolean;
  attributionText: string | null;
  lastVerifiedAt: string | null; // ISO; null = not yet verified (e.g. no-egress build)
}

export interface RetailOffer {
  id: string;
  productId: string;
  retailer: Retailer;
  retailerProductUrl: string; // real outbound URL (search or product). Never empty.
  priceCents: number | null; // null → UI shows "Check price". Never fabricated.
  currency: "USD";
  availabilityStatus: AvailabilityStatus;
  shippingAvailable: boolean;
  pickupAvailable: boolean;
  locationSensitive: boolean; // pickup/local availability varies by store
  lastVerifiedAt: string | null; // ISO; null = price/stock not verified
  affiliateReady: boolean; // retailer supports an affiliate program we can wire later
  isDirectBrand: boolean; // links to the official brand site
  priorityRank: number; // lower = surfaced first when no verified price ranks it
}

export interface HealthComplianceNote {
  productId: string;
  noteType: ComplianceNoteType;
  body: string;
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
}

export interface VitaminProduct {
  id: string;
  slug: string;
  name: string;
  brand: string | null; // null = "multiple brands" (we route to a search, not a SKU)
  category: ProductCategory;
  form: ProductForm;
  strengthLabel: string; // exactly as a label would read, e.g. "2000 IU"
  countLabel: string; // e.g. "120 softgels"
  descriptionShort: string; // allowed phrasing only ("commonly used for ...")
  evidenceNotes: string;
  warningNotes: string;
  // Optional link back to the recommendation engine's supplement id, so a
  // recommended pick can resolve to a buyable product.
  engineSupplementId?: string;
  imageId: string;
  createdAt: string;
  updatedAt: string;
}

// A fully-resolved product ready to render: the product plus its offers
// (cheapest-first where verifiable), image, and compliance notes.
export interface ResolvedProduct {
  product: VitaminProduct;
  image: ProductImage;
  offers: RetailOffer[];
  compliance: HealthComplianceNote[];
  /** The offer flagged "best visible price", or null when nothing is verified. */
  bestPriceOfferId: string | null;
}
