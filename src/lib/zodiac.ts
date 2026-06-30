/**
 * Zodiac affinity — Chinese zodiac (12 animals from birth year).
 *
 * Scoring:
 *   Liu He six-harmony pair = 97
 *   San He trine            = 96
 *   same animal             = 85
 *   clash (opposite, 6 apart) = 72
 *   else                    = 80
 */

export type ZodiacAnimal =
  | "Rat"
  | "Ox"
  | "Tiger"
  | "Rabbit"
  | "Dragon"
  | "Snake"
  | "Horse"
  | "Goat"
  | "Monkey"
  | "Rooster"
  | "Dog"
  | "Pig";

// Index 0 == Rat. 1900 was the year of the Rat.
export const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
];

const ANIMAL_GLYPH: Record<ZodiacAnimal, string> = {
  Rat: "鼠",
  Ox: "牛",
  Tiger: "虎",
  Rabbit: "兔",
  Dragon: "龙",
  Snake: "蛇",
  Horse: "马",
  Goat: "羊",
  Monkey: "猴",
  Rooster: "鸡",
  Dog: "狗",
  Pig: "猪",
};

export function animalGlyph(a: ZodiacAnimal): string {
  return ANIMAL_GLYPH[a];
}

export function animalFromYear(year: number): ZodiacAnimal {
  // 1900 = Rat (index 0). Keep the modulo positive for early years.
  const idx = (((year - 1900) % 12) + 12) % 12;
  return ZODIAC_ANIMALS[idx];
}

function idx(a: ZodiacAnimal): number {
  return ZODIAC_ANIMALS.indexOf(a);
}

// San He trines.
const TRINES: ZodiacAnimal[][] = [
  ["Rat", "Dragon", "Monkey"],
  ["Ox", "Snake", "Rooster"],
  ["Tiger", "Horse", "Dog"],
  ["Rabbit", "Goat", "Pig"],
];

// Liu He six-harmony pairs.
const SIX_HARMONIES: [ZodiacAnimal, ZodiacAnimal][] = [
  ["Rat", "Ox"],
  ["Tiger", "Pig"],
  ["Rabbit", "Dog"],
  ["Dragon", "Rooster"],
  ["Snake", "Monkey"],
  ["Horse", "Goat"],
];

function isSixHarmony(a: ZodiacAnimal, b: ZodiacAnimal): boolean {
  return SIX_HARMONIES.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

function isTrine(a: ZodiacAnimal, b: ZodiacAnimal): boolean {
  return TRINES.some((t) => t.includes(a) && t.includes(b)) && a !== b;
}

function isClash(a: ZodiacAnimal, b: ZodiacAnimal): boolean {
  return (Math.abs(idx(a) - idx(b)) % 12) === 6;
}

export type ZodiacRelation =
  | "sixHarmony"
  | "trine"
  | "same"
  | "clash"
  | "neutral";

export function zodiacRelation(
  a: ZodiacAnimal,
  b: ZodiacAnimal,
): ZodiacRelation {
  if (isSixHarmony(a, b)) return "sixHarmony";
  if (isTrine(a, b)) return "trine";
  if (a === b) return "same";
  if (isClash(a, b)) return "clash";
  return "neutral";
}

export function zodiacScore(a: ZodiacAnimal, b: ZodiacAnimal): number {
  switch (zodiacRelation(a, b)) {
    case "sixHarmony":
      return 97;
    case "trine":
      return 96;
    case "same":
      return 85;
    case "clash":
      return 72;
    default:
      return 80;
  }
}
