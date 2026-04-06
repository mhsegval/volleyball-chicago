"use client";

import { useState } from "react";
import { Wallet, Flame, ChevronRight } from "lucide-react";
import { BottomBar } from "@/components/bottom-bar";
import { UserAvatar } from "@/components/user-avatar";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { ProfilePaymentSection } from "@/components/profile-payment-section";
import { ProfileHistoryDrawer } from "@/components/profile-history-drawer";
import type {
  UserProfile,
  BalanceHistoryItem,
  MatchHistoryItem,
} from "@/lib/types";

export function ProfilePageClient({
  profile,
  isLowBalance,
  hasPendingPayment,
  balanceHistory,
  matchHistory,
}: {
  profile: UserProfile;
  isLowBalance: boolean;
  hasPendingPayment: boolean;
  balanceHistory: BalanceHistoryItem[];
  matchHistory: MatchHistoryItem[];
}) {
  const [historyMode, setHistoryMode] = useState<"balance" | "streak" | null>(
    null,
  );

  const paymentProfileName =
    profile.name?.trim() || profile.email || "your profile name";

  return (
    <div className="space-y-5 px-4 py-5 pb-32">
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={profile.name || "user"}
            avatarUrl={profile.avatar_url}
            size={80}
          />

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              profile
            </p>
            <h1 className="mt-2 truncate text-3xl font-bold tracking-tight text-slate-900">
              {profile.name || "unnamed user"}
            </h1>
            <p className="mt-2 truncate text-sm text-slate-500">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setHistoryMode("balance")}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition active:scale-[0.98]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  balance
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              ${Number(profile.balance).toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-slate-500">tap to view history</p>
          </button>

          <button
            type="button"
            onClick={() => setHistoryMode("streak")}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition active:scale-[0.98]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  streak
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {profile.streak}
            </p>
            <p className="mt-2 text-xs text-slate-500">tap to view history</p>
          </button>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
            account
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            edit profile
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Update your name or photo at any time.
          </p>
        </div>

        <ProfileEditForm defaultName={profile.name ?? ""} />
      </section>

      <ProfilePaymentSection
        lowBalance={isLowBalance}
        hasPendingPayment={hasPendingPayment}
        profileName={paymentProfileName}
      />

      <ProfileHistoryDrawer
        open={historyMode !== null}
        onClose={() => setHistoryMode(null)}
        mode={historyMode}
        balanceHistory={balanceHistory}
        matchHistory={matchHistory}
      />

      <BottomBar isAdmin={profile.role === "admin"} />
    </div>
  );
}
