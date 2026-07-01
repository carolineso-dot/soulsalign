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

export type ThreadState = "pending" | "accepted" | "declined";

export type ThreadAccess = {
  /** Whether the viewer may open the conversation view at all. */
  canView: boolean;
  /** Whether the viewer may send messages right now. */
  canSend: boolean;
  /** Relationship state from the viewer's perspective (null if no thread). */
  state: ThreadState | null;
};

/**
 * The viewer's access to a conversation with `other`. The viewer must have
 * chosen `other` (an outgoing interest) to view/initiate. `state` reflects the
 * recipient's decision on that request:
 *   pending  — the viewer chose them; awaiting the other's accept/decline
 *   accepted — reciprocated (or the other accepted); free to chat
 *   declined — the other declined; view-only, shows a notice, no sending
 */
export async function getThreadAccess(
  viewerId: string,
  otherId: string,
): Promise<ThreadAccess> {
  if (await isBlockedPair(viewerId, otherId)) {
    return { canView: false, canSend: false, state: null };
  }
  const out = await prisma.interest.findUnique({
    where: { fromId_toId: { fromId: viewerId, toId: otherId } },
  });
  if (!out) return { canView: false, canSend: false, state: null };

  const inb = await prisma.interest.findUnique({
    where: { fromId_toId: { fromId: otherId, toId: viewerId } },
  });
  const mutual = !!inb && inb.status !== "declined";

  let state: ThreadState;
  if (out.status === "declined") state = "declined";
  else if (mutual || out.status === "accepted") state = "accepted";
  else state = "pending";

  return { canView: true, canSend: state !== "declined", state };
}

/** Convenience: may the viewer send a message to `other` right now? */
export async function canMessage(viewerId: string, otherId: string): Promise<boolean> {
  return (await getThreadAccess(viewerId, otherId)).canSend;
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
  photoCrop: string | null;
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
    include: {
      photos: { orderBy: [{ isPrimary: "desc" }, { sort: "asc" }], take: 1 },
    },
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
        photoCrop: o.photos[0]?.crop ?? null,
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
