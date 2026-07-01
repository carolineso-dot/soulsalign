import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { parseInterests } from "@/lib/profile";
import { EditForm } from "./EditForm";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  const birthTime =
    user.birthHour != null && user.birthMinute != null
      ? `${String(user.birthHour).padStart(2, "0")}:${String(user.birthMinute).padStart(2, "0")}`
      : "";

  return (
    <div className="mx-auto min-h-dvh max-w-md px-5 pb-16">
      <header className="flex items-center gap-3 py-4">
        <Link href="/you" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ivory/70">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#23201b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-serif text-2xl text-ink">Edit profile</h1>
      </header>

      <div className="mt-2">
        <EditForm
          photos={user.photos.map((p) => ({
            id: p.id,
            url: p.url,
            originalUrl: p.originalUrl,
            crop: p.crop,
            isPrimary: p.isPrimary,
          }))}
          initial={{
            name: user.name ?? "",
            essence: user.essence ?? "",
            bio: user.bio ?? "",
            interests: parseInterests(user.interests).join(", "),
            height: user.heightCm ? String(user.heightCm) : "",
            gender: user.gender ?? "woman",
            interestedIn: user.interestedIn ?? "everyone",
            connection: user.connection ?? "both",
            location: user.locationLabel ?? "",
            incognito: user.incognito,
            dob: toDateInput(user.dob),
            birthTime,
            birthPlace: user.birthPlace ?? "",
            birthLocked: user.birthLocked,
          }}
        />
      </div>
    </div>
  );
}
