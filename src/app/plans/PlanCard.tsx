"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "@/lib/plans";
import { setPlan } from "./actions";

export function PlanCard({
  plan,
  current,
}: {
  plan: Plan;
  current: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const choose = () => {
    startTransition(async () => {
      await setPlan(plan.key);
      router.refresh();
    });
  };

  return (
    <article
      className="card relative overflow-hidden p-5"
      style={{ borderColor: current ? plan.accent : undefined }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: plan.accent }}
      />
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-2xl text-ink">{plan.name}</h2>
        <div className="text-right">
          <span className="font-serif text-xl" style={{ color: plan.accent }}>
            {plan.price}
          </span>
          {plan.cadence && <span className="text-xs text-clay"> {plan.cadence}</span>}
        </div>
      </div>
      <p className="mt-1 text-sm italic text-clay">{plan.tagline}</p>

      <ul className="mt-4 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink/85">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.accent} strokeWidth="1.8" className="mt-0.5 shrink-0" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 6" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        {current ? (
          <div className="rounded-full border border-hairline py-2.5 text-center text-sm text-clay">
            Your current plan
          </div>
        ) : (
          <button
            onClick={choose}
            disabled={pending}
            className="btn w-full px-6 py-3 text-sm"
            style={{ backgroundColor: plan.accent, color: plan.key === "destined" ? "#23201b" : "#fbf9f5" }}
          >
            {pending ? "Updating…" : plan.key === "aligned" ? "Switch to Aligned" : `Choose ${plan.name}`}
          </button>
        )}
      </div>
    </article>
  );
}
