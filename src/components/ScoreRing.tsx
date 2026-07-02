import { tierForScore } from "@/lib/tiers";

type ScoreRingProps = {
  score: number;
  size?: number;
  /** Hide the numeric label (e.g. for blurred/locked cards). */
  hideValue?: boolean;
  className?: string;
};

/** A thin progress ring rendering the 0–100 alignment score in the tier colour. */
export function ScoreRing({
  score,
  size = 56,
  hideValue = false,
  className = "",
}: ScoreRingProps) {
  const tier = tierForScore(score);
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tier.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      {!hideValue && (
        <span
          className="tnum absolute font-serif font-semibold"
          style={{ color: tier.color, fontSize: size * 0.32 }}
        >
          {Math.round(score)}
        </span>
      )}
    </div>
  );
}
