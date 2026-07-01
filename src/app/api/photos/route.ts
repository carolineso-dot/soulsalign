import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { saveImage } from "@/lib/storage";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB original
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DISPLAY_WIDTH = 1080;

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const cropRaw = form.get("crop");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 15 MB)." }, { status: 400 });
  }

  // Validate/normalize the crop JSON if present.
  let cropJson: string | null = null;
  if (typeof cropRaw === "string" && cropRaw) {
    try {
      const c = JSON.parse(cropRaw);
      if (["x", "y", "width", "height"].every((k) => typeof c[k] === "number")) {
        cropJson = JSON.stringify(c);
      }
    } catch {
      /* ignore malformed crop; fall back to no crop */
    }
  }

  const original = Buffer.from(await file.arrayBuffer());

  // Keep the full-resolution original (for future re-cropping) and generate a
  // downscaled, orientation-baked display version for fast loading everywhere.
  const originalSaved = await saveImage(original, file.type);
  const displayBuffer = await sharp(original)
    .rotate() // bake EXIF orientation so CSS crop math is consistent
    .resize({ width: DISPLAY_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const displaySaved = await saveImage(displayBuffer, "image/jpeg");

  const count = await prisma.photo.count({ where: { userId } });
  const photo = await prisma.photo.create({
    data: {
      userId,
      url: displaySaved.url,
      originalUrl: originalSaved.url,
      crop: cropJson,
      sort: count,
      isPrimary: count === 0,
    },
  });

  return NextResponse.json({
    photo: {
      id: photo.id,
      url: photo.url,
      originalUrl: photo.originalUrl,
      crop: photo.crop,
      isPrimary: photo.isPrimary,
    },
  });
}
