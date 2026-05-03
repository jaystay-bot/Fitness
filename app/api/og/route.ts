import { ImageResponse } from "next/og";
import { createElement as h, type CSSProperties, type ReactNode } from "react";

export const runtime = "edge";

const INK = "#0A0A0A";
const PAPER = "#FAFAF7";
const LIME = "#D4FF3A";
const CLINICAL = "#FF6B35";

const DEFAULT_VERDICT = "Your supplement stack, written by the science.";
const DEFAULT_PICKS = [
  "Creatine monohydrate",
  "Vitamin D3",
  "Magnesium glycinate",
];

function safeDecodeBase64Url(value: string | null): string | null {
  if (!value) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding =
      padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const decoded = atob(padded + padding);
    const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return null;
  }
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function div(style: CSSProperties, children?: ReactNode) {
  return h("div", { style }, children);
}

function span(style: CSSProperties, children?: ReactNode) {
  return h("span", { style }, children);
}

const baseStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: INK,
  color: PAPER,
  padding: "64px 72px",
  fontFamily: "system-ui, sans-serif",
};

const eyebrowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: 18,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: LIME,
  fontFamily: "monospace",
};

const headlineStyle: CSSProperties = {
  display: "flex",
  marginTop: 32,
  fontSize: 56,
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  color: PAPER,
  fontWeight: 500,
  maxWidth: 1000,
};

const picksWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginTop: 36,
  gap: 8,
  fontFamily: "monospace",
  fontSize: 22,
  color: PAPER,
  opacity: 0.85,
};

const pickRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const footerStyle: CSSProperties = {
  marginTop: "auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
};

const wordmarkColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontFamily: "monospace",
};

const wordmarkStyle: CSSProperties = {
  color: LIME,
  fontSize: 28,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontWeight: 700,
};

const taglineStyle: CSSProperties = {
  fontSize: 14,
  color: PAPER,
  opacity: 0.5,
  marginTop: 6,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const tierStripStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  fontFamily: "monospace",
};

const tierBaseStyle: CSSProperties = {
  padding: "5px 12px",
  borderRadius: 4,
  fontSize: 14,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
  display: "flex",
};

const tierStrongStyle: CSSProperties = {
  ...tierBaseStyle,
  background: LIME,
  color: INK,
  padding: "6px 12px",
};

const tierModerateStyle: CSSProperties = {
  ...tierBaseStyle,
  border: `1px solid ${PAPER}`,
  color: PAPER,
};

const tierEmergingStyle: CSSProperties = {
  ...tierBaseStyle,
  border: `1px solid ${CLINICAL}`,
  color: CLINICAL,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const decodedVerdict = safeDecodeBase64Url(searchParams.get("v"));
  const verdict = truncate(
    (decodedVerdict ?? DEFAULT_VERDICT).trim() || DEFAULT_VERDICT,
    80,
  );

  const sParam = searchParams.get("s");
  const supplements = (
    sParam
      ? sParam
          .split(",")
          .map((part) => decodeURIComponent(part).trim())
          .filter(Boolean)
      : DEFAULT_PICKS
  ).slice(0, 3);

  const indexStyle: CSSProperties = { color: LIME, display: "flex" };
  const nameStyle: CSSProperties = { display: "flex" };

  const picks = supplements.map((name, i) =>
    h(
      "div",
      { key: i, style: pickRowStyle },
      h("span", { style: indexStyle }, String(i + 1).padStart(2, "0")),
      h("span", { style: nameStyle }, name),
    ),
  );

  const tree = div(baseStyle, [
    h("div", { key: "eyebrow", style: eyebrowStyle }, "Evidence-backed protocol"),
    h("div", { key: "headline", style: headlineStyle }, verdict),
    h("div", { key: "picks", style: picksWrapStyle }, picks),
    h(
      "div",
      { key: "footer", style: footerStyle },
      h(
        "div",
        { key: "wordmark", style: wordmarkColStyle },
        span(wordmarkStyle, "Apex Protocol"),
        span(taglineStyle, "apex protocol · evidence per pick"),
      ),
      h(
        "div",
        { key: "tiers", style: tierStripStyle },
        span(tierStrongStyle, "Strong"),
        span(tierModerateStyle, "Moderate"),
        span(tierEmergingStyle, "Emerging"),
      ),
    ),
  ]);

  return new ImageResponse(tree, {
    width: 1200,
    height: 630,
  });
}
