import Link from "next/link";

export const metadata = { title: "Safety centre — Souls Align" };

export default function SafetyCentre() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-12">
      <BackLink />
      <p className="label-eyebrow mt-6">Safety centre</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">
        Your safety matters more than any match
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/85">
        Souls Align is built for considered, genuine connection. We hold this
        community to a high standard, and we&rsquo;re here whenever something
        feels wrong.
      </p>

      <div className="mt-8 space-y-3">
        <Card
          title="Report someone or something"
          body="If a person or message crosses a line, tell us. Reports are confidential and reviewed by our team."
          href="/safety/report"
          cta="Report an issue"
        />
        <Card
          title="Community guidelines"
          body="The principles every member agrees to — what we expect, and what we won't tolerate."
          href="/safety/guidelines"
          cta="Read the guidelines"
        />
      </div>

      <section className="mt-8 space-y-3 rounded-2xl border border-hairline bg-white/40 p-5">
        <h2 className="font-serif text-xl text-ink">A few quiet principles</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-clay">
          <li>Meet in public the first few times, and tell a friend where you&rsquo;ll be.</li>
          <li>Keep conversations on Souls Align until trust is earned.</li>
          <li>Never send money to someone you haven&rsquo;t met. No exceptions.</li>
          <li>Block and report anyone who pressures, deceives, or unsettles you.</li>
        </ul>
      </section>

      <p className="mt-8 text-sm text-clay">
        In an emergency, always contact your local authorities first.
      </p>
    </main>
  );
}

function Card({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <Link href={href} className="card block p-5">
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-clay">{body}</p>
      <span className="mt-3 inline-block text-sm text-claret underline underline-offset-4">{cta}</span>
    </Link>
  );
}

function BackLink() {
  return (
    <Link href="/you" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ivory/70">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#23201b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
