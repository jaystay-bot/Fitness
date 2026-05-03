import type { DietPattern, PrimaryGoal, Symptom } from "./types";

export interface NutritionRule {
  eatMore: string[];
  eatLess: string[];
}

export const GOAL_NUTRITION: Record<PrimaryGoal, NutritionRule> = {
  muscle: {
    eatMore: [
      "Whole eggs and Greek yogurt at breakfast",
      "Chicken, fish, or tofu at every main meal",
      "Rice, oats, or potatoes around training",
      "Olive oil and avocado for steady calories",
      "Leafy greens and berries for micronutrients",
    ],
    eatLess: [
      "Liquid calories that crowd out protein",
      "Ultra-processed snacks between meals",
      "Alcohol within four hours of training",
    ],
  },
  "fat-loss": {
    eatMore: [
      "High-volume vegetables at every meal",
      "Lean protein 30+ g per main meal",
      "Plain Greek yogurt or cottage cheese as a snack",
      "Beans, lentils, and whole fruit for fiber",
      "Water and unsweetened tea or coffee",
    ],
    eatLess: [
      "Sugary drinks, juices, and sweetened coffees",
      "Refined snack foods bought in bulk",
      "Alcohol on weeknights",
    ],
  },
  energy: {
    eatMore: [
      "Iron-rich foods like lean red meat or lentils",
      "Eggs, salmon, and dairy for B12 and choline",
      "Mixed berries and citrus for vitamin C absorption",
      "Whole grains spread across the day",
      "Two liters of water before 6pm",
    ],
    eatLess: [
      "Late-evening caffeine after 2pm",
      "High-sugar breakfasts that spike then crash",
      "More than one alcoholic drink per night",
    ],
  },
  longevity: {
    eatMore: [
      "Fatty fish twice a week",
      "Olive oil as the primary cooking fat",
      "Beans, lentils, and nuts daily",
      "Cruciferous and leafy vegetables daily",
      "Berries and other deeply colored fruit",
    ],
    eatLess: [
      "Processed and cured red meat",
      "Refined seed-oil-fried takeout",
      "Sugary desserts as a daily habit",
    ],
  },
  focus: {
    eatMore: [
      "Eggs and salmon for choline and DHA",
      "Walnuts, chia, and flax for ALA",
      "Blueberries and dark chocolate (>70%)",
      "Slow-carb breakfasts (oats, beans, eggs)",
      "Green tea between focused work blocks",
    ],
    eatLess: [
      "Sugary breakfasts that crash by 11am",
      "Heavy lunches that knock out the afternoon",
      "Alcohol on nights before deep-focus days",
    ],
  },
};

export const DIET_OVERRIDES: Partial<
  Record<DietPattern, { eatMore: string[]; eatLess: string[] }>
> = {
  vegan: {
    eatMore: [
      "Lentils, tofu, tempeh, and edamame at every meal",
      "Fortified plant milk for B12 and calcium",
    ],
    eatLess: ["Refined vegan snack bars marketed as protein"],
  },
  vegetarian: {
    eatMore: ["Greek yogurt, cottage cheese, eggs, paneer for protein"],
    eatLess: [],
  },
  keto: {
    eatMore: ["Sea salt on food", "Bone broth or salted water with electrolytes"],
    eatLess: ["Hidden carbs in sauces and dressings"],
  },
  mediterranean: {
    eatMore: ["Extra virgin olive oil as the default fat"],
    eatLess: [],
  },
  omnivore: {
    eatMore: [],
    eatLess: [],
  },
};

export const SYMPTOM_OVERRIDES: Partial<
  Record<Symptom, { eatMore: string[]; eatLess: string[] }>
> = {
  bloating: {
    eatMore: ["Cooked, low-FODMAP vegetables for two weeks"],
    eatLess: ["Dairy and gluten for a 14-day elimination trial"],
  },
  "poor-sleep": {
    eatMore: ["Kiwi, tart cherry, or chamomile in the evening"],
    eatLess: ["Caffeine after 2pm", "Alcohol within three hours of bed"],
  },
};
