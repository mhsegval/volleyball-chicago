"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";

export function LowBalanceBanner({ balance }: { balance: number }) {
  const [open, setOpen] = useState(false);

  if (balance > 10) return null;

  return (
    <>
      <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">low balance</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your balance is ${balance.toFixed(2)}. Add funds to avoid signup
              issues.
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white"
        >
          pay now
        </button>
      </section>

      <PaymentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
