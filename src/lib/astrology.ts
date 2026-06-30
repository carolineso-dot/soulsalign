/**
 * Astral temperament — Western astrology types and pure scoring math.
 *
 * This module is pure (safe on client or server). The actual ephemeris
 * computation of sun/moon/rising lives in `ephemeris.ts` (server-only).
 */

export type SunSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type AstralElement = "Fire" | "Earth" | "Air" | "Water";

export type NatalChart = {
  sun: SunSign;
  moon: SunSign | null;
  rising: SunSign | null;
  sunElement: AstralElement;
};

const SIGN_ELEMENT: Record<SunSign, AstralElement> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
};

const SIGN_GLYPH: Record<SunSign, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

export function sunElement(sign: SunSign): AstralElement {
  return SIGN_ELEMENT[sign];
}

export function signGlyph(sign: SunSign): string {
  return SIGN_GLYPH[sign];
}

// Tropical sun-sign date ranges — used when only the date is known.
const SUN_RANGES: { sign: SunSign; from: [number, number]; to: [number, number] }[] = [
  { sign: "Capricorn", from: [12, 22], to: [1, 19] },
  { sign: "Aquarius", from: [1, 20], to: [2, 18] },
  { sign: "Pisces", from: [2, 19], to: [3, 20] },
  { sign: "Aries", from: [3, 21], to: [4, 19] },
  { sign: "Taurus", from: [4, 20], to: [5, 20] },
  { sign: "Gemini", from: [5, 21], to: [6, 20] },
  { sign: "Cancer", from: [6, 21], to: [7, 22] },
  { sign: "Leo", from: [7, 23], to: [8, 22] },
  { sign: "Virgo", from: [8, 23], to: [9, 22] },
  { sign: "Libra", from: [9, 23], to: [10, 22] },
  { sign: "Scorpio", from: [10, 23], to: [11, 21] },
  { sign: "Sagittarius", from: [11, 22], to: [12, 21] },
];

/** Sun sign from month (1–12) + day, by date range. */
export function sunSignFromDate(month: number, day: number): SunSign {
  for (const r of SUN_RANGES) {
    const [fm, fd] = r.from;
    const [tm, td] = r.to;
    if (fm === tm) {
      if (month === fm && day >= fd && day <= td) return r.sign;
    } else if (fm > tm) {
      if ((month === fm && day >= fd) || (month === tm && day <= td)) return r.sign;
    } else {
      if (
        (month === fm && day >= fd) ||
        (month === tm && day <= td) ||
        (month > fm && month < tm)
      )
        return r.sign;
    }
  }
  return "Capricorn";
}

export type AstralRelation = "same" | "complementary" | "neutral";

export function astralRelation(
  a: AstralElement,
  b: AstralElement,
): AstralRelation {
  if (a === b) return "same";
  const complementary =
    (a === "Fire" && b === "Air") ||
    (a === "Air" && b === "Fire") ||
    (a === "Earth" && b === "Water") ||
    (a === "Water" && b === "Earth");
  return complementary ? "complementary" : "neutral";
}

/** Base astral score from sun-sign elements: same=90, complementary=96, else=77. */
export function astralScore(a: AstralElement, b: AstralElement): number {
  switch (astralRelation(a, b)) {
    case "same":
      return 90;
    case "complementary":
      return 96;
    default:
      return 77;
  }
}

/**
 * Richer astral score for Aligned+ members: blends sun (60%), moon (25%),
 * rising (15%) when both charts have those placements. Falls back to the
 * sun-only score when moon/rising are missing on either side.
 */
export function richAstralScore(a: NatalChart, b: NatalChart): number {
  const sun = astralScore(a.sunElement, b.sunElement);
  const haveMoon = a.moon && b.moon;
  const haveRising = a.rising && b.rising;
  if (!haveMoon && !haveRising) return sun;

  let total = sun * 0.6;
  let weight = 0.6;
  if (haveMoon) {
    total += astralScore(sunElement(a.moon!), sunElement(b.moon!)) * 0.25;
    weight += 0.25;
  }
  if (haveRising) {
    total += astralScore(sunElement(a.rising!), sunElement(b.rising!)) * 0.15;
    weight += 0.15;
  }
  return total / weight;
}
