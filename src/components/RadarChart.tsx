import { Dimension } from "@/lib/matching";

type RadarChartProps = {
  dimensions: Dimension[];
  overall: number;
  tierColor: string;
};

/**
 * A five-point star (radar) chart of the compatibility dimensions, with the
 * overall score in the centre. Pure SVG — cheap and consistent.
 */
export function RadarChart({ dimensions, overall, tierColor }: RadarChartProps) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const R = 88;
  const n = dimensions.length;

  const angle = (i: number) => ((-90 + (i * 360) / n) * Math.PI) / 180;
  // Map the 70–99 band onto a readable radius, keeping a small floor.
  const frac = (s: number) => Math.max(0.14, Math.min(1, (s - 62) / 38));
  const pt = (i: number, r: number): [number, number] => [
    cx + Math.cos(angle(i)) * r,
    cy + Math.sin(angle(i)) * r,
  ];
  const toPath = (pts: [number, number][]) =>
    pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z";

  const rings = [0.25, 0.5, 0.75, 1].map((t) =>
    dimensions.map((_, i) => pt(i, R * t)),
  );
  const dataPts = dimensions.map((d, i) => pt(i, R * frac(d.score)));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" className="mx-auto max-w-[320px]">
      {/* grid rings */}
      {rings.map((r, i) => (
        <path key={i} d={toPath(r)} fill="none" stroke="var(--color-hairline)" strokeWidth={1} />
      ))}
      {/* axes */}
      {dimensions.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--color-hairline)" strokeWidth={1} />;
      })}

      {/* data polygon (draws itself in) */}
      <path
        className="orbit-star"
        d={toPath(dataPts)}
        fill={`color-mix(in srgb, ${tierColor} 22%, transparent)`}
        stroke={tierColor}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeDasharray={900}
        style={{ ["--dash" as string]: "900", animation: "draw 1.1s cubic-bezier(0.22,1,0.36,1) both" }}
      />
      {dataPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={dimensions[i].color} />
      ))}

      {/* centre: overall score */}
      <circle cx={cx} cy={cy} r={26} fill="var(--color-ivory, #fbf9f5)" stroke="var(--color-hairline)" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--font-cormorant), serif" fontSize={26} fontWeight={600} fill={tierColor} style={{ fontVariantNumeric: "tabular-nums" }}>
        {overall}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontFamily="var(--font-inter), sans-serif" fontSize={7} letterSpacing="0.15em" fill="var(--color-clay)">
        OVERALL
      </text>

      {/* labels */}
      {dimensions.map((d, i) => {
        const [x, y] = pt(i, R + 22);
        const anchor = x > cx + 6 ? "start" : x < cx - 6 ? "end" : "middle";
        return (
          <g key={i}>
            <text x={x} y={y} textAnchor={anchor} fontFamily="var(--font-inter), sans-serif" fontSize={11} fontWeight={500} fill="var(--color-ink)">
              {d.label}
            </text>
            <text x={x} y={y + 13} textAnchor={anchor} fontFamily="var(--font-cormorant), serif" fontSize={12} fontWeight={600} fill={d.color}>
              {d.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
