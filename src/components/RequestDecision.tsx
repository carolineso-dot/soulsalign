"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptRequest, declineRequest } from "@/app/actions/relations";

/**
 * Accept/Decline controls shown on a profile when this person has sent the
 * viewer a chat request — so the viewer can review the profile and
 * compatibility before deciding.
 */
export function RequestDecision({
  targetId,
  targetName,
}: {
  targetId: string;
  targetName: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const accept = () =>
    startTransition(async () => {
      const res = await acceptRequest(targetId);
      if (res.ok) router.push(`/chat/${targetId}`);
    });

  const decline = () =>
    startTransition(async () => {
      await declineRequest(targetId);
      router.push("/chat");
    });

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-clay">
        {targetName} would like to connect with you.
      </p>
      <div className="flex gap-2">
        <button onClick={accept} disabled={pending} className="btn btn-primary flex-1 px-6 py-3.5">
          Accept
        </button>
        <button onClick={decline} disabled={pending} className="btn btn-ghost flex-1 px-6 py-3.5">
          Decline
        </button>
      </div>
    </div>
  );
}
