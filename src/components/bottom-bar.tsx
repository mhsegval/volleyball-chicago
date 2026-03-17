"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, User, Volleyball } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export function BottomBar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const homeActive = pathname === "/";
  const profileActive = pathname === "/profile";
  const adminActive = pathname.startsWith("/admin");

  const baseItem =
    "relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 transition active:scale-[0.98]";
  const inactiveItem = "text-slate-700 hover:bg-slate-50";
  const activeItem = "bg-sky-50 text-sky-700";
  const loadingItem = "opacity-70";

  function handleNavigate(href: string) {
    if (pathname === href) return;
    setLoadingTarget(href);
    router.push(href);
  }

  function navClass(isActive: boolean, href: string) {
    return `${baseItem} ${isActive ? activeItem : inactiveItem} ${
      loadingTarget === href ? loadingItem : ""
    }`;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2">
      <div className="rounded-[24px] border border-slate-200 bg-white px-2 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
        <div
          className={`grid gap-2 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}
        >
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className={navClass(homeActive, "/")}
          >
            <Volleyball className="h-6 w-6" />
            <span className="whitespace-nowrap text-[11px] font-semibold">
              home
            </span>
            {loadingTarget === "/" && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("/profile")}
            className={navClass(profileActive, "/profile")}
          >
            <User className="h-6 w-6" />
            <span className="whitespace-nowrap text-[11px] font-semibold">
              profile
            </span>
            {loadingTarget === "/profile" && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500" />
            )}
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => handleNavigate("/admin")}
              className={navClass(adminActive, "/admin")}
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="whitespace-nowrap text-[11px] font-semibold">
                admin
              </span>
              {loadingTarget === "/admin" && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500" />
              )}
            </button>
          )}

          <SignOutButton compact />
        </div>
      </div>
    </div>
  );
}
