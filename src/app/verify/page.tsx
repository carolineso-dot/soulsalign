import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { VerifyFlow } from "./VerifyFlow";

export default async function VerifyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  return (
    <div className="mx-auto min-h-dvh max-w-md px-6 pb-16">
      <header className="flex items-center gap-3 py-4">
        <Link href="/you" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ivory/70">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#23201b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </header>

      <div className="mt-10">
        <VerifyFlow alreadyVerified={user.verified} />
      </div>
    </div>
  );
}
