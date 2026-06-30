/**
 * Elemental nature — Ba Zi (八字) five elements, MVP year-element model.
 *
 * Year-element by last digit of the birth year:
 *   4/5 = Wood, 6/7 = Fire, 8/9 = Earth, 0/1 = Metal, 2/3 = Water
 *
 * (Upgradeable later to a fuller Ba Zi day-master calculation.)
 */

export type FiveElement = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

export const FIVE_ELEMENTS: FiveElement[] = [
  "Wood",
  "Fire",
  "Earth",
  "Metal",
  "Water",
];

const ELEMENT_GLYPH: Record<FiveElement, string> = {
  Wood: "木",
  Fire: "火",
  Earth: "土",
  Metal: "金",
  Water: "水",
};

export function elementGlyph(el: FiveElement): string {
  return ELEMENT_GLYPH[el];
}

export function elementFromYear(year: number): FiveElement {
  const d = ((year % 10) + 10) % 10;
  if (d === 4 || d === 5) return "Wood";
  if (d === 6 || d === 7) return "Fire";
  if (d === 8 || d === 9) return "Earth";
  if (d === 0 || d === 1) return "Metal";
  return "Water"; // 2 or 3
}

// Generating (sheng) cycle: Wood → Fire → Earth → Metal → Water → Wood
const GENERATES: Record<FiveElement, FiveElement> = {
  Wood: "Fire",
  Fire: "Earth",
  Earth: "Metal",
  Metal: "Water",
  Water: "Wood",
};

// Controlling (ke) cycle: Wood → Earth → Water → Fire → Metal → Wood
const CONTROLS: Record<FiveElement, FiveElement> = {
  Wood: "Earth",
  Earth: "Water",
  Water: "Fire",
  Fire: "Metal",
  Metal: "Wood",
};

export type ElementRelation = "same" | "generating" | "controlling" | "neutral";

export function elementRelation(
  a: FiveElement,
  b: FiveElement,
): ElementRelation {
  if (a === b) return "same";
  if (GENERATES[a] === b || GENERATES[b] === a) return "generating";
  if (CONTROLS[a] === b || CONTROLS[b] === a) return "controlling";
  return "neutral";
}

/**
 * Elemental harmony score:
 *   same = 88, generating (either direction) = 97, controlling = 75.
 */
export function elementalScore(a: FiveElement, b: FiveElement): number {
  switch (elementRelation(a, b)) {
    case "same":
      return 88;
    case "generating":
      return 97;
    case "controlling":
      return 75;
    default:
      return 82; // neutral: a measured middle ground
  }
}
