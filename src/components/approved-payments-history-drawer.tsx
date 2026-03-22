"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { History, X } from "lucide-react";
import type { PaymentRequest, UserProfile } from "@/lib/types";
import { ReverseApprovedPaymentButton } from "@/components/reverse-approved-payment-button";

type ApprovedPaymentWithUsers = PaymentRequest & {
  users?: Pick<UserProfile, "id" | "name" | "email">;
  reviewed_by_user?: Pick<UserProfile, "id" | "name" | "email">;
};

export function ApprovedPaymentsHistoryDrawer({
  payments,
}: {
  payments: ApprovedPaymentWithUsers[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition active:scale-[0.99]"
      >
        <History className="h-4 w-4" />
        history
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-slate-900/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] max-w-md overflow-hidden rounded-t-[32px] border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                    payments
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    approved history
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    last 20 approved payments
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(85vh-96px)] space-y-3 overflow-y-auto px-5 py-4">
                {payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No approved payments found yet.
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {payment.users?.name || "user"}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {payment.users?.email || "no email"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ${Number(payment.amount).toFixed(2)} via{" "}
                            {payment.method}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            approved{" "}
                            {payment.reviewed_at
                              ? new Date(payment.reviewed_at).toLocaleString()
                              : ""}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            approved by{" "}
                            <span className="font-medium text-slate-700">
                              {payment.reviewed_by_user?.name ||
                                "unknown admin"}
                            </span>
                          </p>
                        </div>

                        <ReverseApprovedPaymentButton
                          requestId={payment.id}
                          amount={Number(payment.amount)}
                          userName={payment.users?.name}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
