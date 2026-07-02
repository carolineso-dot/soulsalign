"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProfileImage } from "./ProfileImage";
import { CropModal } from "./CropModal";
import { deletePhoto, setPrimaryPhoto, updatePhotoCrop } from "@/app/you/actions";
import { CropData, parseCrop } from "@/lib/crop";

export type EditablePhoto = {
  id: string;
  url: string;
  originalUrl: string | null;
  crop: string | null;
  isPrimary: boolean;
};

export function PhotoUploader({ photos }: { photos: EditablePhoto[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // New-upload crop state.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  // Re-crop state.
  const [recrop, setRecrop] = useState<EditablePhoto | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setError(null);
    setPendingFile(file);
    setPendingUrl(URL.createObjectURL(file));
  };

  const cancelNew = () => {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
  };

  const confirmNew = async (crop: CropData) => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", pendingFile);
      body.append("crop", JSON.stringify(crop));
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
      cancelNew();
    }
  };

  const confirmRecrop = (crop: CropData) => {
    if (!recrop) return;
    const id = recrop.id;
    setRecrop(null);
    startTransition(async () => {
      await updatePhotoCrop(id, JSON.stringify(crop));
      router.refresh();
    });
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative">
            <ProfileImage
              src={p.url}
              name="Photo"
              crop={parseCrop(p.crop)}
              shape="frame"
              className="w-full"
            />
            {p.isPrimary && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-claret px-2 py-0.5 text-[0.55rem] font-medium uppercase tracking-wider text-on-accent">
                Main
              </span>
            )}
            <div className="absolute inset-x-1.5 bottom-1.5 flex flex-wrap gap-1">
              <button
                onClick={() => setRecrop(p)}
                className="flex-1 rounded-full bg-ivory/90 py-1 text-[0.6rem] font-medium text-ink backdrop-blur"
              >
                Adjust
              </button>
              {!p.isPrimary && (
                <button
                  onClick={() => startTransition(() => setPrimaryPhoto(p.id).then(() => router.refresh()))}
                  className="flex-1 rounded-full bg-ivory/90 py-1 text-[0.6rem] font-medium text-ink backdrop-blur"
                >
                  Main
                </button>
              )}
              <button
                onClick={() => startTransition(() => deletePhoto(p.id).then(() => router.refresh()))}
                className="rounded-full bg-ivory/90 px-2 py-1 text-[0.6rem] font-medium text-claret backdrop-blur"
                aria-label="Remove photo"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* add tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || pending}
          className="flex flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-dashed border-hairline veil text-clay"
          style={{ aspectRatio: "4 / 5" }}
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

      {/* new-upload crop */}
      {pendingUrl && (
        <CropModal
          image={pendingUrl}
          busy={uploading}
          title="Position your photo"
          onCancel={cancelNew}
          onConfirm={confirmNew}
        />
      )}

      {/* re-crop existing */}
      {recrop && (
        <CropModal
          image={recrop.originalUrl ?? recrop.url}
          initialCrop={parseCrop(recrop.crop)}
          title="Adjust your photo"
          onCancel={() => setRecrop(null)}
          onConfirm={confirmRecrop}
        />
      )}
    </div>
  );
}
