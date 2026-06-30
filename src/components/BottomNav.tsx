"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/discover", label: "Aligned", icon: AlignedIcon },
  { href: "/refine", label: "Refine", icon: RefineIcon },
  { href: "/you", label: "You", icon: YouIcon },
  { href: "/plans", label: "Plans", icon: PlansIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
              style={{ color: active ? "#7e3340" : "#8c857a" }}
            >
              <Icon active={active} />
              <span className="text-[0.62rem] font-medium uppercase tracking-[0.14em]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

type IconProps = { active?: boolean };

function AlignedIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6}>
      <circle cx="12" cy="12" r="9" opacity="0.45" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="21" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RefineIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function YouIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 19.5c0-3.6 3.1-6 7-6s7 2.4 7 6" strokeLinecap="round" />
    </svg>
  );
}

function PlansIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinejoin="round">
      <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 7.2 18.7l.9-5.4L4.2 9.5l5.4-.8z" />
    </svg>
  );
}
