"use client";

import { useRouter } from "next/navigation";
import { OrbitEmblem } from "@/components/OrbitEmblem";

export function Celebration({
  targetId,
  targetName,
  tierName,
  tierNote,
  tierColor,
}: {
  targetId: string;
  targetName: string;
  tierName: string;
  tierNote: string;
  tierColor: string;
}) {
  const router = useRouter();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-8 text-center">
      <div className="animate-fade-up">
        <OrbitEmblem size={220} />
      </div>

      <div className="animate-fade-up">
        <p className="label-eyebrow">{tierName}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">The souls align</h1>
        <p className="mt-3 max-w-xs font-serif text-lg leading-snug" style={{ color: tierColor }}>
          {tierNote}
        </p>
        <p className="mt-4 text-sm text-clay">
          You and {targetName} have found one another.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3 animate-fade-up">
        <button
          onClick={() => router.push(`/chat/${targetId}`)}
          className="btn btn-primary w-full px-6 py-3.5"
        >
          Begin the conversation
        </button>
        <button
          onClick={() => router.push("/discover")}
          className="btn btn-ghost w-full px-6 py-3.5"
        >
          Keep exploring
        </button>
      </div>
    </main>
  );
}
