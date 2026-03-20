"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Wallet, Flame } from "lucide-react";
import type { BalanceHistoryItem, MatchHistoryItem } from "@/lib/types";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export function ProfileHistoryDrawer({
  open,
  onClose,
  mode,
  balanceHistory,
  matchHistory,
}: {
  open: boolean;
  onClose: () => void;
  mode: "balance" | "streak" | null;
  balanceHistory: BalanceHistoryItem[];
  matchHistory: MatchHistoryItem[];
}) {
  return (
    <AnimatePresence>
      {open && mode && (
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

            {mode === "balance" ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                      balance
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      balance history
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Recent top-ups and run deductions.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {balanceHistory.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      No balance history yet.
                    </div>
                  ) : (
                    balanceHistory.map((item) => (
                      <div
                        key={`${item.kind}-${item.id}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">
                              {item.note}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(item.created_at)}
                              {item.method ? ` · ${item.method}` : ""}
                              {item.status ? ` · ${item.status}` : ""}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              item.kind === "payment"
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {item.kind === "payment" ? "+" : "-"}$
                            {Number(item.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                      streak
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      match history
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Your recent completed runs and participation.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {matchHistory.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      No match history yet.
                    </div>
                  ) : (
                    matchHistory.map((item) => (
                      <div
                        key={item.run_id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">
                              {item.gym_name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(item.date)} · {item.player_count}{" "}
                              players
                            </p>
                            {item.did_play && item.your_share !== null ? (
                              <p className="mt-2 text-sm font-medium text-slate-700">
                                your share · $
                                {Number(item.your_share).toFixed(2)}
                              </p>
                            ) : null}
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              item.did_play
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            {item.did_play ? "played" : "missed"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
