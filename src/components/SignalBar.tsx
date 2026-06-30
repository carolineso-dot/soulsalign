type SignalBarProps = {
  label: string;
  detail: string;
  score: number;
  color?: string;
};

/** One destiny-signal bar used in the "why you align" breakdown. */
export function SignalBar({
  label,
  detail,
  score,
  color = "#7e3340",
}: SignalBarProps) {
  // Map the 70–99 scoring band onto a readable 0–100% fill.
  const pct = Math.max(6, Math.min(100, ((score - 60) / 40) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-serif text-sm font-semibold" style={{ color }}>
          {Math.round(score)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs leading-relaxed text-clay">{detail}</p>
    </div>
  );
}
