"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ReportDialog } from "@/components/ReportDialog";
import { ThreadMessage } from "@/lib/chat";

type Msg = { id: string; mine: boolean; body: string };

export function ChatThread({
  otherId,
  otherName,
  otherPhoto,
  tierName,
  tierColor,
  initialMessages,
  repliesAutomatically,
}: {
  otherId: string;
  otherName: string;
  otherPhoto: string | null;
  tierName: string;
  tierColor: string;
  initialMessages: ThreadMessage[];
  repliesAutomatically: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    const tempId = `t-${messages.length}-${text.length}`;
    setMessages((m) => [...m, { id: tempId, mine: true, body: text }]);
    if (repliesAutomatically) setTyping(true);

    try {
      const res = await fetch(`/api/chat/${otherId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.reply) {
        setMessages((m) => [
          ...m,
          { id: `r-${m.length}-${String(data.reply).length}`, mine: false, body: data.reply },
        ]);
      }
    } catch {
      // message is already shown; reply simply won't arrive
    } finally {
      setTyping(false);
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col">
      {/* header */}
      <header className="flex items-center gap-3 border-b border-hairline bg-ivory/85 px-4 py-3 backdrop-blur">
        <Link href="/chat" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-ivory/70">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#23201b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <Link href={`/profile/${otherId}`} className="flex flex-1 items-center gap-3">
          <Avatar src={otherPhoto} name={otherName} size={40} />
          <div>
            <div className="font-serif text-lg leading-tight text-ink">{otherName}</div>
            <div className="text-[0.62rem] font-medium uppercase tracking-wider" style={{ color: tierColor }}>
              {tierName}
            </div>
          </div>
        </Link>
        <ReportDialog targetId={otherId} targetName={otherName} trigger="flag" />
      </header>

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
        <p className="text-center text-xs text-clay">
          You matched as <span style={{ color: tierColor }}>{tierName}</span>. Begin gently.
        </p>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[0.95rem] leading-snug ${
                m.mine
                  ? "rounded-br-md bg-claret text-ivory"
                  : "rounded-bl-md border border-hairline bg-white/70 text-ink"
              }`}
            >
              {m.body}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-hairline bg-white/70 px-4 py-3">
              <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="border-t border-hairline bg-ivory/90 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Write something true…"
            className="field max-h-32 flex-1 resize-none"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="btn btn-primary h-11 w-11 shrink-0 !rounded-full p-0"
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="orbit-star inline-block h-1.5 w-1.5 rounded-full bg-clay"
      style={{ animation: `twinkle 1s ease-in-out ${delay} infinite` }}
    />
  );
}
