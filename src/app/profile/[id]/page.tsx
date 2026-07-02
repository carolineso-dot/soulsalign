import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfileView } from "@/lib/profileView";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ScoreRing } from "@/components/ScoreRing";
import { TierBadge } from "@/components/TierBadge";
import { SignalBar } from "@/components/SignalBar";
import { RadarChart } from "@/components/RadarChart";
import { AlignmentStory } from "@/components/AlignmentStory";
import { ExpressInterest } from "@/components/ExpressInterest";
import { RequestDecision } from "@/components/RequestDecision";
import { ReportDialog } from "@/components/ReportDialog";
import { TestChatButton } from "@/components/TestChatButton";
import { testModeEnabled } from "@/lib/testMode";
import { animalGlyph } from "@/lib/zodiac";
import { elementGlyph } from "@/lib/bazi";
import { signGlyph } from "@/lib/astrology";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  const view = await getProfileView(user, id);
  if (!view) notFound();

  // Free viewers cannot open a Destined profile — guide them to Aligned+.
  // Exceptions: test mode, and when this person has sent YOU a request (you
  // should always be able to review someone before accepting/declining).
  const testMode = testModeEnabled();
  if (view.lockedForFree && !testMode && !view.hasIncomingRequest) redirect("/plans");

  const { alignment } = view;

  return (
    <div className="mx-auto min-h-dvh max-w-md px-5 pb-28">
      <header className="flex items-center justify-between py-4">
        <Link href="/discover" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ivory/70">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <ReportDialog targetId={view.id} targetName={view.name} trigger="flag" />
      </header>

      <PhotoGallery photos={view.photos} name={view.name} />

      {/* identity */}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">
            {view.name}
            {view.age != null && <span className="text-clay">, {view.age}</span>}
          </h1>
          {view.essence && (
            <p className="mt-1 text-sm italic text-clay">&ldquo;{view.essence}&rdquo;</p>
          )}
          {view.verified && (
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-gold">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#a8843b"><path d="M12 2l2.4 1.7 2.9-.2 1 2.7L21 8l-.7 2.9.7 2.9-2.7 1.8-1 2.7-2.9-.2L12 22l-2.4-1.9-2.9.2-1-2.7L3 13.8 3.7 11 3 8.1l2.7-1.8 1-2.7 2.9.2z"/><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.7" fill="none"/></svg>
              Verified
            </span>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={alignment.score} size={64} />
          <TierBadge tier={alignment.tier} size="sm" />
        </div>
      </div>

      {/* astro trio */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Trio glyph={view.sunSign ? signGlyph(view.sunSign as never) : "☉"} label="Sun" value={view.sunSign ?? "—"} />
        <Trio glyph={view.baziElement ? elementGlyph(view.baziElement as never) : "五"} label="八字 Nature" value={view.baziElement ?? "—"} />
        <Trio glyph={view.zodiacAnimal ? animalGlyph(view.zodiacAnimal as never) : "生"} label="Zodiac" value={view.zodiacAnimal ?? "—"} />
      </div>

      {/* compatibility — overall score first */}
      <section className="mt-6 card p-5">
        <div className="flex items-center justify-between">
          <p className="label-eyebrow">Compatibility</p>
          <Link href="/method" className="text-xs text-claret underline underline-offset-4">
            Understand our method
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <ScoreRing score={alignment.score} size={72} />
          <div>
            <div className="font-serif text-lg text-ink">
              {alignment.tier.name}
            </div>
            <p className="mt-0.5 text-sm leading-snug text-clay">
              {alignment.tier.note}
            </p>
          </div>
        </div>

        {/* the three cosmic pillars */}
        <div className="mt-6">
          <p className="label-eyebrow">The Three Cosmic Pillars</p>
          <div className="mt-4 space-y-4">
            {alignment.breakdown.map((b) => (
              <SignalBar key={b.label} label={b.label} detail={b.detail} score={b.score} color={b.color} />
            ))}
          </div>
        </div>

        {/* five-dimension star */}
        <div className="mt-6 border-t border-hairline pt-5">
          <p className="label-eyebrow text-center">Five dimensions of compatibility</p>
          <div className="mt-3">
            <RadarChart
              dimensions={alignment.dimensions}
              overall={alignment.score}
              tierColor={alignment.tier.color}
            />
          </div>
        </div>

        {/* personal narrative — why these two align, beyond the numbers */}
        <AlignmentStory targetId={view.id} />
      </section>

      {/* about */}
      {view.bio && (
        <section className="mt-6">
          <p className="label-eyebrow">About</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/85">{view.bio}</p>
        </section>
      )}

      {/* interests */}
      {view.interests.length > 0 && (
        <section className="mt-6">
          <p className="label-eyebrow">Interests</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {view.interests.map((it) => (
              <span key={it} className="rounded-full border border-hairline veil px-3 py-1 text-sm text-ink/80">
                {it}
              </span>
            ))}
          </div>
        </section>
      )}

      {view.heightCm && (
        <p className="mt-6 text-sm text-clay">Height · {view.heightCm} cm</p>
      )}

      {/* express interest (fixed footer) */}
      <div className="fixed inset-x-0 bottom-0 z-30 space-y-2 border-t border-hairline bg-ivory/90 px-5 py-3 backdrop-blur">
        <div className="mx-auto max-w-md space-y-2">
          {view.hasIncomingRequest ? (
            <RequestDecision targetId={view.id} targetName={view.name} />
          ) : (
            <ExpressInterest
              targetId={view.id}
              initialSent={view.hasSentInterest}
              initialMatched={view.isMutual}
            />
          )}
          {testMode && !view.isMutual && !view.hasIncomingRequest && (
            <TestChatButton targetId={view.id} />
          )}
        </div>
      </div>
    </div>
  );
}

function Trio({ glyph, label, value }: { glyph: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline veil px-2 py-3">
      <div className="font-serif text-2xl text-ink">{glyph}</div>
      <div className="label-eyebrow mt-1 !text-[0.58rem]">{label}</div>
      <div className="mt-0.5 text-sm text-ink">{value}</div>
    </div>
  );
}
