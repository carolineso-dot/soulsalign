"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthState } from "./actions";

type AuthFormProps = {
  mode: "sign-up" | "sign-in";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="w-full space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="label-eyebrow block">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="label-eyebrow block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={8}
          className="field"
          placeholder={isSignUp ? "At least 8 characters" : "Your password"}
        />
      </div>

      {state.error && (
        <p className="text-sm text-claret">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full px-6 py-3.5"
      >
        {pending
          ? "One moment…"
          : isSignUp
            ? "Create account"
            : "Log in"}
      </button>

      <p className="pt-2 text-center text-sm text-clay">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-claret underline underline-offset-4">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/sign-up" className="text-claret underline underline-offset-4">
              Create your account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
