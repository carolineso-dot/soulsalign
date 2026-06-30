"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OrbitEmblem } from "@/components/OrbitEmblem";

export function VerifyFlow({ alreadyVerified }: { alreadyVerified: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyVerified);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("selfie", file);
      const res = await fetch("/api/verify", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Verification failed.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/you"), 1800);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <OrbitEmblem size={150} />
        <div>
          <p className="label-eyebrow">Verified</p>
          <h2 className="mt-2 font-serif text-2xl text-ink">You&rsquo;re verified</h2>
          <p className="mt-2 max-w-xs text-sm text-clay">
            Your badge is live. Your birth details are now locked to keep every
            alignment true.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <OrbitEmblem size={120} />
      <div>
        <p className="label-eyebrow">Verification</p>
        <h2 className="mt-2 font-serif text-2xl text-ink">A quick selfie</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-clay">
          This confirms you&rsquo;re really you — and earns your Verified badge.
          A considered community begins with trust.
        </p>
      </div>

      <div className="w-full max-w-xs rounded-2xl border border-hairline bg-white/40 p-4 text-left text-xs leading-relaxed text-clay">
        Once verified, your birth details lock permanently. They anchor every
        alignment, so make sure they&rsquo;re right before you continue.
      </div>

      {error && <p className="text-sm text-claret">{error}</p>}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="btn btn-primary w-full max-w-xs px-6 py-3.5"
      >
        {busy ? "Verifying…" : "Take a selfie"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
