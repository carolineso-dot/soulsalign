/** Subscription tiers (freemium). Monetize depth, accuracy, privacy — never visibility. */

export type PlanKey = "aligned" | "aligned_plus" | "destined";

export type Plan = {
  key: PlanKey;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  accent: string;
};

export const PLANS: Plan[] = [
  {
    key: "aligned",
    name: "Aligned",
    price: "Free",
    cadence: "",
    tagline: "Begin where the stars allow.",
    features: [
      "A few curated alignments daily",
      "Sun-level matching",
      "Your alignment score & tier",
      "Messaging once mutually matched",
    ],
    accent: "#8c857a",
  },
  {
    key: "aligned_plus",
    name: "Aligned+",
    price: "S$24.90",
    cadence: "/ month",
    tagline: "See the rare ones — and read them in full.",
    features: [
      "Unlock your Destined matches",
      "Full sun · moon · rising astral reading",
      "Unlimited alignments",
      "The complete compatibility reading",
      "Incognito & privacy",
    ],
    accent: "#7e3340",
  },
  {
    key: "destined",
    name: "Destined",
    price: "S$39.90",
    cadence: "/ month",
    tagline: "For those who will not leave it to chance.",
    features: [
      "Everything in Aligned+",
      "Priority to your matches",
      "Monthly alignment outlook",
      "Verified-only pool",
    ],
    accent: "#a8843b",
  },
];

export function planByKey(key: string | null | undefined): Plan {
  return PLANS.find((p) => p.key === key) ?? PLANS[0];
}

/** Aligned+ and Destined members get the richer (moon/rising) reading & Destined matches. */
export function hasPlus(plan: string | null | undefined): boolean {
  return plan === "aligned_plus" || plan === "destined";
}
