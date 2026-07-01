"use client";

import { useState } from "react";
import { ProfileImage } from "./ProfileImage";
import { parseCrop } from "@/lib/crop";

type GalleryPhoto = { url: string; crop: string | null };

type PhotoGalleryProps = {
  photos: GalleryPhoto[];
  name: string;
  /** Apply a blur (e.g. locked Destined profile). */
  blurred?: boolean;
};

export function PhotoGallery({ photos, name, blurred }: PhotoGalleryProps) {
  const [idx, setIdx] = useState(0);
  const list = photos.length > 0 ? photos : [{ url: "", crop: null }];
  const current = list[Math.min(idx, list.length - 1)];

  return (
    <div className="relative overflow-hidden rounded-[1.5rem]">
      <div className={blurred ? "blur-xl" : ""}>
        <ProfileImage
          src={current.url || null}
          name={name}
          crop={parseCrop(current.crop)}
          shape="frame"
          className="w-full"
          rounded="1.5rem"
        />
      </div>

      {/* tap zones to advance through photos */}
      {list.length > 1 && !blurred && (
        <>
          <button
            aria-label="Previous photo"
            onClick={() => setIdx((i) => (i - 1 + list.length) % list.length)}
            className="absolute inset-y-0 left-0 w-1/3"
          />
          <button
            aria-label="Next photo"
            onClick={() => setIdx((i) => (i + 1) % list.length)}
            className="absolute inset-y-0 right-0 w-1/3"
          />
          <div className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5">
            {list.map((_, i) => (
              <span
                key={i}
                className="h-1 w-6 rounded-full"
                style={{
                  backgroundColor:
                    i === idx ? "#fbf9f5" : "rgba(251,249,245,0.4)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
