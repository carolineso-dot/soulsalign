import Link from "next/link";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { Wordmark } from "@/components/Wordmark";
import { AuthForm } from "../AuthForm";
import { signUpAction } from "../actions";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-12">
      <Link href="/" className="flex flex-col items-center">
        <OrbitEmblem size={88} />
        <Wordmark className="mt-4 text-lg text-ink" />
      </Link>

      <div className="mt-12">
        <p className="label-eyebrow">Begin</p>
        <h1 className="mt-2 font-serif text-3xl text-ink">Create your account</h1>
        <p className="mt-2 text-sm leading-relaxed text-clay">
          A few details to begin. The universe handles the rest.
        </p>
      </div>

      <div className="mt-8">
        <AuthForm mode="sign-up" action={signUpAction} />
      </div>
    </main>
  );
}
