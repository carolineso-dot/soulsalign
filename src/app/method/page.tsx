import Link from "next/link";
import { OrbitEmblem } from "@/components/OrbitEmblem";

export const metadata = { title: "Our method — Souls Align" };

const SIGNALS = [
  {
    no: "01",
    title: "Elemental nature",
    sub: "八字 · the five elements",
    body: "Wood, fire, earth, metal, water. In the turning cycle of the elements, some nourish and generate one another — and those that do score highest in harmony.",
  },
  {
    no: "02",
    title: "Astral temperament",
    sub: "Western astrology",
    body: "Sun, moon and rising — the signs that shape how a person shines, feels, and first meets the world. Each falls within an element — fire, earth, air, water — and we draw together those that share a rhythm or gently balance one another, rather than collide.",
  },
  {
    no: "03",
    title: "Zodiac affinity",
    sub: "Chinese zodiac",
    body: "Drawn from the relationships among the twelve animals — the harmony trines (San He) and six-harmony pairs (Liu He) that have marked natural allies for centuries form the heart of our affinity scoring.",
  },
];

export default function MethodPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <OrbitEmblem size={96} />
        <p className="label-eyebrow mt-5">Our method</p>
        <h1 className="mt-3 font-serif text-[1.7rem] leading-snug text-ink">
          Structured, not mystical — a considered reading, never a prophecy.
        </h1>
      </div>

      <p className="mt-8 text-[0.95rem] leading-relaxed text-ink/85">
        Three time-honoured systems, each illuminating a different layer of who
        you are, read together into a single measure of how two natures meet.
        Where there is no pretense, the rest is your choice.
      </p>

      <div className="mt-10 space-y-px overflow-hidden rounded-2xl border border-hairline">
        {SIGNALS.map((s) => (
          <section key={s.no} className="veil p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-lg text-gold">{s.no}</span>
              <div>
                <h2 className="font-serif text-xl text-ink">{s.title}</h2>
                <p className="label-eyebrow mt-0.5">{s.sub}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-clay">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 border-t border-hairline pt-6 text-[0.95rem] leading-relaxed text-ink/85">
        Together these become your alignment — a single compatibility reading,
        from the first Spark to the rarest Destined. Not a verdict on your
        future, but an honest measure of how well two souls are matched to begin
        with.
      </p>

      <div className="mt-10 text-center">
        <Link href="/" className="btn btn-ghost px-6 py-3">
          Back
        </Link>
      </div>
    </main>
  );
}
