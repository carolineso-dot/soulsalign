"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { testModeEnabled } from "@/lib/testMode";
import { passesGenderGate, passesConnectionGate } from "@/lib/matching";
import { toAlignmentProfile } from "@/lib/profile";

export type TestResult = { ok: boolean; error?: string };

async function isBlocked(a: string, b: string): Promise<boolean> {
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

async function makeMutual(userId: string, targetId: string): Promise<void> {
  await prisma.$transaction([
    prisma.interest.upsert({
      where: { fromId_toId: { fromId: userId, toId: targetId } },
      create: { fromId: userId, toId: targetId },
      update: {},
    }),
    prisma.interest.upsert({
      where: { fromId_toId: { fromId: targetId, toId: userId } },
      create: { fromId: targetId, toId: userId },
      update: {},
    }),
  ]);
}

/**
 * TEST MODE ONLY. Instantly create a mutual match with any profile so the AI
 * chat can be exercised without the normal reciprocal-interest requirement.
 * Refuses outright unless test mode is enabled — production is unaffected.
 */
export async function forceMatch(targetId: string): Promise<TestResult> {
  if (!testModeEnabled()) return { ok: false, error: "Test mode is off." };

  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Not signed in." };
  if (userId === targetId) return { ok: false, error: "Cannot match yourself." };
  if (await isBlocked(userId, targetId)) return { ok: false, error: "Blocked." };

  await makeMutual(userId, targetId);
  revalidatePath(`/profile/${targetId}`);
  revalidatePath("/chat");
  return { ok: true };
}

/**
 * TEST MODE ONLY. On login, seed a couple of INCOMING chat requests (compatible
 * seed → the member, pending) so the Chats accept/decline flow is demoable.
 * No-op outside test mode. Idempotent; skips blocked pairs and anyone the member
 * already has a relationship with.
 */
export async function autoGrantTestMatches(
  userId: string,
  count = 2,
): Promise<void> {
  if (!testModeEnabled()) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.onboardingComplete) return;
  const vp = toAlignmentProfile(user);
  if (!vp) return;

  const seeds = await prisma.user.findMany({
    where: { isSeed: true, onboardingComplete: true },
    orderBy: { createdAt: "asc" },
  });

  let granted = 0;
  for (const s of seeds) {
    if (granted >= count) break;
    if (s.id === userId) continue;
    const sp = toAlignmentProfile(s);
    if (!sp) continue;
    if (!passesGenderGate(vp, sp)) continue;
    if (!passesConnectionGate(vp.connection, sp.connection)) continue;
    if (await isBlocked(userId, s.id)) continue;

    // Skip if any relationship already exists either direction.
    const existing = await prisma.interest.findFirst({
      where: {
        OR: [
          { fromId: s.id, toId: userId },
          { fromId: userId, toId: s.id },
        ],
      },
    });
    if (existing) continue;

    // Incoming pending request from the seed → appears in the member's Chats.
    await prisma.interest.create({
      data: { fromId: s.id, toId: userId, status: "pending" },
    });
    granted++;
  }
}
