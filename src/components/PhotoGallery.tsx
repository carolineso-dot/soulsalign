"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";

type PhotoGalleryProps = {
  photos: string[];
  name: string;
  /** Apply a blur (e.g. locked Destined profile). */
  blurred?: boolean;
};

export function PhotoGallery({ photos, name, blurred }: PhotoGalleryProps) {
  const [idx, setIdx] = useState(0);
  const list = photos.length > 0 ? photos : [""];
  const current = list[Math.min(idx, list.length - 1)];

  return (
    <div className="relative overflow-hidden rounded-[1.5rem]">
      <div className={blurred ? "blur-xl" : ""}>
        <Avatar
          src={current || null}
          name={name}
          size={9999}
          rounded="card"
          className="!h-[26rem] !w-full !rounded-[1.5rem]"
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
