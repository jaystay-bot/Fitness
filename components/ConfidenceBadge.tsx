export function ConfidenceBadge({ confidence }: { confidence: number }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-wider text-paper/70">
      {confidence}% confidence
    </span>
  );
}
