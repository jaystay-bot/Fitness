export function Verdict({ text }: { text: string }) {
  return (
    <p className="font-serif text-2xl sm:text-3xl leading-snug text-paper">
      <span className="text-lime">→</span>{" "}
      <span className="italic">{text}</span>
    </p>
  );
}
