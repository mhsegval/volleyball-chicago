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
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        {hasPendingPayment ? (
          <>
            <h2 className="text-xl font-bold text-slate-900">
              payment pending
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your payment was submitted and is waiting for admin review.
            </p>
          </>
        ) : lowBalance ? (
          <>
            <h2 className="text-xl font-bold text-slate-900">low balance</h2>
            <p className="mt-2 text-sm text-slate-500">
              Your balance is $10 or less. Add funds now to avoid signup issues.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900">add funds</h2>
            <p className="mt-2 text-sm text-slate-500">
              Top up your balance using Zelle or Venmo.
            </p>
          </>
        )}

        <div className="mt-4">
          <button
            onClick={() => setOpen(true)}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white"
          >
            pay now
          </button>
        </div>
      </section>

      <PaymentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
