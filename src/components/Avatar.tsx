"use client";

import { useState } from "react";

type AvatarProps = {
  src?: string | null;
  name: string;
  /** Square edge in px. */
  size?: number;
  rounded?: "full" | "card";
  className?: string;
};

/**
 * Photo with a graceful fallback. If the image is missing or fails to load,
 * renders an elegant initials avatar on an aubergine→claret wash so a profile
 * is never blank — addresses the known "broken image" pitfall.
 */
export function Avatar({
  src,
  name,
  size = 56,
  rounded = "full",
  className = "",
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const radius = rounded === "full" ? "9999px" : "1rem";
  const showImg = src && !failed;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background:
          "linear-gradient(140deg, #2f2535 0%, #7e3340 120%)",
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="font-serif font-medium text-ivory"
          style={{ fontSize: size * 0.36, letterSpacing: "0.04em" }}
        >
          {initials || "?"}
        </span>
      )}
    </div>
  );
}
