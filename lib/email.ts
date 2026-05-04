import { Resend } from "resend";

let cached: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (cached) return cached;
  cached = new Resend(key);
  return cached;
}

export interface SendResultEmailResult {
  ok: boolean;
  reason?: string;
  id?: string | null;
}

const FROM_DEFAULT = "Apex Protocol <protocol@apex-protocol.app>";

function buildHtml(verdict: string, slug: string, appUrl: string): string {
  const link = `${appUrl}/r/${slug}`;
  return [
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0A0A0A;color:#FAFAF7;padding:32px 24px;">`,
    `  <p style="font:11px ui-monospace,monospace;letter-spacing:0.18em;text-transform:uppercase;color:#D4FF3A;margin:0 0 16px;">Your Apex Protocol</p>`,
    `  <p style="font:500 22px/1.3 Georgia,serif;margin:0 0 24px;">${escapeHtml(verdict)}</p>`,
    `  <p style="font-size:14px;line-height:1.55;margin:0 0 24px;">Open or share the full protocol — supplements, nutrition, 30-day plan, and warnings — at:</p>`,
    `  <p style="margin:0 0 24px;"><a href="${link}" style="color:#D4FF3A;text-decoration:underline;">${link}</a></p>`,
    `  <p style="font-size:12px;line-height:1.55;color:#FAFAF7;opacity:0.6;margin:0;">We deleted your address with this send. Create an account if you want a 30-day check-in or to come back to your stack.</p>`,
    `</div>`,
  ].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendResultEmail(
  email: string,
  verdict: string,
  slug: string,
): Promise<SendResultEmailResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "missing-key" };
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://apex-protocol.app";
  const from = process.env.RESEND_FROM ?? FROM_DEFAULT;
  const result = await resend.emails.send({
    from,
    to: [email],
    subject: "Your Apex Protocol",
    html: buildHtml(verdict, slug, appUrl),
  });
  if (result.error) {
    return { ok: false, reason: result.error.message ?? "send-failed" };
  }
  return { ok: true, id: result.data?.id ?? null };
}
