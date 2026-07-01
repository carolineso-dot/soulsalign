import "server-only";
import { prisma } from "./db";
import { hasPlus } from "./plans";
import { computeAlignment } from "./matching";
import { ageFromDob, threadKey, toAlignmentProfile } from "./profile";
import { haversineKm } from "./geo";
import { TierKey } from "./tiers";

export type PersonCard = {
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
  distanceKm: number | null;
  lastMessage?: string | null;
};

type ViewerLike = Parameters<typeof toAlignmentProfile>[0] & {
  id: string;
  plan: string | null;
  locationLat: number | null;
  locationLon: number | null;
};

type UserRow = {
  id: string;
  name: string | null;
  dob: Date | null;
  essence: string | null;
  verified: boolean;
  locationLat: number | null;
  locationLon: number | null;
  photos: { url: string; crop: string | null }[];
} & Parameters<typeof toAlignmentProfile>[0];

function makeCard(
  viewer: ViewerLike,
  viewerProfile: NonNullable<ReturnType<typeof toAlignmentProfile>>,
  plus: boolean,
  center: { lat: number; lon: number } | null,
  cand: UserRow,
): PersonCard | null {
  const cp = toAlignmentProfile(cand);
  if (!cp) return null;
  const alignment = computeAlignment(viewerProfile, cp, plus);
  let distanceKm: number | null = null;
  if (center && cand.locationLat != null && cand.locationLon != null) {
    distanceKm = Math.round(
      haversineKm(center.lat, center.lon, cand.locationLat, cand.locationLon),
    );
  }
  return {
    id: cand.id,
    name: cand.name ?? "Someone",
    age: cand.dob ? ageFromDob(cand.dob) : null,
    essence: cand.essence,
    photoUrl: cand.photos[0]?.url ?? null,
    photoCrop: cand.photos[0]?.crop ?? null,
    verified: cand.verified,
    score: alignment.score,
    tierKey: alignment.tier.key,
    tierName: alignment.tier.name,
    tierColor: alignment.tier.color,
    distanceKm,
  };
}

async function context(viewer: ViewerLike) {
  const viewerProfile = toAlignmentProfile(viewer);
  const plus = hasPlus(viewer.plan);
  const center =
    viewer.locationLat != null && viewer.locationLon != null
      ? { lat: viewer.locationLat, lon: viewer.locationLon }
      : null;
  return { viewerProfile, plus, center };
}

/** Fetch a card-ready user (primary photo first). */
function fetchCardUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { photos: { orderBy: [{ isPrimary: "desc" }, { sort: "asc" }], take: 1 } },
  });
}

/** Whether any message exists in the pair. */
async function pairHasMessages(a: string, b: string): Promise<boolean> {
  const n = await prisma.message.count({ where: { threadKey: threadKey(a, b) } });
  return n > 0;
}

/**
 * CHOSEN: people the viewer has expressed interest in, but hasn't started
 * chatting with yet and who aren't already a mutual/active conversation.
 */
export async function getChosen(viewer: ViewerLike): Promise<PersonCard[]> {
  const { viewerProfile, plus, center } = await context(viewer);
  if (!viewerProfile) return [];

  const out = await prisma.interest.findMany({
    where: { fromId: viewer.id, status: { not: "declined" } },
    orderBy: { createdAt: "desc" },
  });
  if (out.length === 0) return [];

  const inbound = await prisma.interest.findMany({
    where: { toId: viewer.id, fromId: { in: out.map((o) => o.toId) } },
    select: { fromId: true },
  });
  const mutualIds = new Set(inbound.map((i) => i.fromId));

  const cards: PersonCard[] = [];
  for (const o of out) {
    if (mutualIds.has(o.toId)) continue; // mutual → it's a chat, not chosen
    if (await pairHasMessages(viewer.id, o.toId)) continue; // started → chat
    const cand = await fetchCardUser(o.toId);
    if (!cand || !cand.onboardingComplete) continue;
    const card = makeCard(viewer, viewerProfile, plus, center, cand);
    if (card) cards.push(card);
  }
  return cards;
}

export type ChatData = {
  active: PersonCard[];
  requests: PersonCard[];
};

/**
 * CHATS: active conversations (viewer started chatting, or it's mutual) plus
 * incoming chat requests (someone chose the viewer; awaiting accept/decline).
 */
export async function getChatData(viewer: ViewerLike): Promise<ChatData> {
  const { viewerProfile, plus, center } = await context(viewer);
  if (!viewerProfile) return { active: [], requests: [] };

  // Exclude blocked pairs.
  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: viewer.id }, { blockedId: viewer.id }] },
    select: { blockerId: true, blockedId: true },
  });
  const blocked = new Set<string>();
  for (const b of blocks) {
    blocked.add(b.blockerId);
    blocked.add(b.blockedId);
  }

  const out = await prisma.interest.findMany({ where: { fromId: viewer.id } });
  const inbound = await prisma.interest.findMany({ where: { toId: viewer.id } });
  const outIds = new Set(out.map((o) => o.toId));

  const active: { card: PersonCard; at: number }[] = [];
  const requests: PersonCard[] = [];

  // Active: for each iOut, active if mutual OR messages exist.
  for (const o of out) {
    if (blocked.has(o.toId)) continue;
    const mutual = inbound.some((i) => i.fromId === o.toId);
    const hasMsg = await pairHasMessages(viewer.id, o.toId);
    if (!mutual && !hasMsg) continue; // still "chosen", not a chat yet
    const cand = await fetchCardUser(o.toId);
    if (!cand || !cand.onboardingComplete) continue;
    const card = makeCard(viewer, viewerProfile, plus, center, cand);
    if (!card) continue;
    const last = await prisma.message.findFirst({
      where: { threadKey: threadKey(viewer.id, o.toId) },
      orderBy: { createdAt: "desc" },
    });
    card.lastMessage = last?.body ?? null;
    active.push({ card, at: last?.createdAt.getTime() ?? 0 });
  }

  // Requests: incoming pending interest with no outgoing interest from viewer.
  for (const i of inbound) {
    if (blocked.has(i.fromId)) continue;
    if (i.status !== "pending") continue;
    if (outIds.has(i.fromId)) continue; // already reciprocated → in active
    const cand = await fetchCardUser(i.fromId);
    if (!cand || !cand.onboardingComplete) continue;
    const card = makeCard(viewer, viewerProfile, plus, center, cand);
    if (card) requests.push(card);
  }

  active.sort((a, b) => b.at - a.at);
  return { active: active.map((a) => a.card), requests };
}

/** IDs of everyone the viewer has any interest relationship with (either way). */
export async function relatedUserIds(viewerId: string): Promise<Set<string>> {
  const [out, inbound] = await Promise.all([
    prisma.interest.findMany({ where: { fromId: viewerId }, select: { toId: true } }),
    prisma.interest.findMany({ where: { toId: viewerId }, select: { fromId: true } }),
  ]);
  const s = new Set<string>();
  out.forEach((o) => s.add(o.toId));
  inbound.forEach((i) => s.add(i.fromId));
  return s;
}
