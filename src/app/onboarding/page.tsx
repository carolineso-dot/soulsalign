import { redirect } from "next/navigation";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.onboardingComplete) redirect("/discover");

  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <OrbitEmblem size={96} />
        <p className="label-eyebrow mt-5">Let the universe choose</p>
        <h1 className="mt-2 font-serif text-3xl text-ink">
          Tell us who you innately are
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-clay">
          No augmenting, no performing. Just the truth of your birth — the rest,
          we read for you.
        </p>
      </div>

      <div className="mt-10">
        <OnboardingForm defaultName={user.name ?? ""} />
      </div>
    </main>
  );
}
