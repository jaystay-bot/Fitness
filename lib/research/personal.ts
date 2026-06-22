// N=037: client-side personalization for The Wire. Persists the compounds in the
// user's most recent protocol to localStorage so the research feed can surface
// them ("Your Channel"). No backend, no PII — just the supplement names the
// engine already returned.

const STACK_KEY = "apex.stack.v1";

interface StoredStack {
  names: string[];
  savedAt: string; // ISO
}

export function saveStack(names: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredStack = { names, savedAt: new Date().toISOString() };
    window.localStorage.setItem(STACK_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable (private mode / quota) — non-fatal */
  }
}

export function readStack(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredStack;
    return Array.isArray(parsed.names) ? parsed.names : [];
  } catch {
    return [];
  }
}

// Deterministic "read of the day" index — same for everyone on a given UTC date,
// rotating through the feed so each day surfaces a different compound.
export function dailyIndex(count: number): number {
  if (count <= 0) return 0;
  const now = new Date();
  const dayNumber = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000,
  );
  return dayNumber % count;
}
