import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getThreadAccess, getThreadMessages } from "@/lib/chat";
import { toAlignmentProfile } from "@/lib/profile";
import { computeAlignment } from "@/lib/matching";
import { hasPlus } from "@/lib/plans";
import { ChatThread } from "./ChatThread";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  // You can view a conversation only with someone you've chosen (any state).
  const access = await getThreadAccess(user.id, id);
  if (!access.canView) redirect(`/profile/${id}`);

  const other = await prisma.user.findUnique({
    where: { id },
    include: {
      photos: { orderBy: [{ isPrimary: "desc" }, { sort: "asc" }], take: 1 },
    },
  });
  if (!other) redirect("/chat");

  const vp = toAlignmentProfile(user);
  const op = toAlignmentProfile(other);
  const alignment = vp && op ? computeAlignment(vp, op, hasPlus(user.plan)) : null;

  const messages = await getThreadMessages(user.id, id);

  return (
    <ChatThread
      otherId={other.id}
      otherName={other.name ?? "Someone"}
      otherPhoto={other.photos[0]?.url ?? null}
      otherCrop={other.photos[0]?.crop ?? null}
      tierName={alignment?.tier.name ?? "Aligned"}
      tierColor={alignment?.tier.color ?? "#8c857a"}
      initialMessages={messages}
      repliesAutomatically={other.isSeed}
      state={access.state}
      canSend={access.canSend}
    />
  );
}
