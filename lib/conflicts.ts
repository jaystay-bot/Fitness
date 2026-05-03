import type { ConflictFlag, UserInput } from "./types";

export function detectConflict(input: UserInput): ConflictFlag | null {
  if (
    input.primaryGoal === "muscle" &&
    input.activityLevel === "sedentary"
  ) {
    return {
      severity: "block",
      message:
        "Activity level is too low for muscle growth. Fix activity first; supplements cannot compensate.",
      suggestedFix:
        "Move to at least light activity (3 sessions/week) for two weeks, then start the stack.",
    };
  }

  if (
    input.primaryGoal === "fat-loss" &&
    input.dietPattern === "keto" &&
    input.caffeineCupsPerDay >= 4
  ) {
    return {
      severity: "warn",
      message:
        "High caffeine on keto can mask electrolyte loss. Hydrate and salt before adding more stimulants.",
      suggestedFix:
        "Cap caffeine at 2 cups/day and add 1000 mg sodium + 300 mg potassium first thing in the morning.",
    };
  }

  if (
    input.primaryGoal === "longevity" &&
    input.alcoholDrinksPerWeek > 7
  ) {
    return {
      severity: "warn",
      message:
        "Longevity goals conflict with weekly alcohol above 7 drinks. The stack will not neutralize this.",
      suggestedFix:
        "Bring weekly alcohol to 7 drinks or fewer for one month before judging the protocol.",
    };
  }

  if (input.primaryGoal === "focus" && input.sleepHours < 6) {
    return {
      severity: "block",
      message:
        "Sleep is the lever. No nootropic outperforms a seventh hour.",
      suggestedFix:
        "Get to 7 hours for one week with a fixed wake time, then add focus supplements.",
    };
  }

  if (input.age >= 65 && input.activityLevel === "high") {
    return {
      severity: "warn",
      message:
        "High activity at 65+ requires a medical clearance the product cannot provide.",
      suggestedFix:
        "Get cardiovascular and joint clearance from a clinician before starting or continuing.",
    };
  }

  return null;
}
