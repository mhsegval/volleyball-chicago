import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut} className="w-full">
      <button
        className={
          compact
            ? "flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-sm text-white"
            : "inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
        }
      >
        <LogOut className="h-4 w-4" />
        <span></span>
      </button>
    </form>
  );
}
