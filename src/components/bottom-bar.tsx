import Link from "next/link";
import { ShieldCheck, User, Volleyball } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export function BottomBar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-white/10 bg-slate-950/90 px-3 py-3 backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-sm"
        >
          <Volleyball className="h-4 w-4" />
          <span>home</span>
        </Link>

        <Link
          href="/profile"
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-sm"
        >
          <User className="h-4 w-4" />
          <span>profile</span>
        </Link>

        {isAdmin ? (
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500/20 px-3 py-3 text-sm text-sky-200"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>admin</span>
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center justify-center">
          <SignOutButton compact />
        </div>
      </div>
    </div>
  );
}
