import type { BodySystem } from "./types";

// SVG label-anchor coordinates inside a 0..400 × 0..640 viewBox silhouette.
// Each label is positioned alongside the associated body region. The
// silhouette itself is hand-coded in components/BodyVisualization.tsx.
export const SVG_POSITIONS: Record<BodySystem, { cx: number; cy: number }> = {
  brain: { cx: 200, cy: 60 },
  heart: { cx: 200, cy: 230 },
  liver: { cx: 230, cy: 290 },
  gut: { cx: 200, cy: 340 },
  muscles: { cx: 130, cy: 410 },
  bones: { cx: 270, cy: 480 },
  immune: { cx: 80, cy: 200 },
  skin: { cx: 320, cy: 130 },
};

// Dimensions used by the silhouette renderer.
export const VIEWBOX_WIDTH = 400;
export const VIEWBOX_HEIGHT = 640;
