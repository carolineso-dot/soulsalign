import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MatchCard } from "@/components/MatchCard";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { getCurrentUser } from "@/lib/auth";
import { getChosen } from "@/lib/relationships";

export default async function ChosenPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  const chosen = await getChosen(user);

  return (
    <AppShell>
      <header className="pt-10">
        <p className="label-eyebrow">Chosen</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">Souls you&rsquo;ve chosen</h1>
        <p className="mt-1 text-sm text-clay">
          Begin a conversation whenever you&rsquo;re ready — it moves to Chats
          once you do.
        </p>
      </header>

      {chosen.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <OrbitEmblem size={110} />
          <p className="mt-6 max-w-xs font-serif text-xl text-ink">
            No one chosen yet
          </p>
          <p className="mt-2 max-w-xs text-sm text-clay">
            When a profile moves you, choose them — they&rsquo;ll wait for you
            here.
          </p>
          <Link href="/discover" className="btn btn-primary mt-6 px-6 py-3">
            Browse your alignments
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5">
          {chosen.map((c) => (
            <MatchCard
              key={c.id}
              data={{
                id: c.id,
                name: c.name,
                age: c.age,
                essence: c.essence,
                photoUrl: c.photoUrl,
                photoCrop: c.photoCrop,
                verified: c.verified,
                score: c.score,
                tierKey: c.tierKey,
                distanceKm: c.distanceKm,
                locked: false,
              }}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
