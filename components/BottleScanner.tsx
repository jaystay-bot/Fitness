"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";

import type { ScanMatch, SupplementPick } from "@/lib/types";

import { ScanResult } from "./ScanResult";

interface IdentifyResponse {
  ok: boolean;
  identified: string | null;
  dose_mg: number | null;
  confidence: number;
  matched_protocol_pick: string | null;
  error?: string;
}

function pickIdentifiedId(name: string): string {
  const lower = name.toLowerCase();
  if (lower.startsWith("creatine")) return "creatine";
  if (lower.startsWith("vitamin d3")) return "vitamin-d3";
  if (lower.startsWith("magnesium")) return "magnesium-glycinate";
  if (lower.startsWith("omega-3")) return "omega-3";
  if (lower.startsWith("whey") || lower.startsWith("plant protein")) return "protein";
  if (lower.includes("caffeine") && lower.includes("theanine")) return "caffeine-theanine";
  if (lower.startsWith("rhodiola")) return "rhodiola";
  if (lower.startsWith("ashwagandha")) return "ashwagandha";
  if (lower.startsWith("zinc")) return "zinc";
  if (lower.startsWith("b12")) return "b12";
  if (lower.startsWith("iron")) return "iron";
  if (lower.includes("probiotic")) return "probiotic";
  if (lower.startsWith("electrolytes")) return "electrolytes";
  if (lower.startsWith("melatonin")) return "melatonin";
  if (lower.startsWith("hmb")) return "hmb";
  if (lower.startsWith("beta-alanine")) return "beta-alanine";
  if (lower.startsWith("citrulline")) return "citrulline-malate";
  if (lower.startsWith("l-tyrosine")) return "tyrosine";
  return "";
}

function classify(
  identified: string | null,
  confidence: number,
  matchedName: string | null,
): { match: ScanMatch; message: string } {
  if (!identified || confidence < 0.5) {
    return {
      match: "unknown",
      message:
        "We could not confidently identify this bottle. Try a sharper photo of the front label, or upload the supplement facts panel.",
    };
  }
  if (matchedName) {
    return {
      match: "match",
      message:
        "This bottle matches what your protocol recommends. You are good to start.",
    };
  }
  return {
    match: "mismatch",
    message:
      "This compound is not in your current protocol. Consider returning it or running a fresh recommendation that includes it.",
  };
}

export function BottleScanner({ picks }: { picks: SupplementPick[] }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<IdentifyResponse | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
    };
  }, [stream]);

  async function startCamera() {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch {
      setError("Camera permission denied. Use the file upload instead.");
    }
  }

  async function captureFromVideo() {
    if (!videoRef.current || !stream) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob((b) => r(b), "image/jpeg", 0.85),
    );
    if (!blob) return;
    const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
    await uploadImage(file);
  }

  async function uploadImage(file: File) {
    setBusy(true);
    setError(null);
    setResponse(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append(
        "protocol",
        JSON.stringify(
          picks.map((p) => ({ identified: pickIdentifiedId(p.name), name: p.name })),
        ),
      );
      const res = await fetch("/api/scanner/identify", { method: "POST", body: fd });
      if (res.status === 503) {
        const data = (await res.json().catch(() => ({}))) as { reason?: string };
        throw new Error(
          "Scanner service is not configured on this deployment.",
        );
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Scan failed (${res.status}).`);
      }
      const data = (await res.json()) as IdentifyResponse;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed.");
    } finally {
      setBusy(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadImage(file);
  }

  const result = response
    ? classify(
        response.identified,
        response.confidence,
        response.matched_protocol_pick,
      )
    : null;

  return (
    <section
      aria-label="Supplement bottle scanner"
      className="border border-paper/15 rounded-lg p-4 sm:p-6 flex flex-col gap-4 min-w-0 overflow-hidden"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap min-w-0">
        <h3 className="font-serif text-xl sm:text-2xl text-paper leading-tight break-words">
          Scan a bottle. Verify what you bought.
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60 shrink-0">
          Pro · Bottle scanner
        </span>
      </div>
      <p className="text-sm text-paper/75 leading-snug">
        Point your camera at the front label. We identify the compound and dose,
        and compare against your current protocol.
      </p>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          type="button"
          onClick={startCamera}
          disabled={busy}
          aria-label="Open camera"
          className="inline-flex items-center gap-2 bg-lime text-ink font-semibold uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:brightness-95 disabled:opacity-60"
        >
          <Camera className="w-4 h-4" aria-hidden="true" />
          Open camera
        </button>
        <label
          htmlFor="bottle-file"
          className="inline-flex items-center gap-2 border border-paper/30 text-paper font-mono uppercase tracking-wider text-xs rounded-md px-3 py-2 cursor-pointer hover:border-lime"
        >
          <ImageIcon className="w-4 h-4" aria-hidden="true" />
          Upload image
          <input
            id="bottle-file"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFileChange}
            disabled={busy}
          />
        </label>
      </div>

      {stream ? (
        <div className="flex flex-col gap-3">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full rounded-md border border-paper/15 bg-ink max-h-[55vh] object-cover"
          />
          <button
            type="button"
            onClick={captureFromVideo}
            disabled={busy}
            aria-label="Capture frame"
            className="self-start inline-flex items-center gap-2 bg-lime text-ink font-semibold uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:brightness-95 disabled:opacity-60"
          >
            {busy ? "Identifying…" : "Capture"}
          </button>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="text-[11px] font-mono uppercase tracking-wider text-clinical"
        >
          {error}
        </p>
      ) : null}

      {result && response ? (
        <ScanResult
          match={result.match}
          identified={response.identified}
          doseMg={response.dose_mg}
          comparedTo={response.matched_protocol_pick}
          message={result.message}
        />
      ) : null}
    </section>
  );
}

