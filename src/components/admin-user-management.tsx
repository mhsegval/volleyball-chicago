"use client";

import { useMemo, useState, useTransition } from "react";
import {
  updateUserBalance,
  updateUserName,
  updateUserRole,
} from "@/lib/actions";
import type { UserProfile } from "@/lib/types";

const PAGE_SIZE = 10;

type FilterKey =
  | "all"
  | "balance_positive"
  | "balance_zero"
  | "balance_negative"
  | "admins"
  | "players";

function PaginationControls({
  page,
  totalPages,
  totalResults,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalResults: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <button
        type="button"
        onClick={onPrevious}
        disabled={page === 1}
        className="min-w-[88px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition active:scale-[0.99] disabled:opacity-40"
      >
        previous
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">
          page {page} of {totalPages}
        </p>
        <p className="text-[11px] text-slate-400">
          {totalResults} result{totalResults === 1 ? "" : "s"}
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={page === totalPages}
        className="min-w-[88px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition active:scale-[0.99] disabled:opacity-40"
      >
        next
      </button>
    </div>
  );
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

function UserCard({ user }: { user: UserProfile }) {
  const [pending, startTransition] = useTransition();

  function handleNameSubmit(formData: FormData) {
    startTransition(async () => {
      await updateUserName(formData);
    });
  }

  function handleBalanceSubmit(formData: FormData) {
    startTransition(async () => {
      await updateUserBalance(formData);
    });
  }

  function handleRoleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateUserRole(formData);
    });
  }

  const balance = Number(user.balance ?? 0);
  const formattedBalance = balance.toFixed(2);
  const isAdmin = user.role === "admin";

  const balanceTone =
    balance > 0
      ? "bg-emerald-50 text-emerald-700"
      : balance < 0
        ? "bg-rose-50 text-rose-700"
        : "bg-slate-100 text-slate-600";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {user.name || "Unnamed user"}
          </h3>
          <p className="truncate text-xs text-slate-500">
            {user.email || "No email"}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${balanceTone}`}
          >
            ${formattedBalance}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
              isAdmin
                ? "bg-purple-50 text-purple-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {isAdmin ? "admin" : "player"}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <form action={handleNameSubmit}>
          <input type="hidden" name="user_id" value={user.id} />
          <div className="flex gap-2">
            <input
              name="name"
              defaultValue={user.name}
              placeholder="name"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
            />
            <button
              disabled={pending}
              className="shrink-0 rounded-xl bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 transition active:scale-[0.99] disabled:opacity-60"
            >
              {pending ? "saving..." : "save"}
            </button>
          </div>
        </form>

        <form action={handleBalanceSubmit}>
          <input type="hidden" name="user_id" value={user.id} />
          <div className="flex gap-2">
            <input
              name="balance"
              type="number"
              step="0.01"
              defaultValue={user.balance}
              placeholder="balance"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
            />
            <button
              disabled={pending}
              className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition active:scale-[0.99] disabled:opacity-60"
            >
              {pending ? "saving..." : "save"}
            </button>
          </div>
        </form>

        <form action={handleRoleSubmit}>
          <input type="hidden" name="user_id" value={user.id} />
          <input type="hidden" name="role" value={isAdmin ? "user" : "admin"} />
          <button
            disabled={pending}
            className={`w-full rounded-xl px-3 py-2 text-xs font-medium transition active:scale-[0.99] disabled:opacity-60 ${
              isAdmin
                ? "bg-orange-50 text-orange-700"
                : "bg-purple-50 text-purple-700"
            }`}
          >
            {pending
              ? "saving..."
              : isAdmin
                ? "remove admin access"
                : "grant admin access"}
          </button>
        </form>
      </div>
    </article>
  );
}

export function AdminUserManagement({ users }: { users: UserProfile[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const balance = Number(user.balance ?? 0);
      const matchesSearch = !q || name.includes(q) || email.includes(q);

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "balance_positive"
            ? balance > 0
            : filter === "balance_zero"
              ? balance === 0
              : filter === "balance_negative"
                ? balance < 0
                : filter === "admins"
                  ? user.role === "admin"
                  : user.role === "user";

      return matchesSearch && matchesFilter;
    });
  }, [users, query, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, safePage]);

  function updateFilter(nextFilter: FilterKey) {
    setFilter(nextFilter);
    setPage(1);
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
            players
          </p>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
            user management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter, update balance, and manage access.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          {users.length} total
        </span>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="search by name or email"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          label="all"
          onClick={() => updateFilter("all")}
        />
        <FilterChip
          active={filter === "balance_positive"}
          label="balance > 0"
          onClick={() => updateFilter("balance_positive")}
        />
        <FilterChip
          active={filter === "balance_zero"}
          label="balance = 0"
          onClick={() => updateFilter("balance_zero")}
        />
        <FilterChip
          active={filter === "balance_negative"}
          label="balance < 0"
          onClick={() => updateFilter("balance_negative")}
        />
        <FilterChip
          active={filter === "admins"}
          label="admins"
          onClick={() => updateFilter("admins")}
        />
        <FilterChip
          active={filter === "players"}
          label="players"
          onClick={() => updateFilter("players")}
        />
      </div>

      <div className="mt-4">
        <PaginationControls
          page={safePage}
          totalPages={totalPages}
          totalResults={filteredUsers.length}
          onPrevious={() =>
            setPage((p) => Math.max(1, Math.min(p, totalPages) - 1))
          }
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      <div className="mt-4 space-y-3">
        {paginatedUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}

        {paginatedUsers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              no users matched this view
            </p>
            <p className="mt-1 text-sm text-slate-500">
              try a different search or filter
            </p>
          </div>
        )}
      </div>

      {paginatedUsers.length > 0 && (
        <div className="mt-4">
          <PaginationControls
            page={safePage}
            totalPages={totalPages}
            totalResults={filteredUsers.length}
            onPrevious={() =>
              setPage((p) => Math.max(1, Math.min(p, totalPages) - 1))
            }
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      )}
    </section>
  );
}
