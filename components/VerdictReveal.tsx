"use client";

import { useEffect, useState } from "react";

const CHAR_DELAY_MS = 35;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function VerdictReveal({ text }: { text: string }) {
  const [shown, setShown] = useState<string>("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(text);
      setDone(true);
      return;
    }
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      window.setTimeout(tick, CHAR_DELAY_MS);
    };
    setShown("");
    setDone(false);
    window.setTimeout(tick, CHAR_DELAY_MS);
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <p
      className="font-serif text-2xl sm:text-3xl leading-snug text-paper"
      data-state={done ? "done" : "revealing"}
      aria-live="polite"
    >
      <span className="text-lime">→</span>{" "}
      <span className="italic">{shown}</span>
    </p>
  );
}
