"use client";

import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { CropData, PROFILE_ASPECT } from "@/lib/crop";

type CropModalProps = {
  /** Image to crop: a data URL (new upload) or the stored original URL (re-crop). */
  image: string;
  /** Existing crop to resume editing from (re-crop), if any. */
  initialCrop?: CropData | null;
  busy?: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: (crop: CropData) => void;
};

export function CropModal({
  image,
  initialCrop,
  busy = false,
  title = "Adjust your photo",
  onCancel,
  onConfirm,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialCrop?.zoom ?? 1);
  const [area, setArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((percent: Area) => {
    // We persist the PERCENT area (resolution-independent).
    setArea(percent);
  }, []);

  const confirm = () => {
    const a = area ??
      (initialCrop
        ? { x: initialCrop.x, y: initialCrop.y, width: initialCrop.width, height: initialCrop.height }
        : { x: 0, y: 0, width: 100, height: 100 });
    onConfirm({
      x: a.x,
      y: a.y,
      width: a.width,
      height: a.height,
      zoom,
      aspect: PROFILE_ASPECT,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-aubergine/90 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <header className="flex items-center justify-between px-5 py-4">
          <button onClick={onCancel} className="text-sm font-medium text-on-accent">
            Cancel
          </button>
          <span className="font-serif text-lg text-on-accent">{title}</span>
          <button
            onClick={confirm}
            disabled={busy}
            className="text-sm font-medium text-gold-soft disabled:opacity-50"
          >
            {busy ? "Saving…" : "Done"}
          </button>
        </header>

        {/* cropper stage */}
        <div className="relative flex-1">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            maxZoom={4}
            aspect={PROFILE_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            initialCroppedAreaPercentages={
              initialCrop
                ? {
                    x: initialCrop.x,
                    y: initialCrop.y,
                    width: initialCrop.width,
                    height: initialCrop.height,
                  }
                : undefined
            }
            objectFit="cover"
            showGrid
          />
        </div>

        {/* controls */}
        <div className="space-y-3 px-6 py-6">
          <p className="text-center text-xs text-on-accent/70">
            Drag to reposition · pinch or use the slider to zoom
          </p>
          <div className="flex items-center gap-3">
            <ZoomIcon small />
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-gold"
              aria-label="Zoom"
            />
            <ZoomIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoomIcon({ small = false }: { small?: boolean }) {
  const s = small ? 14 : 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#f4e3b4" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}
