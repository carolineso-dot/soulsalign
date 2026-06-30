import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Selfie verification. In production this would route the selfie to a liveness /
 * face-match provider; here we accept a valid selfie image, grant the Verified
 * badge, and permanently lock the member's birth details.
 */
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("selfie");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please provide a selfie." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Please use a photo (JPEG or PNG)." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 8 MB)." }, { status: 400 });
  }

  // The selfie is processed transiently; we store only the verification outcome.
  await prisma.user.update({
    where: { id: userId },
    data: { verified: true, birthLocked: true },
  });

  return NextResponse.json({ ok: true });
}
