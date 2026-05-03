import type { Recommendation, UserInput } from "./types";

const GOAL_PHRASE: Record<UserInput["primaryGoal"], string> = {
  muscle: "built for muscle",
  "fat-loss": "tuned for fat loss",
  energy: "aimed at all-day energy",
  longevity: "tilted toward long-term health",
  focus: "wired for focus",
};

const DIET_TAG: Record<UserInput["dietPattern"], string> = {
  omnivore: "",
  vegetarian: "vegetarian ",
  vegan: "vegan ",
  keto: "keto ",
  mediterranean: "Mediterranean ",
};

function topThree(supplementNames: string[]): string {
  const trimmed = supplementNames.slice(0, 3).map(stripParen);
  if (trimmed.length === 0) return "";
  if (trimmed.length === 1) return trimmed[0];
  if (trimmed.length === 2) return `${trimmed[0]} and ${trimmed[1]}`;
  return `${trimmed[0]}, ${trimmed[1]}, and ${trimmed[2]}`;
}

function stripParen(name: string): string {
  return name.replace(/\s*\(.*?\)\s*$/, "").trim();
}

function clampWords(sentence: string, maxWords: number): string {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return sentence;
  return words.slice(0, maxWords).join(" ").replace(/[,.;:]$/, "") + ".";
}

export function buildVerdict(
  input: UserInput,
  supplements: { name: string }[],
): string {
  const top = topThree(supplements.map((s) => s.name));
  const goal = GOAL_PHRASE[input.primaryGoal];
  const diet = DIET_TAG[input.dietPattern];
  const body = `${input.age}-year-old ${diet}${input.sex} body`.replace(
    /\s+/g,
    " ",
  );

  const sentence = top
    ? `Your stack leads with ${top} — ${goal} on a ${body}.`
    : `Your protocol is ${goal} on a ${body}.`;

  return clampWords(sentence, 22);
}
