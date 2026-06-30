import Link from "next/link";
import { redirect } from "next/navigation";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { Wordmark } from "@/components/Wordmark";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getCurrentUser();
  // Returning, authenticated members always pass through the transition gate.
  if (user) redirect("/transition");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-between px-6 py-14 text-center">
      <div />

      <div className="flex flex-col items-center animate-fade-up">
        <OrbitEmblem size={180} />
        <Wordmark className="mt-8 text-2xl text-ink" />
        <p className="label-eyebrow mt-3">Let the souls align.</p>

        <h1 className="mt-10 max-w-xs font-serif text-[1.7rem] leading-[1.25] text-ink">
          For those who&rsquo;d rather meet one worthy soul than a hundred
          strangers.
        </h1>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Link href="/sign-up" className="btn btn-primary w-full px-6 py-3.5 text-[0.95rem]">
          Create your account
        </Link>
        <Link href="/sign-in" className="btn btn-ghost w-full px-6 py-3.5 text-[0.95rem]">
          Log in
        </Link>
        <Link
          href="/method"
          className="mt-4 inline-block text-sm text-clay underline decoration-hairline underline-offset-4 hover:text-ink"
        >
          Our method
        </Link>
      </div>
    </main>
  );
}
