import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ReportIssueForm } from "./ReportIssueForm";

export default async function ReportIssuePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 py-12">
      <Link href="/safety" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ivory/70">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>

      <p className="label-eyebrow mt-6">Report an issue</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">We&rsquo;re listening</h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/85">
        Whether it&rsquo;s a safety concern, a bug, or a thought — tell us. To
        report a specific person, use the flag on their profile or in your chat.
      </p>

      <div className="mt-8">
        <ReportIssueForm />
      </div>
    </main>
  );
}
