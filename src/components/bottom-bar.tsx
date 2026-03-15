import Link from "next/link";
import { ShieldCheck, User, Volleyball } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export function BottomBar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-4">
      <div className="rounded-[24px] border border-slate-200 bg-white/95 p-2 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div
          className={`grid gap-2 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Volleyball className="h-4 w-4" />
            <span>home</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <User className="h-4 w-4" />
            <span>profile</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-50 px-3 py-3 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>admin</span>
            </Link>
          )}

          <SignOutButton compact />
        </div>
      </div>
    </div>
  );
}
