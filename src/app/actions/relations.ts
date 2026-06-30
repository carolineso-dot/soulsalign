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
    create: { fromId: userId, toId: targetId },
    update: {},
  });

  const reciprocal = await prisma.interest.findUnique({
    where: { fromId_toId: { fromId: targetId, toId: userId } },
  });

  revalidatePath(`/profile/${targetId}`);
  return { ok: true, matched: !!reciprocal };
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
