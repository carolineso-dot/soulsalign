"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { expressInterest } from "@/app/actions/relations";

export function ExpressInterest({
  targetId,
  initialSent,
  initialMatched,
}: {
  targetId: string;
  initialSent: boolean;
  initialMatched: boolean;
}) {
  const [sent, setSent] = useState(initialSent);
  const [matched, setMatched] = useState(initialMatched);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (matched) {
    return (
      <button
        onClick={() => router.push(`/chat/${targetId}`)}
        className="btn btn-primary w-full px-6 py-3.5"
      >
        Open conversation
      </button>
    );
  }

  // Already chosen — invite the user to begin the conversation.
  if (sent) {
    return (
      <div className="space-y-2">
        <p className="text-center text-xs text-clay">
          Chosen — they&rsquo;re in your Chosen list.
        </p>
        <button
          onClick={() => router.push(`/chat/${targetId}`)}
          className="btn btn-primary w-full px-6 py-3.5"
        >
          Start conversation
        </button>
      </div>
    );
  }

  const onClick = () => {
    startTransition(async () => {
      const res = await expressInterest(targetId);
      if (res.ok) {
        setSent(true);
        if (res.matched) {
          setMatched(true);
          router.push(`/match/${targetId}`);
        }
      }
    });
  };

  return (
    <button onClick={onClick} disabled={pending} className="btn btn-primary w-full px-6 py-3.5">
      {pending ? "Choosing…" : "Choose"}
    </button>
  );
}
