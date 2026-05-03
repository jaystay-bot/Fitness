import { getSupplement } from "./supplements";
import type { EvidenceTier } from "./types";

export interface LedgerSample {
  name: string;
  tier: EvidenceTier;
  studies: number;
  claim: string;
}

const creatine = getSupplement("creatine");
const caffeineTheanine = getSupplement("caffeine-theanine");
const rhodiola = getSupplement("rhodiola");

export const LEDGER_SAMPLES: LedgerSample[] = [
  {
    name: creatine.name,
    tier: "Strong",
    studies: creatine.studyCount,
    claim: "Most-studied performance aid; gains in strength and lean mass.",
  },
  {
    name: caffeineTheanine.name,
    tier: "Moderate",
    studies: caffeineTheanine.studyCount,
    claim: "Smoother focus than caffeine alone; less jitter, fewer crashes.",
  },
  {
    name: rhodiola.name,
    tier: "Emerging",
    studies: rhodiola.studyCount,
    claim: "Promising for stress-related fatigue and mental endurance.",
  },
];
