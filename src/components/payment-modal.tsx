"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Info,
  X,
} from "lucide-react";
import { createPaymentRequest } from "@/lib/actions";
import { getPaymentMemo } from "@/lib/payment";

const ZELLE_EMAIL = "moizkarimi786@gmail.com";
const VENMO_ID = "@Moiz-Karimi";
const VENMO_LINK =
  "https://venmo.com/code?user_id=2354556998516736986&created=1774042883";

type PaymentMethod = "zelle" | "venmo" | "";

function formatAmount(value?: number) {
  if (!value || Number.isNaN(value) || value <= 0) return "";
  return value.toFixed(2);
}

function formatCurrency(value: string) {
  const num = Number(value);
  if (!value || Number.isNaN(num)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function PaymentModal({
  open,
  onClose,
  profileName = "your profile name",
  suggestedAmount,
  title = "pay outside the app first",
  description = "this app does not move money. please send the payment by zelle or venmo first, then come back and confirm it here. if we cannot match the payment, your balance update may be reversed.",
}: {
  open: boolean;
  onClose: () => void;
  profileName?: string;
  suggestedAmount?: number;
  title?: string;
  description?: string;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("");
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [confirmedExternalPayment, setConfirmedExternalPayment] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    setAmount(formatAmount(suggestedAmount));
    setMethod("");
    setStep("details");
    setError("");
    setCopiedTarget(false);
    setCopiedMemo(false);
    setConfirmedExternalPayment(false);
  }, [open, suggestedAmount]);

  const paymentTarget = method === "venmo" ? VENMO_ID : ZELLE_EMAIL;
  const memoValue = getPaymentMemo(profileName);

  const canContinue =
    !!amount &&
    Number(amount) > 1 &&
    (method === "zelle" || method === "venmo");

  const amountLabel = useMemo(() => formatCurrency(amount), [amount]);

  async function copyText(value: string, type: "target" | "memo") {
    try {
      await navigator.clipboard.writeText(value);

      if (type === "target") {
        setCopiedTarget(true);
        setTimeout(() => setCopiedTarget(false), 1500);
      } else {
        setCopiedMemo(true);
        setTimeout(() => setCopiedMemo(false), 1500);
      }
    } catch {}
  }

  function handleClose() {
    onClose();
    setError("");
  }

  function handleContinue() {
    setError("");

    if (!amount || Number(amount) <= 1) {
      setError("amount must be greater than $1");
      return;
    }

    if (method !== "zelle" && method !== "venmo") {
      setError("please choose zelle or venmo");
      return;
    }

    setStep("confirm");
  }

  function handleConfirmPaid() {
    setError("");

    if (!confirmedExternalPayment) {
      setError(
        "please confirm that you already sent the payment outside the app",
      );
      return;
    }

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
      setStep("details");
      setCopiedTarget(false);
      setCopiedMemo(false);
      setConfirmedExternalPayment(false);
      setError("");
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="fixed inset-0 z-50 sm:inset-x-0 sm:bottom-0 sm:top-auto sm:mx-auto sm:max-w-md"
          >
            <div className="flex h-[100dvh] flex-col bg-white sm:h-auto sm:max-h-[88dvh] sm:rounded-t-[32px] sm:border sm:border-slate-200 sm:shadow-2xl">
              <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur">
                <div className="px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9" />
                    <div className="h-1.5 w-14 rounded-full bg-slate-200 sm:block hidden" />
                    <div className="h-1.5 w-14 rounded-full bg-slate-200 sm:hidden" />
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-[0.98]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                {step === "details" ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                        payment
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {description}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                        <div className="text-sm leading-6 text-amber-900">
                          <p className="font-semibold">
                            send the money first outside the app
                          </p>
                          <p className="mt-1">
                            only tap continue after you have already paid by
                            zelle or venmo.
                          </p>
                        </div>
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        amount to add
                      </span>
                      <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="number"
                            min="1.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="enter amount"
                            required
                            className="w-full bg-transparent text-lg font-semibold text-slate-900 outline-none"
                          />
                          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {amountLabel}
                          </span>
                        </div>
                      </div>

                      {suggestedAmount && suggestedAmount > 0 ? (
                        <p className="mt-2 text-xs text-slate-500">
                          suggested amount based on your current balance and
                          run:{" "}
                          <span className="font-semibold text-slate-700">
                            ${suggestedAmount.toFixed(2)}
                          </span>
                        </p>
                      ) : null}
                    </label>

                    <div>
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        payment method
                      </span>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMethod("zelle")}
                          className={`rounded-[24px] border px-4 py-4 text-left transition active:scale-[0.98] ${
                            method === "zelle"
                              ? "border-emerald-300 bg-emerald-50 shadow-sm"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            zelle
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            send using email
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMethod("venmo")}
                          className={`rounded-[24px] border px-4 py-4 text-left transition active:scale-[0.98] ${
                            method === "venmo"
                              ? "border-sky-300 bg-sky-50 shadow-sm"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            venmo
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            send using username
                          </p>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                        <div className="min-w-0 text-sm leading-6 text-slate-700">
                          <p className="font-semibold text-slate-900">
                            include this in your memo
                          </p>
                          <p className="mt-1 text-slate-500">
                            this helps the admin match your payment faster.
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <div className="min-w-0 flex-1 truncate rounded-2xl border border-slate-200 bg-white px-3 py-3 font-medium text-slate-900">
                              {memoValue}
                            </div>

                            <button
                              type="button"
                              onClick={() => copyText(memoValue, "memo")}
                              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition active:scale-[0.98]"
                            >
                              {copiedMemo ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              {copiedMemo ? "copied" : "copy"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                        confirm payment
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        finish your top-up
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        please send the payment using the details below, then
                        confirm it in the app.
                      </p>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[20px] border border-slate-200 bg-white p-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            amount
                          </p>
                          <p className="mt-2 text-lg font-bold text-slate-900">
                            {amountLabel}
                          </p>
                        </div>

                        <div className="rounded-[20px] border border-slate-200 bg-white p-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            method
                          </p>
                          <p className="mt-2 text-lg font-bold capitalize text-slate-900">
                            {method}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-[20px] border border-slate-200 bg-white p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          {method === "venmo"
                            ? "venmo username"
                            : "zelle email"}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="min-w-0 flex-1 break-all text-sm font-medium text-slate-900">
                            {paymentTarget}
                          </div>

                          <button
                            type="button"
                            onClick={() => copyText(paymentTarget, "target")}
                            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition active:scale-[0.98]"
                          >
                            {copiedTarget ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copiedTarget ? "copied" : "copy"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 rounded-[20px] border border-slate-200 bg-white p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          memo to include
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="min-w-0 flex-1 break-all text-sm font-medium text-slate-900">
                            {memoValue}
                          </div>

                          <button
                            type="button"
                            onClick={() => copyText(memoValue, "memo")}
                            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition active:scale-[0.98]"
                          >
                            {copiedMemo ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copiedMemo ? "copied" : "copy"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                        <div className="text-sm leading-6 text-sky-900">
                          <p className="font-semibold">important</p>
                          <p className="mt-1">
                            this app only updates your balance request. it does
                            not charge your card or move money for you.
                          </p>
                          <p className="mt-2">
                            if the payment was not actually sent outside the
                            app, the request may be reversed by the admin.
                          </p>
                        </div>
                      </div>
                    </div>

                    {method === "venmo" ? (
                      <a
                        href={VENMO_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-sky-200 bg-sky-600 px-4 py-3 font-semibold text-white transition active:scale-[0.98]"
                      >
                        open venmo
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}

                    <label className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-white p-4">
                      <input
                        type="checkbox"
                        checked={confirmedExternalPayment}
                        onChange={(e) =>
                          setConfirmedExternalPayment(e.target.checked)
                        }
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                      <span className="text-sm leading-6 text-slate-700">
                        i already sent this payment outside the app and
                        understand that unmatched payments may be reversed.
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 z-10 border-t border-slate-100 bg-white/95 backdrop-blur">
                <div className="space-y-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
                  {error ? (
                    <p className="text-sm text-rose-600">{error}</p>
                  ) : null}

                  {step === "details" ? (
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={!canContinue}
                      className="w-full rounded-[24px] bg-slate-900 px-4 py-3.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      continue
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={handleConfirmPaid}
                        className="w-full rounded-[24px] bg-slate-900 px-4 py-3.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pending
                          ? "updating balance..."
                          : "i have already paid"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setStep("details");
                        }}
                        className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-slate-700 transition active:scale-[0.98]"
                      >
                        go back
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
