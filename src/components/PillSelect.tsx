"use client";

type Option = { value: string; label: string };

type PillSelectProps = {
  name: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
};

/** A row of selectable pills backed by a hidden input (for native form submit). */
export function PillSelect({ name, options, value, onChange }: PillSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <input type="hidden" name={name} value={value} />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="rounded-full border px-4 py-2 text-sm transition-colors"
            style={{
              borderColor: active ? "#7e3340" : "var(--color-hairline)",
              backgroundColor: active
                ? "color-mix(in srgb, #7e3340 10%, transparent)"
                : "transparent",
              color: active ? "#7e3340" : "var(--color-ink)",
              fontWeight: active ? 500 : 400,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
