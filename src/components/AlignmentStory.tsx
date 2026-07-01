"use client";

import { useEffect, useState } from "react";

/**
 * Fetches and shows the personal, narrative reflection on why two souls align.
 * Loads after render so the profile stays fast; degrades gracefully.
 */
export function AlignmentStory({ targetId }: { targetId: string }) {
  const [story, setStory] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/story/${targetId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (alive) setStory(d.story ?? null);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [targetId]);

  if (failed) return null;

  return (
    <div className="mt-6 border-t border-hairline pt-5">
      <p className="label-eyebrow text-center">Your story</p>
      {story ? (
        <p className="mt-3 text-center font-serif text-[1.05rem] leading-relaxed text-ink/90 animate-fade-up">
          {story}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <span className="mx-auto block text-center text-xs text-clay">
            Reading the stars…
          </span>
          <div className="mx-auto h-2 w-3/4 animate-pulse rounded-full bg-hairline" />
          <div className="mx-auto h-2 w-2/3 animate-pulse rounded-full bg-hairline" />
        </div>
      )}
    </div>
  );
}
