// Visual baseline regression test — N=003 styling tripwire.
//
// Boots `next start` against a freshly built bundle, opens `/` at 390×844,
// and asserts three computed-style invariants:
//   1. Hero H1 font-size > 32px
//   2. document.body backgroundColor === rgb(11, 14, 12)   (locked ink)
//   3. Primary CTA backgroundColor === rgb(95, 227, 161)   (locked mint)
//
// Then captures `visual_baseline_390.png` and `visual_baseline_1280.png`.
//
// If Tailwind silently no-ops in any future cycle, all three assertions
// fail loudly and the Judge phase blocks the cycle. This test is the
// primitive that was missing in N=001 and N=002.

import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";
import { chromium, type Browser } from "playwright";

const PORT = Number(process.env.VISUAL_PORT ?? 3470);
const BASE = `http://localhost:${PORT}`;
const REPO = path.resolve(new URL("..", import.meta.url).pathname);
const SHOTS = path.join(REPO, "agent_state", "screenshots");
const CHROME =
  process.env.CHROMIUM_PATH ??
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const EXPECTED_BODY_BG = "rgb(11, 14, 12)";
const EXPECTED_CTA_BG = "rgb(95, 227, 161)";
const MIN_H1_FONT_PX = 32;

interface VisualReport {
  passed: boolean;
  assertions: { name: string; passed: boolean; detail: string }[];
  screenshots: string[];
}

async function waitForServer(): Promise<void> {
  for (let i = 0; i < 90; i++) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return;
    } catch {
      /* not yet ready */
    }
    await wait(500);
  }
  throw new Error(`Server at ${BASE} did not come up within 45s.`);
}

function startServer(): ChildProcess {
  return spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: REPO,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });
}

export async function runVisualBaseline(): Promise<VisualReport> {
  await fs.mkdir(SHOTS, { recursive: true });

  const server = startServer();
  let browser: Browser | undefined;
  const report: VisualReport = {
    passed: false,
    assertions: [],
    screenshots: [],
  };

  const record = (name: string, passed: boolean, detail: string) => {
    report.assertions.push({ name, passed, detail });
  };

  try {
    await waitForServer();
    browser = await chromium.launch({
      executablePath: CHROME,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    // 390 × 844 — primary mobile target
    const ctx390 = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page390 = await ctx390.newPage();
    await page390.goto(`${BASE}/`, { waitUntil: "networkidle" });

    const h1FontPx = await page390
      .locator("h1")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    record(
      "h1FontSizeGreaterThan32",
      h1FontPx > MIN_H1_FONT_PX,
      `getComputedStyle(h1).fontSize = ${h1FontPx}px (need > ${MIN_H1_FONT_PX}px)`,
    );

    const bodyBg = await page390.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    record(
      "bodyBackgroundLockedInk",
      bodyBg === EXPECTED_BODY_BG,
      `body.backgroundColor = "${bodyBg}" (need "${EXPECTED_BODY_BG}")`,
    );

    const ctaBg = await page390
      .locator('button[type="submit"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    record(
      "ctaBackgroundLockedLime",
      ctaBg === EXPECTED_CTA_BG,
      `button[type=submit].backgroundColor = "${ctaBg}" (need "${EXPECTED_CTA_BG}")`,
    );

    const shot390 = path.join(SHOTS, "visual_baseline_390.png");
    await page390.screenshot({ path: shot390, fullPage: true });
    report.screenshots.push(shot390);

    // N=004 unit toggle — imperial (default)
    const imperialFeetVisible = await page390
      .locator("#feet")
      .isVisible();
    const imperialInchesVisible = await page390
      .locator("#inches")
      .isVisible();
    const imperialPoundsVisible = await page390
      .locator("#pounds")
      .isVisible();
    const cmHidden = (await page390.locator("#heightCm").count()) === 0;
    const kgHidden = (await page390.locator("#weightKg").count()) === 0;
    const ftLbPressed = await page390
      .getByRole("button", { name: /feet, inches, pounds/i })
      .getAttribute("aria-pressed");
    record(
      "imperialDefaultRendersFtInLb",
      imperialFeetVisible &&
        imperialInchesVisible &&
        imperialPoundsVisible &&
        cmHidden &&
        kgHidden &&
        ftLbPressed === "true",
      `feet=${imperialFeetVisible} inches=${imperialInchesVisible} pounds=${imperialPoundsVisible} cmCount=${cmHidden ? 0 : "+"} kgCount=${kgHidden ? 0 : "+"} ftLbPressed=${ftLbPressed}`,
    );
    const shotImperial = path.join(SHOTS, "form_imperial_390.png");
    await page390.screenshot({ path: shotImperial, fullPage: true });
    report.screenshots.push(shotImperial);

    // N=004 unit toggle — metric (after click)
    await page390
      .getByRole("button", { name: /centimeters, kilograms/i })
      .click();
    await page390.waitForSelector("#heightCm");
    const metricCmVisible = await page390.locator("#heightCm").isVisible();
    const metricKgVisible = await page390.locator("#weightKg").isVisible();
    const feetGone = (await page390.locator("#feet").count()) === 0;
    const inchesGone = (await page390.locator("#inches").count()) === 0;
    const poundsGone = (await page390.locator("#pounds").count()) === 0;
    const cmKgPressed = await page390
      .getByRole("button", { name: /centimeters, kilograms/i })
      .getAttribute("aria-pressed");
    record(
      "metricRendersCmKgAfterToggle",
      metricCmVisible &&
        metricKgVisible &&
        feetGone &&
        inchesGone &&
        poundsGone &&
        cmKgPressed === "true",
      `cm=${metricCmVisible} kg=${metricKgVisible} ftGone=${feetGone} inGone=${inchesGone} lbGone=${poundsGone} cmKgPressed=${cmKgPressed}`,
    );
    const shotMetric = path.join(SHOTS, "form_metric_390.png");
    await page390.screenshot({ path: shotMetric, fullPage: true });
    report.screenshots.push(shotMetric);

    await ctx390.close();

    // 1280 × 800 — desktop baseline
    const ctx1280 = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page1280 = await ctx1280.newPage();
    await page1280.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const shot1280 = path.join(SHOTS, "visual_baseline_1280.png");
    await page1280.screenshot({ path: shot1280, fullPage: true });
    report.screenshots.push(shot1280);
    await ctx1280.close();

    report.passed = report.assertions.every((a) => a.passed);
    return report;
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    server.kill("SIGTERM");
    // Give the child a moment to clean up the port
    await wait(300);
  }
}

const isMain = (() => {
  try {
    const entry = process.argv[1] ? path.resolve(process.argv[1]) : "";
    const here = new URL(import.meta.url).pathname;
    return entry === path.resolve(here);
  } catch {
    return false;
  }
})();

if (isMain) {
  runVisualBaseline()
    .then((report) => {
      for (const a of report.assertions) {
        const tag = a.passed ? "PASS" : "FAIL";
        console.log(`${tag}  ${a.name}  -- ${a.detail}`);
      }
      for (const s of report.screenshots) {
        console.log(`SAVED ${s}`);
      }
      console.log(`\nResult: ${report.passed ? "PASS" : "FAIL"}`);
      process.exit(report.passed ? 0 : 1);
    })
    .catch((err) => {
      console.error("Visual baseline crashed:", err);
      process.exit(2);
    });
}
