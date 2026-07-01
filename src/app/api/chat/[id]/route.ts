import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isBlockedPair, isMutualMatch } from "@/lib/chat";
import { threadKey, toAlignmentProfile } from "@/lib/profile";
import { computeAlignment } from "@/lib/matching";
import { hasPlus } from "@/lib/plans";
import { buildPersonaPrompt, fallbackReply } from "@/lib/persona";

const CHAT_MODEL = process.env.CHAT_MODEL || "claude-haiku-4-5-20251001";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: otherId } = await params;
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { message } = await req.json().catch(() => ({ message: "" }));
  const text = String(message ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  // Messaging is allowed only between mutual matches who aren't blocked.
  if (await isBlockedPair(viewer.id, otherId)) {
    return NextResponse.json({ error: "Unavailable." }, { status: 403 });
  }
  if (!(await isMutualMatch(viewer.id, otherId))) {
    return NextResponse.json({ error: "You can only message a match." }, { status: 403 });
  }

  const other = await prisma.user.findUnique({ where: { id: otherId } });
  if (!other) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const key = threadKey(viewer.id, otherId);

  // Persist the member's message.
  await prisma.message.create({
    data: { fromId: viewer.id, toId: otherId, body: text, threadKey: key },
  });

  // Compose the character's reply (only seeded characters reply automatically).
  let reply: string | null = null;

  if (other.isSeed) {
    const viewerProfile = toAlignmentProfile(viewer);
    const otherProfile = toAlignmentProfile(other);
    const alignment =
      viewerProfile && otherProfile
        ? computeAlignment(viewerProfile, otherProfile, hasPlus(viewer.plan))
        : null;

    const system = buildPersonaPrompt(other, {
      tierName: alignment?.tier.name ?? "Aligned",
      score: alignment?.score ?? 80,
      viewerName: viewer.name ?? "",
    });

    // Full conversation history for context.
    const history = await prisma.message.findMany({
      where: { threadKey: key },
      orderBy: { createdAt: "asc" },
      take: 40,
    });
    const messages = history.map((m) => ({
      role: (m.fromId === viewer.id ? "user" : "assistant") as "user" | "assistant",
      content: m.body,
    }));

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const res = await client.messages.create({
          model: CHAT_MODEL,
          max_tokens: 320,
          system,
          messages,
        });
        const block = res.content.find((b) => b.type === "text");
        reply = block && "text" in block ? block.text.trim() : null;
      } catch (err) {
        // Log the real reason (bad key, model access, rate limit, network…)
        // so a failing AI reply is diagnosable instead of silently canned.
        console.error("[chat] Anthropic request failed:", err);
        reply = null; // fall through to graceful fallback
      }
    } else {
      console.warn(
        "[chat] ANTHROPIC_API_KEY is not set — using the in-character fallback. " +
          "Add your key to .env and restart to enable real AI replies.",
      );
    }

    if (!reply) {
      // Rotate the fallback by how many replies this character has already sent.
      const priorReplies = messages.filter((m) => m.role === "assistant").length;
      reply = fallbackReply(other.name ?? "", priorReplies);
    }

    await prisma.message.create({
      data: { fromId: otherId, toId: viewer.id, body: reply, threadKey: key },
    });
  }

  return NextResponse.json({ reply });
}
