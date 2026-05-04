"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";

import { FeedbackForm } from "./FeedbackForm";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Outside-click and Escape-key dismiss.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      if (panelRef.current && target && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open feedback widget"
          className="fixed z-50 bottom-6 right-6 inline-flex items-center gap-2 bg-lime text-ink font-mono uppercase tracking-wider text-xs rounded-full px-3.5 py-2.5 shadow-lg hover:brightness-95"
          style={{
            paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))",
            marginBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          Feedback
        </button>
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Feedback panel"
          aria-modal="false"
          className="fixed z-50 bg-ink border border-paper/20 rounded-lg shadow-xl flex flex-col gap-4 p-4 sm:p-5 inset-x-4 bottom-4 max-h-[85vh] overflow-y-auto md:inset-auto md:bottom-6 md:right-6 md:w-[360px]"
        >
          <header className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-lg text-paper">Send feedback</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close feedback panel"
              className="text-paper/60 hover:text-paper"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </header>
          <FeedbackForm />
        </div>
      ) : null}
    </>
  );
}
