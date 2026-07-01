/**
 * Crop settings + display math. Pure module (client + server safe).
 *
 * We store the crop as react-easy-crop's native "cropped area in percentages"
 * ({ x, y, width, height } as 0–100 percentages of the source image), plus the
 * zoom and the aspect it was authored at. This representation is
 * resolution-independent and can be:
 *   - fed straight back into react-easy-crop (`initialCroppedAreaPercentages`)
 *     to resume editing, and
 *   - reproduced exactly with CSS transforms at any display size.
 */

/** App-wide profile photo aspect (portrait). Width / height. */
export const PROFILE_ASPECT = 4 / 5;

export type CropData = {
  x: number; // % — left of crop within the image
  y: number; // % — top of crop within the image
  width: number; // % — crop width
  height: number; // % — crop height
  zoom: number;
  aspect: number;
};

export function parseCrop(json: string | null | undefined): CropData | null {
  if (!json) return null;
  try {
    const c = JSON.parse(json);
    if (
      typeof c?.x === "number" &&
      typeof c?.y === "number" &&
      typeof c?.width === "number" &&
      typeof c?.height === "number"
    ) {
      return {
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        zoom: typeof c.zoom === "number" ? c.zoom : 1,
        aspect: typeof c.aspect === "number" ? c.aspect : PROFILE_ASPECT,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export type FrameStyle = {
  width: string;
  height: string;
  left: string;
  top: string;
  position: "absolute";
  maxWidth: "none";
};

/**
 * Exact CSS reproduction for a container whose aspect equals the crop's aspect:
 * size the image so the crop region fills the frame, then offset it so the
 * crop's top-left lands at the frame's top-left. Distortion-free because the
 * container aspect matches the crop aspect.
 */
export function frameImageStyle(crop: CropData): FrameStyle {
  const w = Math.max(crop.width, 0.0001);
  const h = Math.max(crop.height, 0.0001);
  return {
    position: "absolute",
    maxWidth: "none",
    width: `${100 / (w / 100)}%`,
    height: `${100 / (h / 100)}%`,
    left: `${(-crop.x * 100) / w}%`,
    top: `${(-crop.y * 100) / h}%`,
  };
}

/**
 * Focal object-position for cover-fit containers of a DIFFERENT aspect
 * (e.g. a small circular chat avatar): centre on the crop's midpoint. Good
 * enough for small avatars; the main frames use the exact reproduction above.
 */
export function focalObjectPosition(crop: CropData | null): string {
  if (!crop) return "50% 50%";
  const cx = crop.x + crop.width / 2;
  const cy = crop.y + crop.height / 2;
  return `${clamp(cx)}% ${clamp(cy)}%`;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
