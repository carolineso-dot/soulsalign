"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrbitEmblem } from "@/components/OrbitEmblem";

export function Transition({ destination }: { destination: string }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const go = () => {
    if (leaving) return;
    setLeaving(true);
    router.replace(destination);
  };

  // Auto-advance after ~5s.
  useEffect(() => {
    const t = setTimeout(go, 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      onClick={go}
      aria-label="Continue"
      className={`mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-10 px-8 text-center transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-fade-up">
        <OrbitEmblem size={200} />
      </div>

      <p className="max-w-xs font-serif text-2xl leading-snug text-ink animate-fade-up">
        Let destiny put an end to the endless swipe.
      </p>

      <span className="label-eyebrow animate-fade-up">Tap to continue</span>
    </button>
  );
}
