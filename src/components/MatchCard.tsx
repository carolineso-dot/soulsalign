import Link from "next/link";
import { Avatar } from "./Avatar";
import { ScoreRing } from "./ScoreRing";
import { tierByKey, TierKey } from "@/lib/tiers";

export type MatchCardData = {
  id: string;
  name: string;
  age: number | null;
  essence: string | null;
  photoUrl: string | null;
  verified: boolean;
  score: number;
  tierKey: TierKey;
  locked: boolean;
};

export function MatchCard({ data }: { data: MatchCardData }) {
  const tier = tierByKey(data.tierKey);

  const inner = (
    <article className="card overflow-hidden">
      <div className="relative">
        <div className={data.locked ? "blur-md" : ""}>
          <Avatar
            src={data.photoUrl}
            name={data.name}
            size={9999}
            rounded="card"
            className="!h-64 !w-full !rounded-none"
          />
        </div>

        {/* tier label, top-left */}
        <span
          className="absolute left-3 top-3 rounded-full px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] backdrop-blur-sm"
          style={{
            color: "#fff",
            backgroundColor: `color-mix(in srgb, ${tier.color} 78%, black)`,
          }}
        >
          {tier.name}
        </span>

        {/* score ring, top-right */}
        {!data.locked && (
          <div className="absolute right-3 top-3 rounded-full bg-ivory/85 p-0.5 backdrop-blur">
            <ScoreRing score={data.score} size={46} />
          </div>
        )}

        {/* locked overlay */}
        {data.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/25 text-center">
            <LockGlyph />
            <p className="font-serif text-lg text-ivory drop-shadow">
              A Destined match awaits
            </p>
            <span className="rounded-full bg-gold px-4 py-1.5 text-xs font-medium text-ink">
              Unlock with Aligned+
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1 p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-xl text-ink">
            {data.name}
            {data.age != null && (
              <span className="text-clay">, {data.age}</span>
            )}
          </h3>
          {data.verified && <VerifiedGlyph />}
        </div>
        {data.essence && (
          <p className="text-sm leading-snug text-clay">{data.essence}</p>
        )}
      </div>
    </article>
  );

  if (data.locked) {
    return <Link href="/plans">{inner}</Link>;
  }
  return <Link href={`/profile/${data.id}`}>{inner}</Link>;
}

function LockGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f4e3b4" strokeWidth="1.6">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function VerifiedGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#a8843b" aria-label="Verified">
      <path d="M12 2l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.7.6 2.7-2.3 1.4-1 2.5-2.7-.2L12 22l-2.2-1.6-2.7.2-1-2.5L3.8 16.7l.6-2.7-.6-2.7 2.3-1.4 1-2.5 2.7.2z" />
      <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.6" fill="none" />
    </svg>
  );
}
