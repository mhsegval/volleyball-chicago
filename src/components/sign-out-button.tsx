"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-slate-700 transition active:scale-[0.98] hover:bg-slate-50 disabled:opacity-60`}
      >
        <LogOut className="h-6 w-6" />
        <span className="whitespace-nowrap text-[11px] font-semibold">
          {pending ? "loading..." : "log out"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition active:scale-[0.98] disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      {pending ? "signing out..." : "sign out"}
    </button>
  );
}
