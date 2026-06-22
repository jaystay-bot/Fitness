import { BadgeCheck, ExternalLink, MapPin, Truck } from "lucide-react";

import {
  PRICE_DISCLAIMER,
  ROUTING_DISCLOSURE,
} from "@/lib/commerce/compliance";
import { RETAILERS } from "@/lib/commerce/retailers";
import type { Retailer, RetailOffer, ResolvedProduct } from "@/lib/commerce/types";

function retailerName(r: Retailer): string {
  return r === "brand" ? "Official brand" : RETAILERS[r].name;
}

function formatPrice(cents: number | null): string {
  if (cents == null) return "Check price";
  return `$${(cents / 100).toFixed(2)}`;
}

const LINK_REL = "noopener noreferrer nofollow sponsored";

function OfferRow({
  offer,
  isBest,
}: {
  offer: RetailOffer;
  isBest: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-paper font-medium">
            {retailerName(offer.retailer)}
          </span>
          {isBest ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime/15 text-lime px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider">
              <BadgeCheck className="w-3 h-3" aria-hidden />
              Best price
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-paper/50">
          {offer.shippingAvailable ? (
            <span className="inline-flex items-center gap-1">
              <Truck className="w-3 h-3" aria-hidden /> Ship
            </span>
          ) : null}
          {offer.pickupAvailable ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden /> Pickup
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`font-mono text-xs ${offer.priceCents == null ? "text-paper/45" : "text-gold"}`}
        >
          {formatPrice(offer.priceCents)}
        </span>
        <a
          href={offer.retailerProductUrl}
          target="_blank"
          rel={LINK_REL}
          className="inline-flex items-center gap-1.5 rounded-full border border-paper/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-paper/85 transition hover:border-lime hover:text-paper"
        >
          Buy
          <ExternalLink className="w-3 h-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export function BuyBox({ resolved }: { resolved: ResolvedProduct }) {
  const { offers, bestPriceOfferId } = resolved;
  const primary = offers[0];
  const rest = offers.slice(1);

  return (
    <div className="flex flex-col gap-3">
      {/* Primary CTA — the top-ranked retailer */}
      {primary ? (
        <a
          href={primary.retailerProductUrl}
          target="_blank"
          rel={LINK_REL}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 text-ink font-semibold tracking-wide shadow-glow transition hover:brightness-105 hover:gap-3"
        >
          Buy at {retailerName(primary.retailer)}
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </a>
      ) : null}

      {/* Compare drawer — zero-JS via <details> */}
      {rest.length > 0 ? (
        <details className="group rounded-xl border border-paper/10 bg-ink/40">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-paper/70 hover:text-paper">
            <span>Compare {offers.length} retailers</span>
            <span className="text-paper/40 group-open:hidden">Show ▾</span>
            <span className="text-paper/40 hidden group-open:inline">Hide ▴</span>
          </summary>
          <div className="px-4 pb-2 divide-y divide-paper/8">
            <OfferRow offer={primary} isBest={primary.id === bestPriceOfferId} />
            {rest.map((o) => (
              <OfferRow key={o.id} offer={o} isBest={o.id === bestPriceOfferId} />
            ))}
          </div>
        </details>
      ) : null}

      <div className="flex flex-col gap-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-paper/40">
          {ROUTING_DISCLOSURE}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-paper/35">
          {PRICE_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
