"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProfileImage } from "./ProfileImage";
import { acceptRequest, declineRequest } from "@/app/actions/relations";
import { parseCrop } from "@/lib/crop";

export type RequestItem = {
  id: string;
  name: string;
  age: number | null;
  essence: string | null;
  photoUrl: string | null;
  photoCrop: string | null;
  tierName: string;
  tierColor: string;
};

export function ChatRequests({ requests }: { requests: RequestItem[] }) {
  const [items, setItems] = useState(requests);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (items.length === 0) return null;

  const accept = (id: string) => {
    startTransition(async () => {
      const res = await acceptRequest(id);
      setItems((xs) => xs.filter((x) => x.id !== id));
      if (res.ok) router.push(`/chat/${id}`);
    });
  };
  const decline = (id: string) => {
    startTransition(async () => {
      await declineRequest(id);
      setItems((xs) => xs.filter((x) => x.id !== id));
      router.refresh();
    });
  };

  return (
    <section className="mt-6">
      <p className="label-eyebrow">
        Chat requests{items.length > 0 ? ` · ${items.length}` : ""}
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((r) => (
          <li key={r.id} className="card p-3">
            <div className="flex items-center gap-3">
              <ProfileImage src={r.photoUrl} name={r.name} crop={parseCrop(r.photoCrop)} shape="circle" size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-ink">
                    {r.name}
                    {r.age != null && <span className="text-clay">, {r.age}</span>}
                  </span>
                  <span className="text-[0.6rem] font-medium uppercase tracking-wider" style={{ color: r.tierColor }}>
                    {r.tierName}
                  </span>
                </div>
                <p className="truncate text-sm text-clay">
                  {r.essence ?? "Would like to connect with you."}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => accept(r.id)}
                disabled={pending}
                className="btn btn-primary flex-1 px-4 py-2 text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => decline(r.id)}
                disabled={pending}
                className="btn btn-ghost flex-1 px-4 py-2 text-sm"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
