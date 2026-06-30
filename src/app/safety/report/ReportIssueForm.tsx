"use client";

import { useState, useTransition } from "react";
import { reportIssue } from "@/app/actions/relations";

const TOPICS = [
  "A safety concern",
  "A bug or technical issue",
  "Inappropriate content",
  "Billing or plans",
  "Feedback",
  "Something else",
];

export function ReportIssueForm() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      await reportIssue(topic, detail);
      setDone(true);
    });
  };

  if (done) {
    return (
      <div className="card p-6 text-center">
        <p className="font-serif text-2xl text-ink">Thank you</p>
        <p className="mt-2 text-sm leading-relaxed text-clay">
          We&rsquo;ve received your message and will look into it. Your care helps
          keep this community considered and kind.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span className="label-eyebrow block">What&rsquo;s this about?</span>
        <div className="space-y-2">
          {TOPICS.map((t) => (
            <label key={t} className="flex items-center gap-3 text-sm text-ink">
              <input type="radio" name="topic" checked={topic === t} onChange={() => setTopic(t)} />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="detail" className="label-eyebrow block">Details</label>
        <textarea
          id="detail"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={5}
          placeholder="Tell us what happened. The more we know, the better we can help."
          className="field resize-none"
        />
      </div>

      <button onClick={submit} disabled={pending} className="btn btn-primary w-full px-6 py-3.5">
        {pending ? "Sending…" : "Send to our team"}
      </button>
    </div>
  );
}
