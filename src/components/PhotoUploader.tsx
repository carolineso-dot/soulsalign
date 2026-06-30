"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { deletePhoto, setPrimaryPhoto } from "@/app/you/actions";

export type EditablePhoto = { id: string; url: string; isPrimary: boolean };

export function PhotoUploader({ photos }: { photos: EditablePhoto[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/photos", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Upload failed.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative">
            <Avatar src={p.url} name="Photo" size={9999} rounded="card" className="!h-32 !w-full" />
            {p.isPrimary && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-claret px-2 py-0.5 text-[0.55rem] font-medium uppercase tracking-wider text-ivory">
                Main
              </span>
            )}
            <div className="absolute inset-x-1.5 bottom-1.5 flex gap-1.5">
              {!p.isPrimary && (
                <button
                  onClick={() => startTransition(() => setPrimaryPhoto(p.id).then(() => router.refresh()))}
                  className="flex-1 rounded-full bg-ivory/85 py-1 text-[0.6rem] font-medium text-ink backdrop-blur"
                >
                  Set main
                </button>
              )}
              <button
                onClick={() => startTransition(() => deletePhoto(p.id).then(() => router.refresh()))}
                className="rounded-full bg-ivory/85 px-2 py-1 text-[0.6rem] font-medium text-claret backdrop-blur"
                aria-label="Remove photo"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* add tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || pending}
          className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-hairline bg-white/40 text-clay"
        >
          {uploading ? (
            <span className="text-xs">Uploading…</span>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[0.65rem]">Add photo</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onPick}
        className="hidden"
      />
      {error && <p className="mt-2 text-sm text-claret">{error}</p>}
    </div>
  );
}
