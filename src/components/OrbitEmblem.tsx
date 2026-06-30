import { CSSProperties } from "react";

type OrbitEmblemProps = {
  size?: number;
  /** Drop the rings + stars for tiny icon sizes. */
  minimal?: boolean;
  /** Pause animation (e.g. for static contexts). */
  still?: boolean;
  className?: string;
};

/**
 * The core brand visual: two souls — one claret, one gold — orbiting a glowing
 * gold core on two concentric thin rings, with faint stars.
 *
 * Orbs rotate slowly in opposite directions; the core gently pulses.
 */
export function OrbitEmblem({
  size = 160,
  minimal = false,
  still = false,
  className = "",
}: OrbitEmblemProps) {
  const cx = 100;
  const cy = 100;
  const ringOuter = 78;
  const ringInner = 50;

  const spin = (duration: number, reverse = false): CSSProperties =>
    still
      ? {}
      : {
          transformOrigin: `${cx}px ${cy}px`,
          animation: `${reverse ? "orbit-ccw" : "orbit-cw"} ${duration}s linear infinite`,
        };

  const stars = [
    { x: 28, y: 36, r: 1.3, d: 3.2 },
    { x: 168, y: 52, r: 1, d: 4.1 },
    { x: 150, y: 158, r: 1.4, d: 3.6 },
    { x: 40, y: 150, r: 1, d: 4.8 },
    { x: 100, y: 18, r: 1.1, d: 3.9 },
    { x: 182, y: 120, r: 0.9, d: 4.4 },
  ];

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Souls Align orbit emblem"
    >
      <defs>
        <radialGradient id="orbit-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4e3b4" />
          <stop offset="45%" stopColor="#c9a85f" />
          <stop offset="100%" stopColor="#a8843b" />
        </radialGradient>
        <radialGradient id="orbit-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a8843b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a8843b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orbit-claret" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#a45562" />
          <stop offset="100%" stopColor="#7e3340" />
        </radialGradient>
        <radialGradient id="orbit-gold" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#c9a85f" />
          <stop offset="100%" stopColor="#a8843b" />
        </radialGradient>
      </defs>

      {/* faint stars */}
      {!minimal &&
        stars.map((s, i) => (
          <circle
            key={i}
            className="orbit-star"
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#a8843b"
            opacity={0.4}
            style={
              still
                ? {}
                : { animation: `twinkle ${s.d}s ease-in-out infinite` }
            }
          />
        ))}

      {/* rings */}
      {!minimal && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={ringOuter}
            fill="none"
            stroke="#a8843b"
            strokeWidth={0.75}
            opacity={0.35}
          />
          <circle
            cx={cx}
            cy={cy}
            r={ringInner}
            fill="none"
            stroke="#7e3340"
            strokeWidth={0.75}
            opacity={0.3}
          />
        </>
      )}

      {/* glowing core */}
      <circle
        cx={cx}
        cy={cy}
        r={26}
        fill="url(#orbit-core-glow)"
        className="orbit-core"
        style={
          still
            ? {}
            : { animation: "core-pulse 4s ease-in-out infinite", transformOrigin: `${cx}px ${cy}px` }
        }
      />
      <circle
        cx={cx}
        cy={cy}
        r={minimal ? 16 : 12}
        fill="url(#orbit-core)"
        className="orbit-core"
        style={
          still
            ? {}
            : { animation: "core-pulse 4s ease-in-out infinite", transformOrigin: `${cx}px ${cy}px` }
        }
      />

      {/* orbiting souls */}
      <g className="orbit-spin-cw" style={spin(18)}>
        <circle cx={cx + ringOuter} cy={cy} r={minimal ? 11 : 8} fill="url(#orbit-claret)" />
      </g>
      <g className="orbit-spin-ccw" style={spin(24, true)}>
        <circle cx={cx - ringInner} cy={cy} r={minimal ? 10 : 7} fill="url(#orbit-gold)" />
      </g>
    </svg>
  );
}
