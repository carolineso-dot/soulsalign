"use client";

import { useState } from "react";
import {
  CropData,
  PROFILE_ASPECT,
  focalObjectPosition,
  frameImageStyle,
} from "@/lib/crop";

type Common = {
  src?: string | null;
  name: string;
  crop?: CropData | null;
  className?: string;
};

type ProfileImageProps =
  | (Common & { shape?: "frame"; aspect?: number; rounded?: string })
  | (Common & { shape: "circle"; size: number });

/**
 * Renders a profile photo with the saved crop applied via CSS transforms, and
 * an elegant duotone initial fallback if the image is missing or fails to load.
 *
 *  - shape="frame": a portrait aspect box; the crop rect is reproduced exactly.
 *  - shape="circle": a round avatar; the crop's focal point is centred (cover).
 */
const GRADIENT = "linear-gradient(140deg, #2f2535 0%, #7e3340 120%)";

/** Duotone initial fallback — module-level so it isn't recreated each render. */
function Fallback({
  initial,
  fontSize,
}: {
  initial: string;
  fontSize: number | string;
}) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: GRADIENT }}
    >
      <span
        className="font-serif font-medium text-ivory"
        style={{ fontSize, letterSpacing: "0.04em" }}
      >
        {initial}
      </span>
    </div>
  );
}

export function ProfileImage(props: ProfileImageProps) {
  const { src, name, crop, className = "" } = props;
  const [failed, setFailed] = useState(false);
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  const showImg = src && !failed;

  const gradient = GRADIENT;

  if (props.shape === "circle") {
    const size = props.size;
    return (
      <div
        className={`relative overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size, background: gradient }}
      >
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={name}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
            style={{ objectPosition: focalObjectPosition(crop ?? null) }}
          />
        ) : (
          <Fallback initial={initial} fontSize={size * 0.42} />
        )}
      </div>
    );
  }

  const aspect = props.aspect ?? PROFILE_ASPECT;
  const rounded = props.rounded ?? "1.25rem";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: String(aspect),
        borderRadius: rounded,
        background: gradient,
        containerType: "inline-size",
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={name}
          onError={() => setFailed(true)}
          className={crop ? "" : "absolute inset-0 h-full w-full object-cover"}
          style={crop ? frameImageStyle(crop) : undefined}
        />
      ) : (
        <Fallback initial={initial} fontSize="42cqw" />
      )}
    </div>
  );
}
