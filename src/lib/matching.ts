/**
 * The matching engine — blends three destiny signals into a single 0–100
 * alignment score, clamped to 70–99, then maps to a tier.
 *
 * Pure module: operates on stored signal data (computed once at onboarding),
 * so it needs no ephemeris at match time.
 */

import { FiveElement, elementalScore, elementRelation } from "./bazi";
import {
  AstralElement,
  NatalChart,
  astralRelation,
  astralScore,
  richAstralScore,
} from "./astrology";
import { ZodiacAnimal, zodiacScore, zodiacRelation } from "./zodiac";
import { Tier, tierForScore } from "./tiers";

export type Gender = "woman" | "man" | "nonbinary";
export type InterestedIn = "women" | "men" | "everyone";
export type ConnectionType = "romance" | "friendship" | "both";

/** Everything the engine needs to know about a person. */
export type AlignmentProfile = {
  gender: Gender;
  interestedIn: InterestedIn;
  connection: ConnectionType;
  baziElement: FiveElement;
  zodiacAnimal: ZodiacAnimal;
  chart: NatalChart; // sun always; moon/rising when known
};

export type SignalBreakdown = {
  label: string;
  detail: string;
  score: number;
  color: string;
};

export type Alignment = {
  score: number;
  tier: Tier;
  signals: {
    elemental: number;
    astral: number;
    zodiac: number;
  };
  breakdown: SignalBreakdown[];
};

const CLAMP_MIN = 70;
const CLAMP_MAX = 99;

function clamp(n: number): number {
  return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, n));
}

/* ----------------------------- gender gating ----------------------------- */

function genderCategory(g: Gender): "women" | "men" | "nonbinary" {
  return g === "woman" ? "women" : g === "man" ? "men" : "nonbinary";
}

/** Does `viewer` find `candidate`'s gender acceptable? */
function openTo(interestedIn: InterestedIn, candidate: Gender): boolean {
  if (interestedIn === "everyone") return true;
  const cat = genderCategory(candidate);
  // Non-binary members surface for everyone (inclusive default); women/men
  // gates apply to the binary categories.
  if (cat === "nonbinary") return true;
  return interestedIn === cat;
}

/**
 * Mutual gating: a candidate appears for a viewer only if the viewer is open to
 * the candidate's gender AND the candidate's "interested in" includes the
 * viewer's gender. Runs BEFORE any scoring.
 */
export function passesGenderGate(
  viewer: Pick<AlignmentProfile, "gender" | "interestedIn">,
  candidate: Pick<AlignmentProfile, "gender" | "interestedIn">,
): boolean {
  return (
    openTo(viewer.interestedIn, candidate.gender) &&
    openTo(candidate.interestedIn, viewer.gender)
  );
}

/** Connection-type compatibility (romance / friendship / both). */
export function passesConnectionGate(
  a: ConnectionType,
  b: ConnectionType,
): boolean {
  if (a === "both" || b === "both") return true;
  return a === b;
}

/* ------------------------------ descriptions ----------------------------- */

function elementalDetail(a: FiveElement, b: FiveElement): string {
  switch (elementRelation(a, b)) {
    case "same":
      return `Two ${a} natures — a steady, familiar resonance.`;
    case "generating":
      return `${a} and ${b} nourish one another in the turning cycle.`;
    case "controlling":
      return `${a} and ${b} temper one another — a relationship that asks for care.`;
    default:
      return `${a} and ${b} meet on measured, middle ground.`;
  }
}

function astralDetail(a: AstralElement, b: AstralElement): string {
  switch (astralRelation(a, b)) {
    case "same":
      return `Both move to a ${a} rhythm.`;
    case "complementary":
      return `${a} and ${b} gently balance one another.`;
    default:
      return `${a} and ${b} bring different tempos to the meeting.`;
  }
}

function zodiacDetail(a: ZodiacAnimal, b: ZodiacAnimal): string {
  switch (zodiacRelation(a, b)) {
    case "sixHarmony":
      return `${a} and ${b} form a six-harmony pair (Liu He) — natural allies.`;
    case "trine":
      return `${a} and ${b} share a harmony trine (San He).`;
    case "same":
      return `Two ${a}s — kindred temperaments.`;
    case "clash":
      return `${a} and ${b} sit opposite — a spirited, contrasting pair.`;
    default:
      return `${a} and ${b} keep an easy, neutral company.`;
  }
}

/* ------------------------------- the score ------------------------------- */

/**
 * Compute the full alignment between two profiles.
 * @param rich when true (Aligned+ viewer), folds moon + rising into the astral signal.
 */
export function computeAlignment(
  a: AlignmentProfile,
  b: AlignmentProfile,
  rich = false,
): Alignment {
  const elemental = elementalScore(a.baziElement, b.baziElement);
  const astral = rich
    ? richAstralScore(a.chart, b.chart)
    : astralScore(a.chart.sunElement, b.chart.sunElement);
  const zodiac = zodiacScore(a.zodiacAnimal, b.zodiacAnimal);

  // ~34/33/33 blend.
  const blended = elemental * 0.34 + astral * 0.33 + zodiac * 0.33;
  const score = clamp(Math.round(blended));
  const tier = tierForScore(score);

  return {
    score,
    tier,
    signals: {
      elemental: Math.round(elemental),
      astral: Math.round(astral),
      zodiac: Math.round(zodiac),
    },
    breakdown: [
      {
        label: "Elemental nature",
        detail: elementalDetail(a.baziElement, b.baziElement),
        score: Math.round(elemental),
        color: "#a8843b",
      },
      {
        label: "Astral temperament",
        detail: astralDetail(a.chart.sunElement, b.chart.sunElement),
        score: Math.round(astral),
        color: "#7e3340",
      },
      {
        label: "Zodiac affinity",
        detail: zodiacDetail(a.zodiacAnimal, b.zodiacAnimal),
        score: Math.round(zodiac),
        color: "#4e4a63",
      },
    ],
  };
}
