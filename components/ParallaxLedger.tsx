"use client";

import { useEffect, useRef, useState } from "react";

const SPEED = 0.6;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ParallaxLedger({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReduced(true);
      return;
    }
    const wrap = wrapRef.current;
    const inner = innerRef.current;
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
  }, []);

  return (
    <div ref={wrapRef} className="will-change-transform">
      <div ref={innerRef} style={reduced ? undefined : { transform: "translate3d(0,0,0)" }}>
        {children}
      </div>
    </div>
  );
}
