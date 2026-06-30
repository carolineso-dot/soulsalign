"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PillSelect } from "@/components/PillSelect";

export function RefineForm() {
  const router = useRouter();
  const [connection, setConnection] = useState("both");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(70);
  const [minHeight, setMinHeight] = useState(150);
  const [maxHeight, setMaxHeight] = useState(200);

  const apply = () => {
    const p = new URLSearchParams();
    if (connection !== "both") p.set("connection", connection);
    if (minAge !== 18) p.set("minAge", String(minAge));
    if (maxAge !== 70) p.set("maxAge", String(maxAge));
    if (minHeight !== 150) p.set("minHeight", String(minHeight));
    if (maxHeight !== 200) p.set("maxHeight", String(maxHeight));
    router.push(`/discover${p.toString() ? `?${p}` : ""}`);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <span className="label-eyebrow block">Connection</span>
        <PillSelect
          name="connection"
          value={connection}
          onChange={setConnection}
          options={[
            { value: "both", label: "Both" },
            { value: "romance", label: "Romance" },
            { value: "friendship", label: "Friendship" },
          ]}
        />
      </section>

      <RangeRow
        label="Age"
        unit=""
        min={18}
        max={80}
        lo={minAge}
        hi={maxAge}
        setLo={setMinAge}
        setHi={setMaxAge}
      />

      <RangeRow
        label="Height"
        unit="cm"
        min={140}
        max={210}
        lo={minHeight}
        hi={maxHeight}
        setLo={setMinHeight}
        setHi={setMaxHeight}
      />

      <button onClick={apply} className="btn btn-primary w-full px-6 py-3.5">
        Show alignments
      </button>
    </div>
  );
}

function RangeRow({
  label,
  unit,
  min,
  max,
  lo,
  hi,
  setLo,
  setHi,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  lo: number;
  hi: number;
  setLo: (n: number) => void;
  setHi: (n: number) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="label-eyebrow">{label}</span>
        <span className="text-sm text-ink">
          {lo} – {hi} {unit}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-xs text-clay">From</span>
          <input
            type="range"
            min={min}
            max={max}
            value={lo}
            onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
            className="w-full accent-claret"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-clay">To</span>
          <input
            type="range"
            min={min}
            max={max}
            value={hi}
            onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
            className="w-full accent-claret"
          />
        </label>
      </div>
    </section>
  );
}
