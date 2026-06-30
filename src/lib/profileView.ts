import "server-only";
import { prisma } from "./db";
import { computeAlignment, passesGenderGate } from "./matching";
import { hasPlus } from "./plans";
import { ageFromDob, parseInterests, threadKey, toAlignmentProfile } from "./profile";
import { Alignment } from "./matching";

export type ProfileView = {
  id: string;
  name: string;
  age: number | null;
  essence: string | null;
  bio: string | null;
  interests: string[];
  photos: string[];
  heightCm: number | null;
  verified: boolean;
  sunSign: string | null;
  moonSign: string | null;
  risingSign: string | null;
  baziElement: string | null;
  zodiacAnimal: string | null;
  alignment: Alignment;
  /** Viewer relationship state. */
  hasSentInterest: boolean;
  isMutual: boolean;
  /** True when this is a Destined profile a free viewer cannot fully open. */
  lockedForFree: boolean;
};

type Viewer = Parameters<typeof toAlignmentProfile>[0] & {
  id: string;
  plan: string | null;
};

/**
 * Build the full match-profile view for `targetId` as seen by `viewer`.
 * Returns null if the target doesn't exist, is blocked, or fails the gate.
 */
export async function getProfileView(
  viewer: Viewer,
  targetId: string,
): Promise<ProfileView | null> {
  if (targetId === viewer.id) return null;

  const viewerProfile = toAlignmentProfile(viewer);
  if (!viewerProfile) return null;

  // Blocked either way → invisible.
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: viewer.id, blockedId: targetId },
        { blockerId: targetId, blockedId: viewer.id },
      ],
    },
  });
  if (block) return null;

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    include: { photos: { orderBy: { sort: "asc" } } },
  });
  if (!target || !target.onboardingComplete) return null;

  const targetProfile = toAlignmentProfile(target);
  if (!targetProfile) return null;

  // Mutual gender gate.
  if (!passesGenderGate(viewerProfile, targetProfile)) return null;

  const plus = hasPlus(viewer.plan);
  const alignment = computeAlignment(viewerProfile, targetProfile, plus);
  const lockedForFree = alignment.tier.key === "destined" && !plus;

  const key = threadKey(viewer.id, targetId);
  const [sent, received] = await Promise.all([
    prisma.interest.findUnique({
      where: { fromId_toId: { fromId: viewer.id, toId: targetId } },
    }),
    prisma.interest.findUnique({
      where: { fromId_toId: { fromId: targetId, toId: viewer.id } },
    }),
  ]);
  void key;

  return {
    id: target.id,
    name: target.name ?? "Someone",
    age: target.dob ? ageFromDob(target.dob) : null,
    essence: target.essence,
    bio: target.bio,
    interests: parseInterests(target.interests),
    photos: target.photos.map((p) => p.url),
    heightCm: target.heightCm,
    verified: target.verified,
    sunSign: target.sunSign,
    moonSign: plus ? target.moonSign : null,
    risingSign: plus ? target.risingSign : null,
    baziElement: target.baziElement,
    zodiacAnimal: target.zodiacAnimal,
    alignment,
    hasSentInterest: !!sent,
    isMutual: !!sent && !!received,
    lockedForFree,
  };
}
