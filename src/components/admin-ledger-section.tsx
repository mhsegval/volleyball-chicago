"use client";

import { useMemo, useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Volleyball,
  Receipt,
} from "lucide-react";

type LedgerUser = {
  id: string;
  name: string;
  email: string;
};

export type AdminLedgerEntry = {
  id: string;
  kind:
    | "payment_submitted"
    | "payment_approved"
    | "payment_rejected"
    | "payment_reversed"
    | "manual_balance_adjustment"
    | "run_completed"
    | "run_charge";
  amount: number;
  method: "zelle" | "venmo" | null;
  note: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  user?: LedgerUser;
  actor?: LedgerUser;
};

type FilterKey = "all" | "payments" | "adjustments" | "runs";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

function getTone(kind: AdminLedgerEntry["kind"]) {
  switch (kind) {
    case "payment_submitted":
      return {
        chip: "bg-amber-50 text-amber-700",
        icon: <Wallet className="h-4 w-4" />,
        label: "submitted",
      };
    case "payment_approved":
      return {
        chip: "bg-emerald-50 text-emerald-700",
        icon: <ArrowDownLeft className="h-4 w-4" />,
        label: "approved",
      };
    case "payment_rejected":
      return {
        chip: "bg-rose-50 text-rose-700",
        icon: <ArrowUpRight className="h-4 w-4" />,
        label: "rejected",
      };
    case "payment_reversed":
      return {
        chip: "bg-orange-50 text-orange-700",
        icon: <ArrowUpRight className="h-4 w-4" />,
        label: "reversed",
      };
    case "manual_balance_adjustment":
      return {
        chip: "bg-sky-50 text-sky-700",
        icon: <SlidersHorizontal className="h-4 w-4" />,
        label: "adjustment",
      };
    case "run_completed":
      return {
        chip: "bg-violet-50 text-violet-700",
        icon: <Volleyball className="h-4 w-4" />,
        label: "run completed",
      };
    case "run_charge":
      return {
        chip: "bg-cyan-50 text-cyan-700",
        icon: <Receipt className="h-4 w-4" />,
        label: "run charge",
      };
    default:
      return {
        chip: "bg-slate-100 text-slate-700",
        icon: <Wallet className="h-4 w-4" />,
        label: "entry",
      };
  }
}

function buildTitle(entry: AdminLedgerEntry) {
  const playerName = entry.user?.name || "player";
  const gymName =
    typeof entry.metadata?.gym_name === "string"
      ? entry.metadata.gym_name
      : "run";

  switch (entry.kind) {
    case "payment_submitted":
      return `${playerName} submitted a top-up`;
    case "payment_approved":
      return `${playerName} top-up approved`;
    case "payment_rejected":
      return `${playerName} top-up rejected`;
    case "payment_reversed":
      return `${playerName} approved payment reversed`;
    case "manual_balance_adjustment":
      return `${playerName} balance manually adjusted`;
    case "run_completed":
      return `${gymName} run completed`;
    case "run_charge":
      return `${playerName} was charged for ${gymName}`;
    default:
      return "ledger entry";
  }
}

function buildMeta(entry: AdminLedgerEntry) {
  const adminName = entry.actor?.name || "admin";
  const rosterCount =
    typeof entry.metadata?.roster_count === "number"
      ? entry.metadata.roster_count
      : null;

  switch (entry.kind) {
    case "payment_submitted":
      return `${entry.method || "payment"} • trust-based request`;
    case "payment_approved":
      return `approved by ${adminName}`;
    case "payment_rejected":
      return `rejected by ${adminName}`;
    case "payment_reversed":
      return `reversed by ${adminName}`;
    case "manual_balance_adjustment":
      return `updated by ${adminName}`;
    case "run_completed":
      return rosterCount
        ? `${rosterCount} roster player${rosterCount === 1 ? "" : "s"}`
        : "run finalized";
    case "run_charge":
      return `charged by ${adminName}`;
    default:
      return entry.note || "";
  }
}

export function AdminLedgerSection({
  entries = [],
  totalSystemBalance = 0,
}: {
  entries?: AdminLedgerEntry[];
  totalSystemBalance?: number;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const safeEntries = Array.isArray(entries) ? entries : [];

  const filteredEntries = useMemo(() => {
    return safeEntries.filter((entry) => {
      if (filter === "all") return true;
      if (filter === "payments") {
        return (
          entry.kind === "payment_submitted" ||
          entry.kind === "payment_approved" ||
          entry.kind === "payment_rejected" ||
          entry.kind === "payment_reversed"
        );
      }
      if (filter === "adjustments") {
        return entry.kind === "manual_balance_adjustment";
      }
      if (filter === "runs") {
        return entry.kind === "run_completed" || entry.kind === "run_charge";
      }
      return true;
    });
  }, [safeEntries, filter]);

  const approvedTotal = useMemo(
    () =>
      safeEntries
        .filter((entry) => entry.kind === "payment_approved")
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
    [safeEntries],
  );

  const reversedTotal = useMemo(
    () =>
      safeEntries
        .filter((entry) => entry.kind === "payment_reversed")
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
    [safeEntries],
  );

  const adjustmentNet = useMemo(
    () =>
      safeEntries
        .filter((entry) => entry.kind === "manual_balance_adjustment")
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
    [safeEntries],
  );

  const runChargesTotal = useMemo(
    () =>
      safeEntries
        .filter((entry) => entry.kind === "run_charge")
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
    [safeEntries],
  );

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
            ledger
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            funds overview
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Last 30 days of money movement across payments, adjustments, and
            runs.
          </p>
        </div>

        <div className="rounded-[24px] bg-slate-100 px-4 py-3 text-center">
          <p className="text-2xl font-bold leading-none text-slate-700">30</p>
          <p className="mt-1 text-sm font-medium text-slate-500">days</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            total balance
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(totalSystemBalance)}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            approved
          </p>
          <p className="mt-3 text-2xl font-bold text-emerald-700">
            {formatCurrency(approvedTotal)}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            reversed
          </p>
          <p className="mt-3 text-2xl font-bold text-orange-700">
            {formatCurrency(reversedTotal)}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            run charges
          </p>
          <p className="mt-3 text-2xl font-bold text-cyan-700">
            {formatCurrency(runChargesTotal)}
          </p>
        </div>

        <div className="col-span-2 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            adjustments
          </p>
          <p className="mt-3 text-2xl font-bold text-sky-700">
            {formatCurrency(adjustmentNet)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          label="all"
          onClick={() => setFilter("all")}
        />
        <FilterChip
          active={filter === "payments"}
          label="payments"
          onClick={() => setFilter("payments")}
        />
        <FilterChip
          active={filter === "adjustments"}
          label="adjustments"
          onClick={() => setFilter("adjustments")}
        />
        <FilterChip
          active={filter === "runs"}
          label="runs"
          onClick={() => setFilter("runs")}
        />
      </div>

      <div className="mt-5 space-y-2.5">
        {filteredEntries.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            No ledger activity found for the selected view.
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const tone = getTone(entry.kind);

            return (
              <article
                key={entry.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`rounded-xl p-2 ${tone.chip}`}>
                        {tone.icon}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tone.chip}`}
                      >
                        {tone.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-900 line-clamp-1">
                      {buildTitle(entry)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                      {buildMeta(entry)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(Number(entry.amount))}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
