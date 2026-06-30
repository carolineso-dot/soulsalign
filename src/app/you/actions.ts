"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { destroySession, getUserId } from "@/lib/auth";
import { deleteImage } from "@/lib/storage";
import { computeChart } from "@/lib/ephemeris";
import { elementFromYear } from "@/lib/bazi";
import { animalFromYear } from "@/lib/zodiac";
import { lookupPlace } from "@/lib/geo";
import { ageFromDob } from "@/lib/profile";

export type EditState = { error?: string; ok?: boolean };

const schema = z.object({
  name: z.string().min(1, "Please keep a name.").max(60),
  bio: z.string().max(600).optional(),
  essence: z.string().max(140).optional(),
  interests: z.string().max(300).optional(),
  height: z.string().optional(),
  gender: z.enum(["woman", "man", "nonbinary"]),
  interestedIn: z.enum(["women", "men", "everyone"]),
  connection: z.enum(["romance", "friendship", "both"]),
  incognito: z.string().optional(),
  // birth fields (only honoured pre-verification)
  dob: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
});

export async function updateProfile(
  _prev: EditState,
  formData: FormData,
): Promise<EditState> {
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/sign-in");

  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    essence: String(formData.get("essence") ?? "").trim(),
    interests: String(formData.get("interests") ?? "").trim(),
    height: String(formData.get("height") ?? "").trim(),
    gender: formData.get("gender"),
    interestedIn: formData.get("interestedIn"),
    connection: formData.get("connection"),
    incognito: formData.get("incognito")?.toString(),
    dob: String(formData.get("dob") ?? ""),
    birthTime: String(formData.get("birthTime") ?? ""),
    birthPlace: String(formData.get("birthPlace") ?? "").trim(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const d = parsed.data;

  const interests = (d.interests ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

  const height = d.height ? Number(d.height) : null;

  const data: Record<string, unknown> = {
    name: d.name,
    bio: d.bio || null,
    essence: d.essence || null,
    interests: JSON.stringify(interests),
    heightCm: height && Number.isFinite(height) ? Math.round(height) : null,
    gender: d.gender,
    interestedIn: d.interestedIn,
    connection: d.connection,
    incognito: d.incognito === "yes",
  };

  // Birth details are editable ONLY before verification. After verification
  // they are permanently locked to protect the integrity of every alignment.
  if (!user.birthLocked && d.dob) {
    const dob = new Date(d.dob);
    if (Number.isNaN(dob.getTime())) return { error: "That date of birth doesn't look right." };
    if (ageFromDob(dob) < 18) return { error: "Souls Align is for those 18 and older." };

    let hour: number | null = null;
    let minute: number | null = null;
    if (d.birthTime && /^\d{1,2}:\d{2}$/.test(d.birthTime)) {
      const [h, m] = d.birthTime.split(":").map(Number);
      hour = h;
      minute = m;
    }

    let birthPlace: string | null = null;
    let birthLat: number | null = null;
    let birthLon: number | null = null;
    if (d.birthPlace) {
      const geo = lookupPlace(d.birthPlace);
      birthPlace = geo?.label ?? d.birthPlace;
      birthLat = geo?.lat ?? null;
      birthLon = geo?.lon ?? null;
    }

    const year = dob.getFullYear();
    const chart = await computeChart({
      year,
      month: dob.getMonth() + 1,
      day: dob.getDate(),
      hour,
      minute,
      latitude: birthLat,
      longitude: birthLon,
    });

    // Recompute the astrological reading from the new birth data.
    Object.assign(data, {
      dob,
      birthHour: hour,
      birthMinute: minute,
      birthPlace,
      birthLat,
      birthLon,
      sunSign: chart.sun,
      moonSign: chart.moon,
      risingSign: chart.rising,
      sunElement: chart.sunElement,
      baziElement: elementFromYear(year),
      zodiacAnimal: animalFromYear(year),
    });
  }

  await prisma.user.update({ where: { id: userId }, data });
  revalidatePath("/you");
  redirect("/you");
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}

function keyFromUrl(url: string): string {
  return url.split("/").pop() ?? "";
}

export async function deletePhoto(photoId: string) {
  const userId = await getUserId();
  if (!userId) return;
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.userId !== userId) return;

  await deleteImage(keyFromUrl(photo.url));
  await prisma.photo.delete({ where: { id: photoId } });

  // If we removed the primary, promote the next one.
  if (photo.isPrimary) {
    const next = await prisma.photo.findFirst({
      where: { userId },
      orderBy: { sort: "asc" },
    });
    if (next) {
      await prisma.photo.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }
  revalidatePath("/you");
  revalidatePath("/you/edit");
}

export async function setPrimaryPhoto(photoId: string) {
  const userId = await getUserId();
  if (!userId) return;
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.userId !== userId) return;

  await prisma.$transaction([
    prisma.photo.updateMany({ where: { userId }, data: { isPrimary: false } }),
    prisma.photo.update({ where: { id: photoId }, data: { isPrimary: true } }),
  ]);
  revalidatePath("/you");
  revalidatePath("/you/edit");
}
