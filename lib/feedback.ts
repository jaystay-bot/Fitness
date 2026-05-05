// Pure synchronous validation helpers for the N=010 feedback widget.

export const FEEDBACK_MIN_CHARS = 1;
export const FEEDBACK_MAX_CHARS = 500;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s]+$/i;

export function isValidFeedback(message: unknown): message is string {
  if (typeof message !== "string") return false;
  const trimmed = message.trim();
  return trimmed.length >= FEEDBACK_MIN_CHARS && trimmed.length <= FEEDBACK_MAX_CHARS;
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

export function isValidUrl(url: unknown): url is string {
  return typeof url === "string" && URL_REGEX.test(url) && url.length <= 2048;
}

export function isValidUserAgent(ua: unknown): ua is string {
  return typeof ua === "string" && ua.length > 0 && ua.length <= 1024;
}
