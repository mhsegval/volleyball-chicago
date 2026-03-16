"use client";

import { useMemo, useState, useTransition } from "react";
import {
  updateUserBalance,
  updateUserName,
  updateUserRole,
} from "@/lib/actions";
import type { UserProfile } from "@/lib/types";

const PAGE_SIZE = 8;

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

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3">
        <p className="font-medium text-slate-900">
          {user.name || "unnamed user"}
        </p>
        <p className="text-sm text-slate-500">{user.email || "no email"}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
          current role: {user.role}
        </p>
      </div>

      <div className="space-y-3">
        <form
          action={handleNameSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input type="hidden" name="user_id" value={user.id} />
          <input
            name="name"
            defaultValue={user.name}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none"
          />
          <button
            disabled={pending}
            className="rounded-xl bg-sky-50 px-3 py-2 text-sky-700 disabled:opacity-60"
          >
            save name
          </button>
        </form>

        <form
          action={handleBalanceSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input type="hidden" name="user_id" value={user.id} />
          <input
            name="balance"
            type="number"
            step="0.01"
            defaultValue={user.balance}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none"
          />
          <button
            disabled={pending}
            className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 disabled:opacity-60"
          >
            save balance
          </button>
        </form>

        <form
          action={handleRoleSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input type="hidden" name="user_id" value={user.id} />
          <input
            type="hidden"
            name="role"
            value={user.role === "admin" ? "user" : "admin"}
          />
          <button
            disabled={pending}
            className={`rounded-xl px-3 py-2 disabled:opacity-60 ${
              user.role === "admin"
                ? "bg-orange-50 text-orange-700"
                : "bg-purple-50 text-purple-700"
            }`}
          >
            {user.role === "admin" ? "remove admin" : "make admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminUserManagement({ users }: { users: UserProfile[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">user management</h2>
        <span className="text-xs text-slate-400">
          {filteredUsers.length} result{filteredUsers.length === 1 ? "" : "s"}
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
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-40"
        >
          previous
        </button>

        <span className="text-sm text-slate-500">
          page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-40"
        >
          next
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {paginatedUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}

        {paginatedUsers.length === 0 && (
          <p className="text-sm text-slate-500">no users found.</p>
        )}
      </div>
    </section>
  );
}
