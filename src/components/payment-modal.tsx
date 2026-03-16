"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Info, X } from "lucide-react";
import { createPaymentRequest } from "@/lib/actions";

const PAYMENT_EMAIL = "test53@gmail.com";

export function PaymentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"zelle" | "venmo" | "">("");
  const [step, setStep] = useState<"pick" | "instructions">("pick");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(PAYMENT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function handleConfirmPaid() {
    setError("");
    const formData = new FormData();
    formData.set("amount", amount);
    formData.set("method", method);

    startTransition(async () => {
      const result = await createPaymentRequest(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onClose();
      setAmount("");
      setMethod("");
      setStep("pick");
      setCopied(false);
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            className="fixed inset-0 z-40 bg-slate-900/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[32px] border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="h-1.5 w-14 rounded-full bg-slate-200" />
              <button
                onClick={onClose}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === "pick" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    pay balance
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Enter an amount greater than $1 and choose a payment method.
                  </p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    amount
                  </span>
                  <input
                    type="number"
                    min="1.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 20"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!amount || Number(amount) <= 1) {
                        setError("amount must be greater than 1");
                        return;
                      }
                      setMethod("zelle");
                      setStep("instructions");
                    }}
                    className="rounded-2xl bg-emerald-50 px-4 py-3 font-medium text-emerald-700"
                  >
                    pay via zelle
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!amount || Number(amount) <= 1) {
                        setError("amount must be greater than 1");
                        return;
                      }
                      setMethod("venmo");
                      setStep("instructions");
                    }}
                    className="rounded-2xl bg-sky-50 px-4 py-3 font-medium text-sky-700"
                  >
                    pay via venmo
                  </button>
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {method === "zelle"
                      ? "zelle instructions"
                      : "venmo instructions"}
                  </h3>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 text-sky-700" />
                    <p className="text-sm text-sky-800">
                      Send your payment to the email below, then confirm in the
                      app.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    payment email
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900">
                      {PAYMENT_EMAIL}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? "copied" : "copy"}
                    </button>
                  </div>
                </div>

                {method === "venmo" && (
                  <a
                    href="https://venmo.com/test53"
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white"
                  >
                    open venmo
                  </a>
                )}

                <button
                  type="button"
                  disabled={pending}
                  onClick={handleConfirmPaid}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {pending ? "confirming..." : "i have paid"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("pick")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
                >
                  go back
                </button>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
