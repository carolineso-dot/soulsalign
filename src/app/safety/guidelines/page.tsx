import Link from "next/link";

export const metadata = { title: "Community guidelines — Souls Align" };

const SECTIONS = [
  {
    title: "Be genuine",
    body: "Souls Align exists because people are tired of performance. Use real photos, your true birth details, and your own words. Misrepresentation breaks the one thing we're built on.",
  },
  {
    title: "Be respectful",
    body: "Treat every member with the dignity you'd want. Harassment, hate, discrimination, or pressure of any kind has no place here and will end your membership.",
  },
  {
    title: "Be safe",
    body: "Never share financial information or send money. Keep early conversations on the app. Report anything that feels off — we'd always rather hear from you.",
  },
  {
    title: "Be 18 or older",
    body: "Souls Align is strictly for adults. Anyone found to be under 18, or misrepresenting their age, is removed immediately.",
  },
  {
    title: "Consent is everything",
    body: "Only continue what's mutual. No means no, in conversation and in person. Respect boundaries the moment they're drawn.",
  },
  {
    title: "Keep it lawful",
    body: "No solicitation, spam, scams, or illegal activity. No sharing of others' private information. This is a space for connection, not commerce.",
  },
];

export default function GuidelinesPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-12">
      <Link href="/safety" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ivory/70">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#23201b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>

      <p className="label-eyebrow mt-6">Community guidelines</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">How we treat one another</h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/85">
        By joining Souls Align, every member agrees to these. They&rsquo;re simple,
        and we hold them seriously.
      </p>

      <div className="mt-8 space-y-5">
        {SECTIONS.map((s, i) => (
          <section key={s.title}>
            <h2 className="font-serif text-xl text-ink">
              <span className="text-gold">{String(i + 1).padStart(2, "0")}</span> · {s.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-clay">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-hairline pt-6 text-sm leading-relaxed text-clay">
        Breaking these guidelines can lead to removal from Souls Align. When in
        doubt, choose kindness — and tell us if something isn&rsquo;t right.
      </p>
    </main>
  );
}
