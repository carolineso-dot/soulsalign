import "server-only";
import { prisma } from "./db";
import { threadKey, toAlignmentProfile, ageFromDob } from "./profile";
import { computeAlignment } from "./matching";
import { hasPlus } from "./plans";

/** True when two members have a mutual match (interest both ways). */
export async function isMutualMatch(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([
    prisma.interest.findUnique({ where: { fromId_toId: { fromId: a, toId: b } } }),
    prisma.interest.findUnique({ where: { fromId_toId: { fromId: b, toId: a } } }),
  ]);
  return !!x && !!y;
}

export async function isBlockedPair(a: string, b: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
  });
  return !!block;
}

export type ConversationSummary = {
  id: string;
  name: string;
  photoUrl: string | null;
  lastMessage: string | null;
  tierName: string;
  tierColor: string;
};

/** All of a member's mutual matches, newest-message first, for the chat list. */
export async function getConversations(
  viewer: Parameters<typeof toAlignmentProfile>[0] & { id: string; plan: string | null },
): Promise<ConversationSummary[]> {
  const viewerProfile = toAlignmentProfile(viewer);
  if (!viewerProfile) return [];
  const plus = hasPlus(viewer.plan);

  // Mutual = I expressed interest in them AND they in me.
  const [sent, got] = await Promise.all([
    prisma.interest.findMany({ where: { fromId: viewer.id }, select: { toId: true } }),
    prisma.interest.findMany({ where: { toId: viewer.id }, select: { fromId: true } }),
  ]);
  const sentSet = new Set(sent.map((s) => s.toId));
  const mutualIds = got.map((g) => g.fromId).filter((id) => sentSet.has(id));
  if (mutualIds.length === 0) return [];

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: viewer.id }, { blockedId: viewer.id }] },
    select: { blockerId: true, blockedId: true },
  });
  const blocked = new Set<string>();
  for (const b of blocks) {
    blocked.add(b.blockerId);
    blocked.add(b.blockedId);
  }

  const others = await prisma.user.findMany({
    where: { id: { in: mutualIds.filter((id) => !blocked.has(id)) } },
    include: { photos: { where: { isPrimary: true }, take: 1 } },
  });

  const summaries: { s: ConversationSummary; at: number }[] = [];
  for (const o of others) {
    const last = await prisma.message.findFirst({
      where: { threadKey: threadKey(viewer.id, o.id) },
      orderBy: { createdAt: "desc" },
    });
    const op = toAlignmentProfile(o);
    const alignment = op ? computeAlignment(viewerProfile, op, plus) : null;
    summaries.push({
      at: last?.createdAt.getTime() ?? 0,
      s: {
        id: o.id,
        name: o.name ?? "Someone",
        photoUrl: o.photos[0]?.url ?? null,
        lastMessage: last?.body ?? null,
        tierName: alignment?.tier.name ?? "Aligned",
        tierColor: alignment?.tier.color ?? "#8c857a",
      },
    });
  }

  summaries.sort((a, b) => b.at - a.at);
  return summaries.map((x) => x.s);
}

export type ThreadMessage = {
  id: string;
  mine: boolean;
  body: string;
};

export async function getThreadMessages(
  viewerId: string,
  otherId: string,
): Promise<ThreadMessage[]> {
  const msgs = await prisma.message.findMany({
    where: { threadKey: threadKey(viewerId, otherId) },
    orderBy: { createdAt: "asc" },
  });
  return msgs.map((m) => ({ id: m.id, mine: m.fromId === viewerId, body: m.body }));
}

export { threadKey, ageFromDob };
