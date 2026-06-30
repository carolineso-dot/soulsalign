/**
 * Ephemeris computation of the natal chart — server-only.
 * Uses circular-natal-horoscope-js for genuine sun/moon/rising.
 */

import "server-only";
import {
  NatalChart,
  SunSign,
  sunElement,
  sunSignFromDate,
} from "./astrology";

type ComputeInput = {
  year: number;
  month: number; // 1–12
  day: number;
  hour?: number | null; // 0–23
  minute?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

/**
 * Compute the natal chart. Sun is always returned. Moon + rising are returned
 * only when exact time AND place are supplied (required for the richer reading).
 */
export async function computeChart(input: ComputeInput): Promise<NatalChart> {
  const { year, month, day } = input;
  const hasTimeAndPlace =
    input.hour != null &&
    input.minute != null &&
    input.latitude != null &&
    input.longitude != null;

  const fallbackSun = sunSignFromDate(month, day);

  try {
    const mod = await import("circular-natal-horoscope-js");
    const Origin = mod.Origin;
    const Horoscope = mod.Horoscope;

    const origin = new Origin({
      year,
      month: month - 1, // library months are 0-indexed
      date: day,
      hour: input.hour ?? 12,
      minute: input.minute ?? 0,
      latitude: input.latitude ?? 0,
      longitude: input.longitude ?? 0,
    });

    const h = new Horoscope({
      origin,
      houseSystem: "whole-sign",
      zodiac: "tropical",
    });

    const sun = (h.CelestialBodies?.sun?.Sign?.label as SunSign) ?? fallbackSun;
    const moon = hasTimeAndPlace
      ? ((h.CelestialBodies?.moon?.Sign?.label as SunSign) ?? null)
      : null;
    const rising = hasTimeAndPlace
      ? ((h.Ascendant?.Sign?.label as SunSign) ?? null)
      : null;

    return { sun, moon, rising, sunElement: sunElement(sun) };
  } catch {
    return {
      sun: fallbackSun,
      moon: null,
      rising: null,
      sunElement: sunElement(fallbackSun),
    };
  }
}
