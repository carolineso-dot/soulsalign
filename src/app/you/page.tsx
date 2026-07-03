import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProfileImage } from "@/components/ProfileImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCurrentUser } from "@/lib/auth";
import { parseCrop } from "@/lib/crop";
import { signOutAction } from "./actions";
import { ageFromDob, parseInterests } from "@/lib/profile";
import {
  connectionLabel,
  genderLabel,
  interestedInLabel,
} from "@/lib/constants";
import { planByKey } from "@/lib/plans";
import { signGlyph } from "@/lib/astrology";
import { elementGlyph } from "@/lib/bazi";
import { animalGlyph } from "@/lib/zodiac";

export default async function YouPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  const interests = parseInterests(user.interests);
  const age = user.dob ? ageFromDob(user.dob) : null;
  const primary = user.photos.find((p) => p.isPrimary) ?? user.photos[0];
  // The primary is shown as the hero above; exclude it from the grid below so
  // it isn't rendered twice. (Ordering logic elsewhere is unchanged.)
  const gallery = user.photos.filter((p) => p.id !== primary?.id);
  const plan = planByKey(user.plan);

  return (
    <AppShell>
      <header className="flex items-center justify-between pt-10">
        <p className="label-eyebrow">You</p>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/you/edit"
            aria-label="Edit profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline veil"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-4">
        <ProfileImage
          src={primary?.url ?? null}
          name={user.name ?? "You"}
          crop={parseCrop(primary?.crop ?? null)}
          shape="frame"
          className="w-24 shrink-0"
        />
        <div>
          <h1 className="font-serif text-2xl text-ink">
            {user.name}
            {age != null && <span className="text-clay">, {age}</span>}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider"
              style={{ color: plan.accent, backgroundColor: `color-mix(in srgb, ${plan.accent} 12%, transparent)` }}
            >
              {plan.name}
            </span>
            {user.verified ? (
              <span className="inline-flex items-center gap-1 text-xs text-gold">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#a8843b"><path d="M12 2l2.4 1.7 2.9-.2 1 2.7L21 8l-.7 2.9.7 2.9-2.7 1.8-1 2.7-2.9-.2L12 22l-2.4-1.9-2.9.2-1-2.7L3 13.8 3.7 11 3 8.1l2.7-1.8 1-2.7 2.9.2z"/><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.7" fill="none"/></svg>
                Verified
              </span>
            ) : (
              <Link href="/verify" className="text-xs text-claret underline underline-offset-2">
                Get verified
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* photo grid — additional photos only (hero excluded) */}
      {gallery.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {gallery.map((p) => (
            <ProfileImage
              key={p.id}
              src={p.url}
              name={user.name ?? "You"}
              crop={parseCrop(p.crop)}
              shape="frame"
              className="w-full"
            />
          ))}
        </div>
      )}

      {/* your alignment trio */}
      <section className="mt-6 card p-5">
        <p className="label-eyebrow">Your alignment</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Trio glyph={user.sunSign ? signGlyph(user.sunSign as never) : "☉"} label="Sun" value={user.sunSign ?? "—"} />
          <Trio glyph={user.baziElement ? elementGlyph(user.baziElement as never) : "五"} label="八字 Nature" value={user.baziElement ?? "—"} />
          <Trio glyph={user.zodiacAnimal ? animalGlyph(user.zodiacAnimal as never) : "生"} label="Zodiac" value={user.zodiacAnimal ?? "—"} />
        </div>
        {(user.moonSign || user.risingSign) && (
          <p className="mt-3 text-center text-xs text-clay">
            Moon {user.moonSign ?? "—"} · Rising {user.risingSign ?? "—"}
          </p>
        )}
      </section>

      {/* preferences */}
      <section className="mt-6 space-y-2">
        <p className="label-eyebrow">Preferences</p>
        <Row k="I am" v={genderLabel(user.gender)} />
        <Row k="Interested in" v={interestedInLabel(user.interestedIn)} />
        <Row k="Seeking" v={connectionLabel(user.connection)} />
        <Row k="Location" v={user.locationLabel ?? "Not set"} />
      </section>

      {/* about */}
      {user.bio && (
        <section className="mt-6">
          <p className="label-eyebrow">About</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/85">{user.bio}</p>
        </section>
      )}

      {interests.length > 0 && (
        <section className="mt-6">
          <p className="label-eyebrow">Interests</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {interests.map((it) => (
              <span key={it} className="rounded-full border border-hairline veil px-3 py-1 text-sm text-ink/80">{it}</span>
            ))}
          </div>
        </section>
      )}

      {/* membership / plans */}
      <section className="mt-8 space-y-px overflow-hidden rounded-2xl border border-hairline">
        <p className="veil px-4 pt-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-clay">
          Membership
        </p>
        <Link href="/plans" className="flex items-center justify-between veil px-4 py-3 text-sm text-ink">
          <span>
            Plans
            <span className="ml-2 text-xs" style={{ color: plan.accent }}>
              {plan.name}
            </span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-clay)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </section>

      {/* safety & support */}
      <section className="mt-6 space-y-px overflow-hidden rounded-2xl border border-hairline">
        <p className="veil px-4 pt-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-clay">
          Safety &amp; support
        </p>
        <SafetyLink href="/safety/report" label="Report an issue" />
        <SafetyLink href="/safety" label="Safety centre" />
        <SafetyLink href="/safety/guidelines" label="Community guidelines" />
      </section>

      <form action={signOutAction} className="mt-6">
        <button className="btn btn-ghost w-full px-6 py-3">Sign out</button>
      </form>
    </AppShell>
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-2 text-sm last:border-0">
      <span className="text-clay">{k}</span>
      <span className="text-ink">{v}</span>
    </div>
  );
}

function SafetyLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between veil px-4 py-3 text-sm text-ink">
      {label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-clay)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
