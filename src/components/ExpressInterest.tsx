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

  if (sent) {
    return (
      <button disabled className="btn btn-ghost w-full px-6 py-3.5">
        Interest expressed
      </button>
    );
  }

  return (
    <button onClick={onClick} disabled={pending} className="btn btn-primary w-full px-6 py-3.5">
      {pending ? "Sending…" : "Express interest"}
    </button>
  );
}
