import "server-only";
import { prisma } from "./db";
import { hasPlus } from "./plans";
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
  verified: boolean;
  score: number;
  tierKey: TierKey;
  tierName: string;
  tierColor: string;
  /** True when this Destined match is gated behind Aligned+ for a free viewer. */
  locked: boolean;
};

export type RefineFilters = {
  connection?: "romance" | "friendship" | "both";
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
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

  // Everyone the viewer has blocked, or who has blocked the viewer, is excluded.
  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: viewer.id }, { blockedId: viewer.id }] },
    select: { blockerId: true, blockedId: true },
  });
  const excluded = new Set<string>([viewer.id]);
  for (const b of blocks) {
    excluded.add(b.blockerId);
    excluded.add(b.blockedId);
  }

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
      verified: c.verified,
      score: alignment.score,
      tierKey: alignment.tier.key,
      tierName: alignment.tier.name,
      tierColor: alignment.tier.color,
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
