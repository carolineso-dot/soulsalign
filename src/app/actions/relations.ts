"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { threadKey } from "@/lib/profile";

export type InterestResult = { ok: boolean; matched: boolean; error?: string };

/** Express interest in someone. Returns matched=true when it becomes mutual. */
export async function expressInterest(targetId: string): Promise<InterestResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, matched: false, error: "Not signed in." };
  if (userId === targetId) return { ok: false, matched: false };

  // Don't allow interest toward someone in a block relationship.
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: targetId },
        { blockerId: targetId, blockedId: userId },
      ],
    },
  });
  if (block) return { ok: false, matched: false, error: "Unavailable." };

  await prisma.interest.upsert({
    where: { fromId_toId: { fromId: userId, toId: targetId } },
    create: { fromId: userId, toId: targetId, status: "pending" },
    update: {},
  });

  const reciprocal = await prisma.interest.findUnique({
    where: { fromId_toId: { fromId: targetId, toId: userId } },
  });

  // Choosing someone who already chose you = accepting their request → mutual.
  if (reciprocal && reciprocal.status === "pending") {
    await prisma.interest.update({
      where: { fromId_toId: { fromId: targetId, toId: userId } },
      data: { status: "accepted" },
    });
  }

  revalidatePath(`/profile/${targetId}`);
  revalidatePath("/discover");
  revalidatePath("/chosen");
  revalidatePath("/chat");
  return { ok: true, matched: !!reciprocal };
}

/** Accept an incoming chat request: reciprocate interest → becomes an active chat. */
export async function acceptRequest(fromId: string): Promise<InterestResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, matched: false, error: "Not signed in." };

  const incoming = await prisma.interest.findUnique({
    where: { fromId_toId: { fromId, toId: userId } },
  });
  if (!incoming) return { ok: false, matched: false, error: "No request." };

  await prisma.$transaction([
    prisma.interest.update({
      where: { fromId_toId: { fromId, toId: userId } },
      data: { status: "accepted" },
    }),
    prisma.interest.upsert({
      where: { fromId_toId: { fromId: userId, toId: fromId } },
      create: { fromId: userId, toId: fromId, status: "accepted" },
      update: { status: "accepted" },
    }),
  ]);

  revalidatePath("/chat");
  return { ok: true, matched: true };
}

/** Decline an incoming chat request: hide it (won't resurface in Aligned). */
export async function declineRequest(fromId: string): Promise<SafetyResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Not signed in." };
  await prisma.interest.updateMany({
    where: { fromId, toId: userId },
    data: { status: "declined" },
  });
  revalidatePath("/chat");
  return { ok: true };
}

export type SafetyResult = { ok: boolean; error?: string };

/** Report someone, with reason + optional detail. */
export async function reportUser(
  reportedId: string,
  reason: string,
  detail?: string,
): Promise<SafetyResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Not signed in." };
  await prisma.report.create({
    data: { reporterId: userId, reportedId, reason, detail: detail || null },
  });
  return { ok: true };
}

/** General "report an issue" (not about a specific person). */
export async function reportIssue(
  reason: string,
  detail?: string,
): Promise<SafetyResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Not signed in." };
  await prisma.report.create({
    data: { reporterId: userId, reportedId: null, reason, detail: detail || null },
  });
  return { ok: true };
}

/**
 * Block & unmatch: hides both people from each other everywhere and removes any
 * expressed interest in both directions.
 */
export async function blockAndUnmatch(targetId: string): Promise<SafetyResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  await prisma.$transaction([
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } },
      create: { blockerId: userId, blockedId: targetId },
      update: {},
    }),
    prisma.interest.deleteMany({
      where: {
        OR: [
          { fromId: userId, toId: targetId },
          { fromId: targetId, toId: userId },
        ],
      },
    }),
  ]);

  revalidatePath("/discover");
  revalidatePath("/chat");
  return { ok: true };
}

export { threadKey };
