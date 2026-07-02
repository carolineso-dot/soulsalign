/**
 * Ranking tiers by alignment score. Shared by the matching engine and the UI.
 */

export type TierKey = "destined" | "kindred" | "attuned" | "spark";

export type Tier = {
  key: TierKey;
  name: string;
  /** Inclusive score range. */
  min: number;
  max: number;
  /** Hex colour for the tier. */
  color: string;
  /** Tailwind-friendly token name (matches design tokens). */
  token: string;
  /** Evocative one-line note shown on cards/profiles/chat. */
  note: string;
};

export const TIERS: Tier[] = [
  {
    key: "destined",
    name: "Destined",
    min: 93,
    max: 100,
    color: "#a8843b",
    token: "gold",
    note: "A rare convergence — the kind one waits a lifetime to find.",
  },
  {
    key: "kindred",
    name: "Kindred",
    min: 85,
    max: 92,
    color: "#7e3340",
    token: "claret",
    note: "Two natures moving in quiet accord.",
  },
  {
    key: "attuned",
    name: "Attuned",
    min: 77,
    max: 84,
    color: "#544c74",
    token: "slate",
    note: "A genuine harmony, with room to deepen.",
  },
  {
    key: "spark",
    name: "Spark",
    min: 70,
    max: 76,
    color: "#5a7a5f",
    token: "sage",
    note: "An early resonance, worth the curiosity.",
  },
];

export function tierForScore(score: number): Tier {
  // Highest tier whose minimum the score clears.
  return (
    TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1]
  );
}

export function tierByKey(key: TierKey): Tier {
  return TIERS.find((t) => t.key === key) ?? TIERS[TIERS.length - 1];
}
