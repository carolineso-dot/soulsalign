"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { forceMatch } from "@/app/actions/test";

/**
 * TEST MODE ONLY. Force-matches with a profile and opens the conversation,
 * bypassing the normal mutual-interest requirement. The server action refuses
 * unless test mode is enabled, so this is inert in production.
 */
export function TestChatButton({ targetId }: { targetId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onClick = () => {
    startTransition(async () => {
      const res = await forceMatch(targetId);
      if (res.ok) router.push(`/chat/${targetId}`);
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="btn w-full border border-dashed px-6 py-3 text-sm"
      style={{ borderColor: "#8c857a", color: "#8c857a", background: "transparent" }}
    >
      {pending ? "Matching…" : "⚙ Test chat (dev only)"}
    </button>
  );
}
