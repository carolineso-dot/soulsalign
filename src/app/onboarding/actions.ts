"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { computeChart } from "@/lib/ephemeris";
import { elementFromYear } from "@/lib/bazi";
import { animalFromYear } from "@/lib/zodiac";
import { lookupPlace } from "@/lib/geo";
import { ageFromDob } from "@/lib/profile";
import { autoGrantTestMatches } from "@/app/actions/test";

export type OnboardingState = { error?: string };

const schema = z.object({
  name: z.string().min(1, "Please tell us your name.").max(60),
  dob: z.string().min(1, "Your date of birth is required."),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  location: z.string().optional(),
  gender: z.enum(["woman", "man", "nonbinary"]),
  interestedIn: z.enum(["women", "men", "everyone"]),
  connection: z.enum(["romance", "friendship", "both"]),
  consent18: z.string().optional(),
  consentGuidelines: z.string().optional(),
});

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    dob: String(formData.get("dob") ?? ""),
    birthTime: String(formData.get("birthTime") ?? ""),
    birthPlace: String(formData.get("birthPlace") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    gender: formData.get("gender"),
    interestedIn: formData.get("interestedIn"),
    connection: formData.get("connection"),
    consent18: formData.get("consent18")?.toString(),
    consentGuidelines: formData.get("consentGuidelines")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete every required field." };
  }
  const d = parsed.data;

  if (!d.consent18 || !d.consentGuidelines) {
    return { error: "Please confirm you are 18+ and agree to the Community Guidelines." };
  }

  const dob = new Date(d.dob);
  if (Number.isNaN(dob.getTime())) {
    return { error: "That date of birth doesn't look right." };
  }
  if (ageFromDob(dob) < 18) {
    return { error: "Souls Align is for those 18 and older." };
  }

  // Optional birth time → hour/minute.
  let hour: number | null = null;
  let minute: number | null = null;
  if (d.birthTime && /^\d{1,2}:\d{2}$/.test(d.birthTime)) {
    const [h, m] = d.birthTime.split(":").map(Number);
    hour = h;
    minute = m;
  }

  // Optional birth place → lat/long.
  let birthPlace: string | null = null;
  let birthLat: number | null = null;
  let birthLon: number | null = null;
  if (d.birthPlace) {
    const geo = lookupPlace(d.birthPlace);
    if (geo) {
      birthPlace = geo.label;
      birthLat = geo.lat;
      birthLon = geo.lon;
    } else {
      birthPlace = d.birthPlace; // keep what they typed even if unmatched
    }
  }

  // Current/residential location for proximity matching.
  let locationLabel: string | null = null;
  let locationLat: number | null = null;
  let locationLon: number | null = null;
  if (d.location) {
    const loc = lookupPlace(d.location);
    locationLabel = loc?.label ?? d.location;
    locationLat = loc?.lat ?? null;
    locationLon = loc?.lon ?? null;
  }

  const year = dob.getFullYear();
  const chart = await computeChart({
    year,
    month: dob.getMonth() + 1,
    day: dob.getDate(),
    hour,
    minute,
    latitude: birthLat,
    longitude: birthLon,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: d.name,
      dob,
      birthHour: hour,
      birthMinute: minute,
      birthPlace,
      birthLat,
      birthLon,
      gender: d.gender,
      interestedIn: d.interestedIn,
      connection: d.connection,
      locationLabel,
      locationLat,
      locationLon,
      sunSign: chart.sun,
      moonSign: chart.moon,
      risingSign: chart.rising,
      sunElement: chart.sunElement,
      baziElement: elementFromYear(year),
      zodiacAnimal: animalFromYear(year),
      onboardingComplete: true,
    },
  });

  // Test mode only: no-op in production.
  await autoGrantTestMatches(userId);

  redirect("/discover");
}
