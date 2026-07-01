import "server-only";
import { prisma } from "./db";
import { hasPlus } from "./plans";
import { haversineKm, lookupPlace } from "./geo";
import {
  Alignment,
  computeAlignment,
  passesConnectionGate,
  passesGenderGate,
} from "./matching";
import { ageFromDob, parseInterests, toAlignmentProfile } from "./profile";
import { TierKey } from "./tiers";

export type MatchCard = {
  id: string;
  name: string;
  age: number | null;
  essence: string | null;
  photoUrl: string | null;
  photoCrop: string | null;
  verified: boolean;
  score: number;
  tierKey: TierKey;
  tierName: string;
  tierColor: string;
  /** Distance from the search centre in km, when a location is known. */
  distanceKm: number | null;
  /** True when this Destined match is gated behind Aligned+ for a free viewer. */
  locked: boolean;
};

export type RefineFilters = {
  connection?: "romance" | "friendship" | "both";
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  /** A city to search around; falls back to the viewer's own location. */
  near?: string;
  /** Max distance (km) from the search centre. Undefined = anywhere. */
  maxKm?: number;
};

const FREE_VISIBLE_LIMIT = 8;

type ViewerLike = {
  id: string;
  plan: string | null;
  gender: string | null;
  interestedIn: string | null;
  connection: string | null;
  baziElement: string | null;
  zodiacAnimal: string | null;
  sunSign: string | null;
  moonSign: string | null;
  risingSign: string | null;
  sunElement: string | null;
  locationLat: number | null;
  locationLon: number | null;
};

/**
 * Curated matches for a viewer: gender + connection gating first, then scoring,
 * then tiering. Free viewers see Destined matches as locked/blurred cards.
 */
export async function getCuratedMatches(
  viewer: ViewerLike,
  filters: RefineFilters = {},
): Promise<MatchCard[]> {
  const viewerProfile = toAlignmentProfile(viewer);
  if (!viewerProfile) return [];

  const plus = hasPlus(viewer.plan);

  // Resolve the proximity search centre: an explicit "near" city if given,
  // otherwise the viewer's own saved location.
  let center: { lat: number; lon: number } | null = null;
  if (filters.near) {
    const geo = lookupPlace(filters.near);
    if (geo) center = { lat: geo.lat, lon: geo.lon };
  }
  if (!center && viewer.locationLat != null && viewer.locationLon != null) {
    center = { lat: viewer.locationLat, lon: viewer.locationLon };
  }

  // Exclude blocked pairs, and anyone already in a relationship (chosen, an
  // active chat, or an incoming request) — Aligned shows only fresh souls.
  const [blocks, iOut, iIn] = await Promise.all([
    prisma.block.findMany({
      where: { OR: [{ blockerId: viewer.id }, { blockedId: viewer.id }] },
      select: { blockerId: true, blockedId: true },
    }),
    prisma.interest.findMany({ where: { fromId: viewer.id }, select: { toId: true } }),
    prisma.interest.findMany({ where: { toId: viewer.id }, select: { fromId: true } }),
  ]);
  const excluded = new Set<string>([viewer.id]);
  for (const b of blocks) {
    excluded.add(b.blockerId);
    excluded.add(b.blockedId);
  }
  for (const o of iOut) excluded.add(o.toId);
  for (const i of iIn) excluded.add(i.fromId);

  const candidates = await prisma.user.findMany({
    where: {
      onboardingComplete: true,
      id: { notIn: Array.from(excluded) },
      incognito: false,
    },
    include: { photos: { orderBy: { sort: "asc" }, take: 1 } },
  });

  const cards: MatchCard[] = [];

  for (const c of candidates) {
    const candProfile = toAlignmentProfile(c);
    if (!candProfile) continue;

    // Gate BEFORE scoring.
    if (!passesGenderGate(viewerProfile, candProfile)) continue;
    if (!passesConnectionGate(viewerProfile.connection, candProfile.connection))
      continue;

    // Refine filters.
    const age = c.dob ? ageFromDob(c.dob) : null;
    if (filters.connection && filters.connection !== "both") {
      // candidate must be open to the requested connection type
      if (
        candProfile.connection !== "both" &&
        candProfile.connection !== filters.connection
      )
        continue;
    }
    if (age != null) {
      if (filters.minAge && age < filters.minAge) continue;
      if (filters.maxAge && age > filters.maxAge) continue;
    }
    if (c.heightCm != null) {
      if (filters.minHeight && c.heightCm < filters.minHeight) continue;
      if (filters.maxHeight && c.heightCm > filters.maxHeight) continue;
    }

    // Proximity: distance from the search centre, and radius filtering.
    let distanceKm: number | null = null;
    if (center && c.locationLat != null && c.locationLon != null) {
      distanceKm = Math.round(
        haversineKm(center.lat, center.lon, c.locationLat, c.locationLon),
      );
    }
    if (filters.maxKm != null) {
      // With a radius set, require a known location within it.
      if (distanceKm == null || distanceKm > filters.maxKm) continue;
    }

    const alignment: Alignment = computeAlignment(
      viewerProfile,
      candProfile,
      plus,
    );

    const isDestined = alignment.tier.key === "destined";
    cards.push({
      id: c.id,
      name: c.name ?? "Someone",
      age,
      essence: c.essence,
      photoUrl: c.photos[0]?.url ?? null,
      photoCrop: c.photos[0]?.crop ?? null,
      verified: c.verified,
      score: alignment.score,
      tierKey: alignment.tier.key,
      tierName: alignment.tier.name,
      tierColor: alignment.tier.color,
      distanceKm,
      locked: isDestined && !plus,
    });
  }

  // Highest alignment first.
  cards.sort((a, b) => b.score - a.score);

  // Free tier: "a few curated alignments daily" — but always keep locked
  // Destined cards visible (the upsell), trimming only unlocked overflow.
  if (!plus) {
    const locked = cards.filter((c) => c.locked);
    const unlocked = cards.filter((c) => !c.locked).slice(0, FREE_VISIBLE_LIMIT);
    return [...locked, ...unlocked].sort((a, b) => b.score - a.score);
  }

  return cards;
}

export { parseInterests };
