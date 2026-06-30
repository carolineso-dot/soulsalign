import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  children: ReactNode;
  /** Hide the bottom navigation (e.g. inside a chat thread). */
  hideNav?: boolean;
};

/** Mobile-first centered column with room for the fixed bottom nav. */
export function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5">
      <main className={`flex-1 ${hideNav ? "" : "pb-24"}`}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
