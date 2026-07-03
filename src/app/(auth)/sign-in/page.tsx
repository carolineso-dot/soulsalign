import Link from "next/link";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { Wordmark } from "@/components/Wordmark";
import { AuthForm } from "../AuthForm";
import { signInAction } from "../actions";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-12">
      <Link href="/" className="flex flex-col items-center">
        <OrbitEmblem size={88} />
        <Wordmark className="mt-4 text-lg text-ink" />
      </Link>

      <div className="mt-12">
        <p className="label-eyebrow">Welcome back</p>
        <h1 className="mt-2 font-serif text-3xl text-ink">Log in</h1>
        <p className="mt-2 text-sm leading-relaxed text-clay">
          Your alignments are waiting.
        </p>
      </div>

      <div className="mt-8">
        <AuthForm mode="sign-in" action={signInAction} />
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-clay">
        Forgot your password?{" "}
        {supportEmail ? (
          <a
            href={`mailto:${supportEmail}?subject=Souls%20Align%20password%20reset`}
            className="text-claret underline underline-offset-4"
          >
            Ask us to reset it
          </a>
        ) : (
          <span>Contact the app owner to reset your password.</span>
        )}
      </p>
    </main>
  );
}

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
