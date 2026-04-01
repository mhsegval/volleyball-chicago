"use client";

import { useMemo, useState, useTransition } from "react";
import { addSignup } from "@/lib/actions";
import { PaymentModal } from "@/components/payment-modal";
import type { Run, Signup, UserProfile } from "@/lib/types";
import { UserPlus, Wallet, CircleAlert } from "lucide-react";

function roundUpToNearestHalf(value: number) {
  return Math.ceil(value * 2) / 2;
}

function getRequiredPerSpot(totalRent: number, maxPlayers: number) {
  if (!maxPlayers || maxPlayers <= 0) return Number(totalRent);
  return Number(
    roundUpToNearestHalf(Number(totalRent) / Number(maxPlayers)).toFixed(2),
  );
}

function getRequestedSpots(guestCount: number) {
  return 1 + Math.max(0, guestCount);
}

function getRosterSpotCount(signups: (Signup & { users: UserProfile })[]) {
  return signups
    .filter((s) => s.status === "roster")
    .reduce((sum, s) => sum + 1 + Number(s.guest_count ?? 0), 0);
}

export function RunSignupCard({
  run,
  currentUser,
  signups,
}: {
  run: Run | null;
  currentUser: UserProfile;
  signups: (Signup & { users: UserProfile })[];
}) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<0 | 1>(0);

  const [paymentOpen, setPaymentOpen] = useState(false);

  const mySignup = useMemo(
    () => signups.find((s) => s.user_id === currentUser.id),
    [signups, currentUser.id],
  );

  if (!run || mySignup) return null;

  const requiredPerSpot = getRequiredPerSpot(
    Number(run.total_rent),
    Number(run.max_players),
  );

  const rosterSpotCount = getRosterSpotCount(signups);
  const spotsLeft = Math.max(0, Number(run.max_players) - rosterSpotCount);

  const requestedSpots = getRequestedSpots(mode);
  const requiredBalance = Number((requiredPerSpot * requestedSpots).toFixed(2));
  const hasEnoughBalance = Number(currentUser.balance) >= requiredBalance;
  const canFitRequestedSpots = requestedSpots <= spotsLeft;

  const canJoinSolo =
    Number(currentUser.balance) >= requiredPerSpot && spotsLeft >= 1;
  const canJoinWithGuest =
    Number(currentUser.balance) >= Number((requiredPerSpot * 2).toFixed(2)) &&
    spotsLeft >= 2;

  function submitSignup(guestCount: 0 | 1) {
    const amount = Number(
      (requiredPerSpot * getRequestedSpots(guestCount)).toFixed(2),
    );

    const ok = window.confirm(
      guestCount === 1
        ? `This will use 2 roster spots and requires at least $${amount.toFixed(
            2,
          )} balance. Continue?`
        : `This will use 1 roster spot and requires at least $${amount.toFixed(
            2,
          )} balance. Continue?`,
    );

    if (!ok) return;

    const fd = new FormData();
    fd.set("run_id", run.id);
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
              join
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              reserve your spot
            </h2>
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
              className={`mt-1 text-xs ${mode === 0 ? "text-slate-200" : "text-slate-500"}`}
            >
              1 spot · ${requiredPerSpot.toFixed(2)} required
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
              className={`mt-1 text-xs ${mode === 1 ? "text-slate-200" : "text-slate-500"}`}
            >
              2 spots · ${(requiredPerSpot * 2).toFixed(2)} required
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
              balance ${Number(currentUser.balance).toFixed(2)}
            </span>
          </div>
        </div>

        {!hasEnoughBalance ? (
          <div className="mt-4 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-4 w-4 text-amber-700" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-900">
                  not enough balance
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  You need ${requiredBalance.toFixed(2)} to continue.
                </p>

                <button
                  type="button"
                  onClick={() => setPaymentOpen(true)}
                  className="mt-3 inline-flex rounded-full border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800"
                >
                  pay now
                </button>
              </div>
            </div>
          </div>
        ) : !canFitRequestedSpots ? (
          <div className="mt-4 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-4 w-4 text-amber-700" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  not enough open spots
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  This option needs {requestedSpots} spots, but only {spotsLeft}{" "}
                  spot
                  {spotsLeft === 1 ? "" : "s"} are left.
                </p>
              </div>
            </div>
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
      </section>
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </>
  );
}
