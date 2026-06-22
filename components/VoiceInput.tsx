"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, X } from "lucide-react";

import { createRecognizer, isVoiceSupported, type VoiceRecognizer } from "@/lib/voice";
import { parseVoiceInput } from "@/lib/voiceParser";
import type { UserInput } from "@/lib/types";

const FIELD_LABEL: Record<keyof UserInput, string> = {
  age: "Age",
  sex: "Sex",
  heightCm: "Height (cm)",
  weightKg: "Weight (kg)",
  activityLevel: "Activity",
  sleepHours: "Sleep (hrs)",
  primaryGoal: "Primary goal",
  dietPattern: "Diet pattern",
  caffeineCupsPerDay: "Coffee (cups/day)",
  alcoholDrinksPerWeek: "Alcohol (drinks/wk)",
  symptomToFix: "Symptom to fix",
  inflammation: "Inflammation",
};

const REQUIRED_FOR_SUBMIT: (keyof UserInput)[] = [
  "age", "sex", "heightCm", "weightKg", "primaryGoal", "dietPattern",
];

export function VoiceInput({
  onCommit,
  onClose,
}: {
  onCommit: (partial: Partial<UserInput>) => void;
  onClose: () => void;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognizerRef = useRef<VoiceRecognizer | null>(null);

  useEffect(() => {
    setSupported(isVoiceSupported());
    return () => {
      recognizerRef.current?.stop();
    };
  }, []);

  function start() {
    setError(null);
    setTranscript("");
    setInterim("");
    const r = createRecognizer({
      onTranscript: (t, isFinal) => {
        if (isFinal) {
          setTranscript((prev) => (prev ? prev + " " : "") + t);
          setInterim("");
        } else {
          setInterim(t);
        }
      },
      onEnd: () => setListening(false),
      onError: (e) => {
        setError(`Speech recognition error: ${e}`);
        setListening(false);
      },
    });
    if (!r) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    recognizerRef.current = r;
    r.start();
    setListening(true);
  }

  function stop() {
    recognizerRef.current?.stop();
    setListening(false);
  }

  const result = transcript ? parseVoiceInput(transcript) : null;
  const ready =
    !!result &&
    REQUIRED_FOR_SUBMIT.every((k) => result.partial[k] !== undefined);

  if (supported === false) {
    return (
      <div
        role="dialog"
        aria-label="Voice input"
        className="border border-paper/20 rounded-lg p-5 bg-ink flex flex-col gap-3"
      >
        <header className="flex items-baseline justify-between">
          <h3 className="font-serif text-xl text-paper">Voice input not supported</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close voice input"
            className="text-paper/60 hover:text-paper"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </header>
        <p className="text-sm text-paper/75">
          Your browser does not expose the Web Speech API. Use the standard
          form below — every field is one tap away.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="self-start font-mono text-[11px] uppercase tracking-wider bg-lime text-ink rounded-md px-3 py-2 hover:brightness-95"
        >
          Use the standard form
        </button>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Voice input"
      className="border border-paper/20 rounded-lg p-5 bg-ink flex flex-col gap-3"
    >
      <header className="flex items-baseline justify-between">
        <h3 className="font-serif text-xl text-paper">Speak your protocol</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close voice input"
          className="text-paper/60 hover:text-paper"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </header>

      <p className="text-sm text-paper/75 leading-snug">
        Tap the mic and speak naturally — age, sex, height, weight, goal,
        diet, caffeine, alcohol, and one symptom you want to fix.
      </p>

      <div className="flex flex-wrap gap-3">
        {!listening ? (
          <button
            type="button"
            onClick={start}
            aria-label="Start listening"
            className="inline-flex items-center gap-2 bg-lime text-ink font-semibold uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:brightness-95"
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            Start
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop listening"
            className="inline-flex items-center gap-2 bg-clinical text-ink font-semibold uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:brightness-95"
          >
            <MicOff className="w-4 h-4" aria-hidden="true" />
            Stop
          </button>
        )}
      </div>

      <div className="border border-paper/15 rounded-md p-3 min-h-[4em] text-sm text-paper/85">
        {transcript || (
          <span className="text-paper/40 italic">
            {listening ? "Listening…" : "Tap Start to begin."}
          </span>
        )}
        {interim ? (
          <span className="text-paper/50 italic"> {interim}</span>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="text-[11px] font-mono uppercase tracking-wider text-clinical"
        >
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
            Extracted ({result.matched.length} / {result.matched.length + result.missing.length})
          </span>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {result.matched.map((k) => (
              <li key={k} className="flex justify-between gap-2">
                <span className="font-mono text-paper/60 uppercase tracking-wider text-[10px]">
                  {FIELD_LABEL[k]}
                </span>
                <span className="text-paper/90 font-mono">
                  {String(result.partial[k])}
                </span>
              </li>
            ))}
          </ul>
          {result.missing.length > 0 ? (
            <p className="text-[11px] font-mono uppercase tracking-wider text-paper/60">
              Missing — fill manually after you submit: {result.missing.map((k) => FIELD_LABEL[k]).join(", ")}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => result && onCommit(result.partial)}
            disabled={!ready}
            aria-label="Submit voice protocol"
            className="self-start inline-flex items-center justify-center bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-3 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {ready ? "Submit protocol" : "Need core fields"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
