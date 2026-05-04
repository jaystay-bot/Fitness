import { spawn } from "node:child_process";
import path from "node:path";

import type { LabValues, ParsedLabResponse } from "./types";

const PYTHON = process.env.PYTHON_BIN ?? "python3";
const SCRIPT = path.resolve(process.cwd(), "python", "parse_labs.py");

const PHYSIOLOGICAL_RANGES: Record<keyof LabValues, [number, number]> = {
  ferritin_ng_ml: [1, 2000],
  vitamin_d_25oh_ng_ml: [1, 200],
  b12_pg_ml: [50, 4000],
  magnesium_mg_dl: [0.5, 5],
  total_cholesterol_mg_dl: [60, 400],
  hdl_mg_dl: [10, 150],
  ldl_mg_dl: [10, 300],
  triglycerides_mg_dl: [20, 1500],
  glucose_fasting_mg_dl: [40, 500],
  hba1c_pct: [3, 18],
};

function validate(values: LabValues): LabValues {
  const out: LabValues = {};
  for (const [key, range] of Object.entries(PHYSIOLOGICAL_RANGES) as [
    keyof LabValues,
    [number, number],
  ][]) {
    const v = values[key];
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    if (v < range[0] || v > range[1]) continue;
    out[key] = v;
  }
  return out;
}

export interface ParseOptions {
  /**
   * Hard cap on how long the Python parser may run. Cold-start of pdfplumber
   * runs ~1–2s on small PDFs; we allow 15s for large multi-page reports.
   */
  timeoutMs?: number;
}

export async function parseLabPdf(
  pdfBytes: Buffer,
  options: ParseOptions = {},
): Promise<ParsedLabResponse> {
  const timeoutMs = options.timeoutMs ?? 15_000;
  return await new Promise<ParsedLabResponse>((resolve) => {
    let proc;
    try {
      proc = spawn(PYTHON, [SCRIPT], {
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch {
      resolve({ ok: false, reason: "service_unavailable" });
      return;
    }

    let resolved = false;
    const timeout = setTimeout(() => {
      if (resolved) return;
      try {
        proc.kill("SIGKILL");
      } catch {
        /* ignore */
      }
      resolved = true;
      resolve({ ok: false, reason: "timeout" });
    }, timeoutMs);

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => {
      stdout += d.toString("utf-8");
    });
    proc.stderr.on("data", (d: Buffer) => {
      stderr += d.toString("utf-8");
    });
    proc.on("error", () => {
      if (resolved) return;
      clearTimeout(timeout);
      resolved = true;
      resolve({ ok: false, reason: "service_unavailable" });
    });
    proc.on("close", (code: number | null) => {
      if (resolved) return;
      clearTimeout(timeout);
      resolved = true;
      if (code !== 0) {
        resolve({
          ok: false,
          reason: stderr.slice(0, 200) || `exit_${code ?? "?"}`,
        });
        return;
      }
      try {
        const parsed = JSON.parse(stdout) as ParsedLabResponse;
        if (parsed.ok && parsed.values) {
          parsed.values = validate(parsed.values);
        }
        resolve(parsed);
      } catch {
        resolve({ ok: false, reason: "invalid_parser_output" });
      }
    });

    proc.stdin.write(pdfBytes);
    proc.stdin.end();
  });
}
