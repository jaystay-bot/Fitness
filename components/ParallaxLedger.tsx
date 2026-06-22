"use client";

import { useEffect, useRef, useState } from "react";

const SPEED = 0.6;

// Parallax only runs on large screens, where the ledger lives in the sticky
// side column. On stacked mobile/tablet layouts the vertical transform shifts
// the ledger over the hero copy and the text overlaps — so below this width
// the component renders in normal flow with no transform.
const PARALLAX_QUERY = "(min-width: 1024px)";

export function ParallaxLedger({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Decide whether parallax should run, and keep it correct across resizes
  // and reduced-motion changes.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const sizeMql = window.matchMedia(PARALLAX_QUERY);
    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setEnabled(sizeMql.matches && !motionMql.matches);
    evaluate();
    sizeMql.addEventListener("change", evaluate);
    motionMql.addEventListener("change", evaluate);
    return () => {
      sizeMql.removeEventListener("change", evaluate);
      motionMql.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    const inner = innerRef.current;
    if (!enabled) {
      // Clear any leftover transform when parallax is off (e.g. resized down).
      if (inner) inner.style.transform = "";
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap || !inner) return;

    let frame = 0;
    let inView = true;
    let scrollY = window.scrollY;

    const update = () => {
      frame = 0;
      if (!inView) return;
      const rect = wrap.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = -center * (1 - SPEED);
      inner.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (Math.abs(window.scrollY - scrollY) < 1) return;
      scrollY = window.scrollY;
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          inView = e.isIntersecting;
          if (inView && frame === 0) {
            frame = window.requestAnimationFrame(update);
          }
        }
      },
      { threshold: 0 },
    );
    observer.observe(wrap);

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      inner.style.transform = "";
    };
  }, [enabled]);

  return (
    <div ref={wrapRef} className="will-change-transform">
      <div ref={innerRef} style={enabled ? { transform: "translate3d(0,0,0)" } : undefined}>
        {children}
      </div>
    </div>
  );
}
