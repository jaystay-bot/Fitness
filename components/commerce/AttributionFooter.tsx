import { LICENSED_IMAGE_REFS } from "@/lib/commerce/images";

// Surfaces image-licensing/attribution metadata. When all product visuals are
// app-rendered illustrations (the current default), this states that plainly and
// lists the free-imagery sources queued for future, license-verified use.

export function AttributionFooter() {
  return (
    <footer className="mt-12 border-t border-paper/10 pt-6 flex flex-col gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/45">
        Imagery & attribution
      </span>
      <p className="text-xs text-paper/55 max-w-2xl leading-snug">
        Product visuals on this page are app-rendered illustrations, clearly
        labeled — not real product photos. Licensed free imagery is sourced only
        from the references below, with attribution recorded and verified before
        use.
      </p>
      <ul className="flex flex-col gap-1">
        {LICENSED_IMAGE_REFS.map((ref) => (
          <li
            key={ref.id}
            className="font-mono text-[10px] text-paper/45 flex flex-wrap items-center gap-x-2"
          >
            <span className="text-paper/60">{ref.imageSource}</span>
            <span>· {ref.licenseType}</span>
            {ref.attributionText ? <span>· {ref.attributionText}</span> : null}
            <span>· verified: {ref.lastVerifiedAt ?? "pending"}</span>
          </li>
        ))}
      </ul>
    </footer>
  );
}
