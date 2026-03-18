"use client";

import { useState } from "react";
import { PaymentModal } from "@/components/payment-modal";

export function ProfilePaymentSection({
  lowBalance,
  hasPendingPayment,
}: {
  lowBalance: boolean;
  hasPendingPayment: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        {hasPendingPayment ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              payments
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              payment under review
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your balance update is pending review. No further action is needed
              right now.
            </p>
          </>
        ) : lowBalance ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
              balance
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              balance is running low
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add funds now to avoid any signup issues for upcoming runs.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              balance
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              add funds
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Top up your balance anytime with Zelle or Venmo.
            </p>
          </>
        )}

        {!hasPendingPayment && (
          <div className="mt-5">
            <button
              onClick={() => setOpen(true)}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white"
            >
              add funds
            </button>
          </div>
        )}
      </section>

      <PaymentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
