import type { ProductImage, VitaminProduct } from "@/lib/commerce/types";

// Premium SVG bottle illustration used when no license-cleared product photo is
// available. It is deliberately stylized and labeled "Illustration" so it never
// implies a real product packshot. When a verified bottle image exists
// (image.imageType === "bottle" with a usable src), render that instead.

const FORM_LABEL: Record<VitaminProduct["form"], string> = {
  capsule: "Capsule",
  softgel: "Softgel",
  tablet: "Tablet",
  gummy: "Gummy",
  powder: "Powder",
  liquid: "Liquid",
  lozenge: "Lozenge",
  spray: "Spray",
};

export function BottleVisual({
  product,
  image,
  className = "",
}: {
  product: VitaminProduct;
  image: ProductImage;
  className?: string;
}) {
  const realSrc =
    image.imageType === "bottle" && image.lastVerifiedAt != null
      ? image.localPath ?? image.imageUrl
      : null;

  if (realSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={realSrc}
        alt={`${product.name} product photo`}
        className={`object-contain ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`relative grid place-items-center ${className}`}
      role="img"
      aria-label={`${product.name} illustration`}
    >
      <svg viewBox="0 0 120 160" fill="none" className="h-full w-auto">
        <defs>
          <linearGradient id={`g-${product.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2563EB" stopOpacity="0.16" />
            <stop offset="1" stopColor="#2563EB" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {/* cap — vibrant amber */}
        <rect x="44" y="10" width="32" height="16" rx="4" fill="#F5C438" fillOpacity="0.95" />
        <rect x="40" y="22" width="40" height="8" rx="3" fill="#F5C438" fillOpacity="0.6" />
        {/* body */}
        <rect x="34" y="30" width="52" height="116" rx="12" fill={`url(#g-${product.id})`} stroke="#2563EB" strokeOpacity="0.55" strokeWidth="1.5" />
        {/* label band */}
        <rect x="34" y="74" width="52" height="48" rx="4" fill="#FFFFFF" stroke="#0F1B2D" strokeOpacity="0.12" />
        <text x="60" y="92" textAnchor="middle" fontSize="9" fill="#0F1B2D" fillOpacity="0.9" fontFamily="ui-monospace, monospace">
          {product.strengthLabel.slice(0, 12)}
        </text>
        <text x="60" y="106" textAnchor="middle" fontSize="7" fill="#2563EB" fillOpacity="0.95" fontFamily="ui-monospace, monospace" letterSpacing="0.5">
          {FORM_LABEL[product.form].toUpperCase()}
        </text>
        <line x1="42" y1="114" x2="78" y2="114" stroke="#047857" strokeOpacity="0.55" strokeWidth="1" />
      </svg>
      <span className="absolute bottom-1 right-1 font-mono text-[8px] uppercase tracking-wider text-paper/35">
        Illustration
      </span>
    </div>
  );
}
