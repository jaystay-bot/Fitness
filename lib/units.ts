export type UnitSystem = "imperial" | "metric";

export function imperialToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function imperialToKg(pounds: number): number {
  return Math.round(pounds * 0.453592);
}

export function cmToImperial(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

export function kgToPounds(kg: number): number {
  return Math.round(kg / 0.453592);
}
