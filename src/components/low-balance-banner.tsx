"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";

export function LowBalanceBanner({ balance }: { balance: number }) {
  const [open, setOpen] = useState(false);

  if (balance > 10) return null;

  return (
    <>
      <section className="rounded-[32px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              balance
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              balance is running low
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your current balance is ${balance.toFixed(2)}. Add funds now to
              stay ready for the next run.
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white"
        >
          add funds
        </button>
      </section>

      <PaymentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
