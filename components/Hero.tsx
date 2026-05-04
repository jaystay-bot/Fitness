"use client";

import { useEffect, useRef, useState } from "react";

import { encodeInput } from "@/lib/slug";
import type { Recommendation, UserInput } from "@/lib/types";
import { AccountMenu } from "./AccountMenu";
import { AssessmentForm } from "./AssessmentForm";
import { EvidenceLedger } from "./EvidenceLedger";
import { ParallaxLedger } from "./ParallaxLedger";
import { ResultCard } from "./ResultCard";

export function Hero() {
  const [result, setResult] = useState<Recommendation | null>(null);
  const [input, setInput] = useState<UserInput | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (result && input && typeof window !== "undefined") {
      const slug = encodeInput(input);
      window.history.replaceState(null, "", `/r/${slug}`);
    }
  }, [result, input]);

  return (
    <section className="px-5 sm:px-8 lg:px-12 pt-8 sm:pt-14 pb-10 max-w-6xl mx-auto w-full">
      <header className="flex justify-end mb-4">
        <AccountMenu />
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-start">
        <div className="flex flex-col gap-5">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-lime">
            Evidence-backed protocol
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
            Your supplement stack,{" "}
            <span className="italic text-lime">written by the science.</span>
          </h1>
          <p className="text-base sm:text-lg text-paper/75 max-w-md">
            Answer nine questions. Get a ranked supplement and nutrition
            protocol with the evidence tier behind every pick. About sixty
            seconds.
          </p>
          <ul className="flex flex-col gap-2 text-sm text-paper/70 max-w-md">
            <li className="flex gap-3">
              <span className="font-mono text-lime">01</span>
              <span>
                Strong / Moderate / Emerging tier on every supplement — no hype.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-lime">02</span>
              <span>
                Catches stack interactions and goal conflicts before you spend a
                dollar.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-lime">03</span>
              <span>
                No login. No email gate. The result loads here, instantly.
              </span>
            </li>
          </ul>
        </div>
        <div className="lg:sticky lg:top-8 flex flex-col">
          <ParallaxLedger>
            <EvidenceLedger />
          </ParallaxLedger>
          <AssessmentForm
            onResult={(rec, used) => {
              setResult(rec);
              setInput(used);
            }}
          />
        </div>
      </div>

      <div ref={resultRef}>
        {result && input ? <ResultCard result={result} input={input} /> : null}
      </div>
    </section>
  );
}
