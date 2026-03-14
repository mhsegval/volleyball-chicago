"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, UserMinus } from "lucide-react";
import { addSignup, removeSignup } from "@/lib/actions";
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
  currentUser,
  isAdmin,
}: PlayerAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isCurrentUserSignedUp = signedUpUserIds.includes(currentUser.id);

  const filtered = useMemo(() => {
    if (!isAdmin) return [];

    const q = query.trim().toLowerCase();
    if (!q) return [];

    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) && !signedUpUserIds.includes(u.id),
      )
      .slice(0, 8);
  }, [query, users, signedUpUserIds, isAdmin]);

  function handleAdd(userId: string) {
    const formData = new FormData();
    formData.set("run_id", runId);
    formData.set("user_id", userId);

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

  function handleRemoveSelf() {
    const formData = new FormData();
    formData.set("run_id", runId);
    formData.set("user_id", currentUser.id);

    setError("");

    startTransition(async () => {
      const result = await removeSignup(formData);

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (!isAdmin) {
    return (
      <section className="space-y-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.avatar_url}
              size={44}
            />
            <div className="flex-1">
              <p className="font-medium text-white">{currentUser.name}</p>
              <p className="text-sm text-slate-400">
                {isCurrentUserSignedUp
                  ? "you are registered for this run"
                  : "register yourself for this run"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            {isCurrentUserSignedUp ? (
              <button
                type="button"
                disabled={pending}
                onClick={handleRemoveSelf}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/20 px-4 py-3 font-medium text-red-200 disabled:opacity-60"
              >
                <UserMinus className="h-4 w-4" />
                remove me
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => handleAdd(currentUser.id)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                register me
              </button>
            )}
          </div>
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-white/5 px-4 py-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
          <Plus className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-xs uppercase tracking-widest text-slate-400">
            add player
          </label>

          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search by name"
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}

      <AnimatePresence>
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute inset-x-0 z-30 mt-2 rounded-[24px] border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur"
          >
            {filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={pending}
                onClick={() => handleAdd(user.id)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-white/5 disabled:opacity-60"
              >
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatar_url}
                  size={38}
                />

                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{user.name}</p>
                  <p className="truncate text-xs text-slate-400">
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
