import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProfileImage } from "@/components/ProfileImage";
import { OrbitEmblem } from "@/components/OrbitEmblem";
import { ChatRequests } from "@/components/ChatRequests";
import { getCurrentUser } from "@/lib/auth";
import { getChatData } from "@/lib/relationships";
import { parseCrop } from "@/lib/crop";

export default async function ChatListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingComplete) redirect("/onboarding");

  const { active, requests } = await getChatData(user);

  return (
    <AppShell>
      <header className="pt-10">
        <p className="label-eyebrow">Chats</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">Your conversations</h1>
      </header>

      <ChatRequests
        requests={requests.map((r) => ({
          id: r.id,
          name: r.name,
          age: r.age,
          essence: r.essence,
          photoUrl: r.photoUrl,
          photoCrop: r.photoCrop,
          tierName: r.tierName,
          tierColor: r.tierColor,
        }))}
      />

      {active.length === 0 && requests.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <OrbitEmblem size={110} />
          <p className="mt-6 max-w-xs font-serif text-xl text-ink">
            No conversations yet
          </p>
          <p className="mt-2 max-w-xs text-sm text-clay">
            Choose a soul and begin a conversation, or wait for someone to reach
            out — their request will appear here.
          </p>
          <Link href="/discover" className="btn btn-primary mt-6 px-6 py-3">
            Find your alignments
          </Link>
        </div>
      ) : (
        active.length > 0 && (
          <section className="mt-6">
            {requests.length > 0 && <p className="label-eyebrow">Conversations</p>}
            <ul className={`${requests.length > 0 ? "mt-3" : ""} space-y-px overflow-hidden rounded-2xl border border-hairline`}>
              {active.map((c) => (
                <li key={c.id}>
                  <Link href={`/chat/${c.id}`} className="flex items-center gap-3 bg-white/50 px-4 py-3">
                    <ProfileImage src={c.photoUrl} name={c.name} crop={parseCrop(c.photoCrop)} shape="circle" size={52} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg text-ink">{c.name}</span>
                        <span className="text-[0.6rem] font-medium uppercase tracking-wider" style={{ color: c.tierColor }}>
                          {c.tierName}
                        </span>
                      </div>
                      <p className="truncate text-sm text-clay">
                        {c.state === "declined" ? (
                          <span className="text-claret/80">Declined your request</span>
                        ) : c.state === "pending" ? (
                          <span className="italic">Waiting for them to accept…</span>
                        ) : (
                          (c.lastMessage ?? "Say hello — the stars approve.")
                        )}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      )}
    </AppShell>
  );
}
