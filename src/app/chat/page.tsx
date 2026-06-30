import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { getCurrentUser } from "@/lib/auth";
import { getConversations } from "@/lib/chat";

export default async function ChatListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  const conversations = await getConversations(user);

  return (
    <AppShell>
      <header className="pt-10">
        <p className="label-eyebrow">Conversations</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">Your matches</h1>
      </header>

      {conversations.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <OrbitEmblem size={110} />
          <p className="mt-6 max-w-xs font-serif text-xl text-ink">
            No conversations yet
          </p>
          <p className="mt-2 max-w-xs text-sm text-clay">
            When you and another soul both express interest, the conversation
            opens here.
          </p>
          <Link href="/discover" className="btn btn-primary mt-6 px-6 py-3">
            Find your alignments
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-px overflow-hidden rounded-2xl border border-hairline">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/chat/${c.id}`} className="flex items-center gap-3 bg-white/50 px-4 py-3">
                <Avatar src={c.photoUrl} name={c.name} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-ink">{c.name}</span>
                    <span className="text-[0.6rem] font-medium uppercase tracking-wider" style={{ color: c.tierColor }}>
                      {c.tierName}
                    </span>
                  </div>
                  <p className="truncate text-sm text-clay">
                    {c.lastMessage ?? "Say hello — the stars approve."}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
