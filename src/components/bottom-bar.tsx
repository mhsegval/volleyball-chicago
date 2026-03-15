"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, User, Volleyball } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export function BottomBar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const homeActive = pathname === "/";
  const profileActive = pathname === "/profile";
  const adminActive = pathname.startsWith("/admin");

  const baseItem =
    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 transition";
  const inactiveItem = "text-slate-700 hover:bg-slate-50";
  const activeItem = "bg-sky-50 text-sky-700";

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2">
      <div className="rounded-[24px] border border-slate-200 bg-white px-2 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
        <div
          className={`grid gap-2 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}
        >
          <Link
            href="/"
            className={`${baseItem} ${homeActive ? activeItem : inactiveItem}`}
          >
            <Volleyball className="h-6 w-6" />
            <span className="whitespace-nowrap text-[11px] font-semibold">
              home
            </span>
          </Link>

          <Link
            href="/profile"
            className={`${baseItem} ${profileActive ? activeItem : inactiveItem}`}
          >
            <User className="h-6 w-6" />
            <span className="whitespace-nowrap text-[11px] font-semibold">
              profile
            </span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`${baseItem} ${adminActive ? activeItem : inactiveItem}`}
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
