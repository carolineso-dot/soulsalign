import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { computeAlignment, passesGenderGate } from "@/lib/matching";
import { toAlignmentProfile } from "@/lib/profile";
import { hasPlus } from "@/lib/plans";
import {
  StoryInput,
  buildStorySystem,
  buildStoryUser,
  fallbackStory,
} from "@/lib/story";

const STORY_MODEL = process.env.CHAT_MODEL || "claude-haiku-4-5-20251001";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  const vp = toAlignmentProfile(viewer);
  const tp = target ? toAlignmentProfile(target) : null;
  if (!target || !vp || !tp || !passesGenderGate(vp, tp)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const alignment = computeAlignment(vp, tp, hasPlus(viewer.plan));

  const input: StoryInput = {
    viewerName: viewer.name ?? "You",
    targetName: target.name ?? "They",
    viewerSun: viewer.sunSign,
    viewerElement: viewer.baziElement,
    viewerAnimal: viewer.zodiacAnimal,
    targetSun: target.sunSign,
    targetElement: target.baziElement,
    targetAnimal: target.zodiacAnimal,
    tierName: alignment.tier.name,
    score: alignment.score,
    dimensions: alignment.dimensions.map((d) => ({ label: d.label, score: d.score })),
  };

  let story: string | null = null;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const res = await client.messages.create({
        model: STORY_MODEL,
        max_tokens: 240,
        system: buildStorySystem(),
        messages: [{ role: "user", content: buildStoryUser(input) }],
      });
      const block = res.content.find((b) => b.type === "text");
      story = block && "text" in block ? block.text.trim() : null;
    } catch (err) {
      console.error("[story] Anthropic request failed:", err);
      story = null;
    }
  }

  if (!story) story = fallbackStory(input);

  return NextResponse.json({ story });
}
