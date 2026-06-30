import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { getCurrentUser } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { PlanCard } from "./PlanCard";

export default async function PlansPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  const current = user.plan ?? "aligned";

  return (
    <AppShell>
      <header className="flex flex-col items-center pt-10 text-center">
        <OrbitEmblem size={72} />
        <p className="label-eyebrow mt-4">Plans</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">Choose your depth</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-clay">
          Souls Align brings cosmic value to connection — depth over visibility,
          always.
        </p>
      </header>

      <div className="mt-8 space-y-5">
        {PLANS.map((p) => (
          <PlanCard key={p.key} plan={p} current={p.key === current} />
        ))}
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-clay">
        We never sell visibility or boosts. You pay only for a deeper, truer, more
        private reading — never to be seen more.
      </p>
    </AppShell>
  );
}
