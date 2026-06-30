import {
  AlignmentProfile,
  ConnectionType,
  Gender,
  InterestedIn,
} from "./matching";
import { NatalChart, SunSign, AstralElement } from "./astrology";
import { FiveElement } from "./bazi";
import { ZodiacAnimal } from "./zodiac";

/** The destiny-bearing subset of a user row the engine needs. */
export type ProfileRow = {
  gender: string | null;
  interestedIn: string | null;
  connection: string | null;
  baziElement: string | null;
  zodiacAnimal: string | null;
  sunSign: string | null;
  moonSign: string | null;
  risingSign: string | null;
  sunElement: string | null;
};

export function ageFromDob(dob: Date | string): number {
  const d = typeof dob === "string" ? new Date(dob) : dob;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function parseInterests(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Build the engine's AlignmentProfile from a stored user row. Null if incomplete. */
export function toAlignmentProfile(row: ProfileRow): AlignmentProfile | null {
  if (
    !row.gender ||
    !row.interestedIn ||
    !row.connection ||
    !row.baziElement ||
    !row.zodiacAnimal ||
    !row.sunSign ||
    !row.sunElement
  ) {
    return null;
  }
  const chart: NatalChart = {
    sun: row.sunSign as SunSign,
    moon: (row.moonSign as SunSign) ?? null,
    rising: (row.risingSign as SunSign) ?? null,
    sunElement: row.sunElement as AstralElement,
  };
  return {
    gender: row.gender as Gender,
    interestedIn: row.interestedIn as InterestedIn,
    connection: row.connection as ConnectionType,
    baziElement: row.baziElement as FiveElement,
    zodiacAnimal: row.zodiacAnimal as ZodiacAnimal,
    chart,
  };
}

/** Stable conversation key for a pair of user ids. */
export function threadKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}
