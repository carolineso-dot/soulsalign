import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MatchCard } from "@/components/MatchCard";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { getCurrentUser } from "@/lib/auth";
import { getCuratedMatches } from "@/lib/discovery";
import { hasPlus } from "@/lib/plans";

type SearchParams = Promise<{
  connection?: string;
  minAge?: string;
  maxAge?: string;
  minHeight?: string;
  maxHeight?: string;
  near?: string;
  maxKm?: string;
}>;

function num(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  const sp = await searchParams;
  const connection: "romance" | "friendship" | undefined =
    sp.connection === "romance"
      ? "romance"
      : sp.connection === "friendship"
        ? "friendship"
        : undefined;
  const filters = {
    connection,
    minAge: num(sp.minAge),
    maxAge: num(sp.maxAge),
    minHeight: num(sp.minHeight),
    maxHeight: num(sp.maxHeight),
    near: sp.near || undefined,
    maxKm: num(sp.maxKm),
  };
  const hasFilters = Object.values(filters).some((v) => v !== undefined);

  const matches = await getCuratedMatches(user, filters);
  const plus = hasPlus(user.plan);

  return (
    <AppShell>
      <header className="flex items-center justify-between pt-10">
        <div>
          <p className="label-eyebrow">Aligned</p>
          <h1 className="mt-1 font-serif text-3xl text-ink">
            {user.name ? `Hello, ${user.name}` : "Your alignments"}
          </h1>
          <p className="mt-1 text-sm text-clay">
            {matches.length > 0
              ? "The universe has been considering."
              : "New alignments are forming. Check back soon."}
          </p>
        </div>
        <OrbitEmblem size={56} minimal />
      </header>

      {hasFilters && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-hairline bg-white/40 px-3 py-2 text-xs text-clay">
          <span>Refined view active</span>
          <a href="/discover" className="text-claret underline underline-offset-2">
            Clear
          </a>
        </div>
      )}

      {!plus && matches.some((m) => m.locked) && (
        <p className="mt-6 rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-ink/80">
          <span className="font-medium text-gold">Destined matches found.</span>{" "}
          Unlock the rarest convergences with Aligned+.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5">
        {matches.map((m) => (
          <MatchCard key={m.id} data={m} />
        ))}
      </div>

      {matches.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <OrbitEmblem size={120} />
          <p className="mt-6 max-w-xs font-serif text-xl text-ink">
            Patience is its own kind of devotion.
          </p>
          <p className="mt-2 text-sm text-clay">
            We&rsquo;ll align you with worthy souls as they arrive.
          </p>
        </div>
      )}
    </AppShell>
  );
}
