"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { addSignup } from "@/lib/actions";
import type { UserProfile } from "@/lib/types";
import { UserAvatar } from "@/components/user-avatar";

type PlayerAutocompleteProps = {
  runId: string;
  users: UserProfile[];
  signedUpUserIds: string[];
  currentUser: UserProfile;
  isAdmin: boolean;
};

export function PlayerAutocomplete({
  runId,
  users,
  signedUpUserIds,
  isAdmin,
}: PlayerAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (!isAdmin) return [];

    const q = query.trim().toLowerCase();
    if (!q) return [];

    return users
      .filter((u) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return (
          (name.includes(q) || email.includes(q)) &&
          !signedUpUserIds.includes(u.id)
        );
      })
      .slice(0, 8);
  }, [query, users, signedUpUserIds, isAdmin]);

  function handleAdd(userId: string) {
    const formData = new FormData();
    formData.set("run_id", runId);
    formData.set("user_id", userId);
    formData.set("guest_count", "0");

    setError("");

    startTransition(async () => {
      const result = await addSignup(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setQuery("");
    });
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="relative">
      <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          add player
        </label>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full bg-transparent text-slate-900 outline-none"
          />
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <AnimatePresence>
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute inset-x-0 z-30 mt-2 rounded-[24px] border border-slate-200 bg-white p-2 shadow-xl"
          >
            {filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={pending}
                onClick={() => handleAdd(user.id)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60"
              >
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatar_url}
                  size={38}
                />

                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
