import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { RefineForm } from "./RefineForm";

export default async function RefinePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  return (
    <AppShell>
      <header className="pt-10">
        <p className="label-eyebrow">Refine</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">Shape your search</h1>
        <p className="mt-1 text-sm text-clay">
          The universe still does the choosing — you simply set the bounds.
        </p>
      </header>

      <div className="mt-8">
        <RefineForm />
      </div>
    </AppShell>
  );
}
