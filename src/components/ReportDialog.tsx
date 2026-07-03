"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockAndUnmatch, reportUser } from "@/app/actions/relations";

const REASONS = [
  "Inappropriate messages",
  "Fake or misleading profile",
  "Harassment or hate",
  "Inappropriate photos",
  "Underage",
  "Something else",
];

export function ReportDialog({
  targetId,
  targetName,
  trigger = "flag",
}: {
  targetId: string;
  targetName: string;
  /** "flag" = small icon button, "text" = a text link. */
  trigger?: "flag" | "text";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submitReport = () => {
    startTransition(async () => {
      await reportUser(targetId, reason, detail);
      setDone(true);
    });
  };

  const block = () => {
    startTransition(async () => {
      await reportUser(targetId, reason, detail);
      await blockAndUnmatch(targetId);
      router.push("/discover");
    });
  };

  return (
    <>
      {trigger === "flag" ? (
        <button
          onClick={() => setOpen(true)}
          aria-label="Report or block"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ivory/70 text-clay"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 21V4m0 0h11l-1.5 4L16 12H5" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="text-sm text-clay underline underline-offset-4">
          Report or block
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-aubergine/50 p-4 sm:items-center">
          <div className="card w-full max-w-sm p-5">
            {done ? (
              <div className="space-y-4 text-center">
                <p className="font-serif text-xl text-ink">Thank you for telling us</p>
                <p className="text-sm text-clay">
                  Your safety matters more than any match. Our team will review
                  this report.
                </p>
                <button onClick={() => { setOpen(false); setDone(false); }} className="btn btn-ghost w-full px-5 py-2.5">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-xl text-ink">Report {targetName}</h2>
                <p className="mt-1 text-sm text-clay">
                  This is confidential. {targetName} won&rsquo;t be notified.
                </p>

                <div className="mt-4 space-y-2">
                  {REASONS.map((r) => (
                    <label key={r} className="flex items-center gap-3 text-sm text-ink">
                      <input
                        type="radio"
                        name="reason"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                      />
                      {r}
                    </label>
                  ))}
                </div>

                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Add any details (optional)"
                  rows={3}
                  className="field mt-4 resize-none"
                />

                <div className="mt-5 space-y-2">
                  <button onClick={submitReport} disabled={pending} className="btn btn-primary w-full px-5 py-2.5">
                    Submit report
                  </button>
                  <button onClick={block} disabled={pending} className="btn btn-ghost w-full px-5 py-2.5">
                    Block &amp; unmatch
                  </button>
                  <button onClick={() => setOpen(false)} className="w-full py-2 text-sm text-clay">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
