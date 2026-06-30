import { Tier } from "@/lib/tiers";

type TierBadgeProps = {
  tier: Tier;
  size?: "sm" | "md";
  className?: string;
};

/** A small pill showing the tier name in its colour. */
export function TierBadge({ tier, size = "md", className = "" }: TierBadgeProps) {
  const pad = size === "sm" ? "px-2.5 py-0.5 text-[0.62rem]" : "px-3 py-1 text-[0.68rem]";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium uppercase tracking-[0.16em] ${pad} ${className}`}
      style={{
        color: tier.color,
        backgroundColor: `color-mix(in srgb, ${tier.color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${tier.color} 30%, transparent)`,
      }}
    >
      {tier.name}
    </span>
  );
}
