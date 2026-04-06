"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  MapPin,
  Wallet,
  UserPlus,
  CircleAlert,
  Sparkles,
} from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";
import { addSignup } from "@/lib/actions";
import type { Run, Signup, UserProfile } from "@/lib/types";
import { formatRunWindow } from "@/lib/format";
import {
  getPerSpotAmount,
  getRequestedSpots,
  getSuggestedTopUpAmount,
} from "@/lib/payment";

function getRosterSpotCount(signups: (Signup & { users: UserProfile })[]) {
  return signups
    .filter((s) => s.status === "roster")
    .reduce((sum, s) => sum + 1 + Number(s.guest_count ?? 0), 0);
}

export function NextRunBanner({
  run,
  currentUser,
  signups,
}: {
  run: Run | null;
  currentUser?: UserProfile;
  signups?: (Signup & { users: UserProfile })[];
}) {
  const [mode, setMode] = useState<0 | 1>(0);
  const [pending, startTransition] = useTransition();
  const [paymentOpen, setPaymentOpen] = useState(false);

  if (!run) {
    return (
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              upcoming run
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              no active run
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              A new run has not been posted yet. Check back soon.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            waiting
          </span>
        </div>
      </section>
    );
  }

  const activeRun = run;
  const safeSignups = signups ?? [];
  const mySignup = currentUser
    ? safeSignups.find((s) => s.user_id === currentUser.id)
    : undefined;

  const currentBalance = Number(currentUser?.balance ?? 0);
  const selectedGuestCount: 0 | 1 = mode;
  const requestedSpots = getRequestedSpots(selectedGuestCount);

  const requiredPerSpot = getPerSpotAmount(
    Number(activeRun.total_rent),
    Number(activeRun.max_players),
  );

  const rosterSpotCount = getRosterSpotCount(safeSignups);
  const spotsLeft = Math.max(
    0,
    Number(activeRun.max_players) - rosterSpotCount,
  );

  const requiredBalance = Number((requiredPerSpot * requestedSpots).toFixed(2));
  const hasEnoughBalance = currentBalance >= requiredBalance;
  const hasEnoughSpots = spotsLeft >= requestedSpots;

  const canJoinSolo = currentBalance >= requiredPerSpot && spotsLeft >= 1;
  const canJoinWithGuest =
    currentBalance >= Number((requiredPerSpot * 2).toFixed(2)) &&
    spotsLeft >= 2;

  const suggestedTopUp = useMemo(() => {
    if (!currentUser) return undefined;

    return getSuggestedTopUpAmount({
      totalRent: Number(activeRun.total_rent),
      maxPlayers: Number(activeRun.max_players),
      guestCount: selectedGuestCount,
      currentBalance,
    });
  }, [
    activeRun.total_rent,
    activeRun.max_players,
    currentUser,
    currentBalance,
    selectedGuestCount,
  ]);

  const paymentProfileName =
    currentUser?.name?.trim() || currentUser?.email || "your profile name";

  function submitSignup(guestCount: 0 | 1) {
    if (!currentUser) return;

    const totalRequired = Number(
      (requiredPerSpot * getRequestedSpots(guestCount)).toFixed(2),
    );

    const ok = window.confirm(
      guestCount === 1
        ? `This will use 2 spots and requires at least $${totalRequired.toFixed(
            2,
          )} balance. Continue?`
        : `This will use 1 spot and requires at least $${totalRequired.toFixed(
            2,
          )} balance. Continue?`,
    );

    if (!ok) return;

    const fd = new FormData();
    fd.set("run_id", activeRun.id);
    fd.set("user_id", currentUser.id);
    fd.set("guest_count", String(guestCount));

    startTransition(async () => {
      await addSignup(fd);
    });
  }

  return (
    <>
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              upcoming run
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {activeRun.gym_name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {formatRunWindow(
                activeRun.date,
                activeRun.start_time,
                activeRun.end_time,
              )}
            </p>
          </div>

          <div className="rounded-[24px] bg-slate-100 px-4 py-3 text-center">
            <p className="text-2xl font-bold leading-none text-slate-700">
              {spotsLeft}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              spots left
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                schedule
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatRunWindow(
                  activeRun.date,
                  activeRun.start_time,
                  activeRun.end_time,
                )}
              </p>
            </div>
          </div>

          <a
            href={activeRun.location_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300"
          >
            <MapPin className="h-4 w-4 text-slate-500" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                location
              </p>
              <p className="mt-1 truncate text-sm font-medium text-slate-900">
                open map
              </p>
            </div>
          </a>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Wallet className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                minimum signup balance
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                ${requiredPerSpot.toFixed(2)} per spot
              </p>
            </div>
          </div>
        </div>

        {!mySignup && currentUser && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode(0)}
                className={`rounded-[24px] border px-4 py-4 text-left transition ${
                  mode === 0
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-900"
                }`}
              >
                <p className="text-sm font-semibold">join run</p>
                <p
                  className={`mt-1 text-xs ${
                    mode === 0 ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  1 spot · ${requiredPerSpot.toFixed(2)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode(1)}
                className={`rounded-[24px] border px-4 py-4 text-left transition ${
                  mode === 1
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <p className="text-sm font-semibold">me + 1</p>
                </div>
                <p
                  className={`mt-1 text-xs ${
                    mode === 1 ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  2 spots · ${(requiredPerSpot * 2).toFixed(2)}
                </p>
              </button>
            </div>

            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">
                    required now:{" "}
                    <span className="font-semibold text-slate-900">
                      ${requiredBalance.toFixed(2)}
                    </span>
                  </span>
                </div>

                <span className="text-sm text-slate-500">
                  balance ${currentBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {!hasEnoughBalance ? (
              <div className="mt-4 overflow-hidden rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
                      <Sparkles className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        add funds before joining
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        You need{" "}
                        <span className="font-semibold text-slate-900">
                          ${requiredBalance.toFixed(2)}
                        </span>{" "}
                        for this option. The app will suggest the right amount
                        for your run and current balance.
                      </p>

                      {suggestedTopUp ? (
                        <div className="mt-3 inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800">
                          suggested top-up ${suggestedTopUp.toFixed(2)}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setPaymentOpen(true)}
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
                      >
                        add funds
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !hasEnoughSpots ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 text-amber-700" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        roster is full
                      </p>
                      <p className="mt-1 text-sm text-amber-800">
                        You can still join the waitlist with this option.
                      </p>
                    </div>
                  </div>
                </div>

                {mode === 0 ? (
                  <button
                    type="button"
                    disabled={pending || !hasEnoughBalance}
                    onClick={() => submitSignup(0)}
                    className="w-full rounded-[24px] bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                  >
                    {pending ? "working..." : "join waitlist"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending || !hasEnoughBalance}
                    onClick={() => submitSignup(1)}
                    className="w-full rounded-[24px] bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                  >
                    {pending ? "working..." : "join waitlist with guest"}
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4">
                {mode === 0 ? (
                  <button
                    type="button"
                    disabled={pending || !canJoinSolo}
                    onClick={() => submitSignup(0)}
                    className="w-full rounded-[24px] bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                  >
                    {pending ? "working..." : "join run"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending || !canJoinWithGuest}
                    onClick={() => submitSignup(1)}
                    className="w-full rounded-[24px] bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                  >
                    {pending ? "working..." : "join with guest"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {currentUser && (
        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          profileName={paymentProfileName}
          suggestedAmount={suggestedTopUp}
        />
      )}
    </>
  );
}
