"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

/**
 * Switch the member's plan. In production this is gated behind a completed
 * payment (Stripe etc.); here it updates the plan directly so the freemium
 * gating and Aligned+ reading can be experienced end-to-end.
 */
export async function setPlan(plan: "aligned" | "aligned_plus" | "destined") {
  const userId = await getUserId();
  if (!userId) return { ok: false };
  await prisma.user.update({ where: { id: userId }, data: { plan } });
  revalidatePath("/plans");
  revalidatePath("/discover");
  return { ok: true };
}
