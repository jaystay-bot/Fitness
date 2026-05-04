import { spawn } from "node:child_process";
import path from "node:path";

import type { ScanIdentification } from "./types";

const PYTHON = process.env.PYTHON_BIN ?? "python3";
const SCRIPT = path.resolve(process.cwd(), "python", "scan_bottle.py");

export interface ScanOptions {
  timeoutMs?: number;
}

export async function scanBottleImage(
  imageBytes: Buffer,
  options: ScanOptions = {},
): Promise<ScanIdentification> {
  const timeoutMs = options.timeoutMs ?? 20_000;
  return await new Promise<ScanIdentification>((resolve) => {
    let proc;
    try {
      proc = spawn(PYTHON, [SCRIPT], { stdio: ["pipe", "pipe", "pipe"] });
    } catch {
      resolve({
        ok: false,
        identified: null,
        dose_mg: null,
        raw_text: "",
        confidence: 0,
        reason: "service_unavailable",
      });
      return;
    }

    let resolved = false;
    const timeout = setTimeout(() => {
      if (resolved) return;
      try { proc.kill("SIGKILL"); } catch { /* ignore */ }
      resolved = true;
      resolve({
        ok: false,
        identified: null,
        dose_mg: null,
        raw_text: "",
        confidence: 0,
        reason: "timeout",
      });
    }, timeoutMs);

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString("utf-8"); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString("utf-8"); });
    proc.on("error", () => {
      if (resolved) return;
      clearTimeout(timeout);
      resolved = true;
      resolve({
        ok: false,
        identified: null,
        dose_mg: null,
        raw_text: "",
        confidence: 0,
        reason: "service_unavailable",
      });
    });
    proc.on("close", (code: number | null) => {
      if (resolved) return;
      clearTimeout(timeout);
      resolved = true;
      if (code !== 0) {
        resolve({
          ok: false,
          identified: null,
          dose_mg: null,
          raw_text: "",
          confidence: 0,
          reason: stderr.slice(0, 200) || `exit_${code ?? "?"}`,
        });
        return;
      }
      try {
        const parsed = JSON.parse(stdout) as ScanIdentification;
        resolve(parsed);
      } catch {
        resolve({
          ok: false,
          identified: null,
          dose_mg: null,
          raw_text: "",
          confidence: 0,
          reason: "invalid_scanner_output",
        });
      }
    });

    proc.stdin.write(imageBytes);
    proc.stdin.end();
  });
}
