import Link from "next/link";
import { ShieldCheck, User, Volleyball } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export function BottomBar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2">
      <div className="rounded-[24px] border border-slate-200 bg-white px-2 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
        <div
          className={`grid gap-2 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}
        >
          <Link
            href="/"
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-slate-700 transition hover:bg-slate-50"
          >
            <Volleyball className="h-6 w-6" />
            <span className="whitespace-nowrap text-[11px] font-semibold">
              home
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-slate-700 transition hover:bg-slate-50"
          >
            <User className="h-6 w-6" />
            <span className="whitespace-nowrap text-[11px] font-semibold">
              profile
            </span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl bg-sky-50 px-2 py-3 text-sky-700 transition hover:bg-sky-100"
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="whitespace-nowrap text-[11px] font-semibold">
                admin
              </span>
            </Link>
          )}

          <SignOutButton compact />
        </div>
      </div>
    </div>
  );
}
