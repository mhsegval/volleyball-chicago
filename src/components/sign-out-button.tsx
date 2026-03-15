import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut} className="w-full">
      <button
        className={
          compact
            ? "flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
        }
      >
        <LogOut className="h-4 w-4" />
        <span>sign out</span>
      </button>
    </form>
  );
}
