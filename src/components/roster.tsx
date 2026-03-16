"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { UserAvatar } from "@/components/user-avatar";
import { removeSignup } from "@/lib/actions";
import type { Signup, UserProfile, Run } from "@/lib/types";

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

function canSelfRemove(run: Run | null) {
  if (!run) return false;

  const start = new Date(`${run.date}T${run.start_time}`);
  const cutoff = new Date(start.getTime() - 24 * 60 * 60 * 1000);

  return new Date() < cutoff;
}

function moveCurrentUserToTop(
  signups: (Signup & { users: UserProfile })[],
  currentUserId: string,
) {
  const mine = signups.find((s) => s.user_id === currentUserId);
  const others = signups.filter((s) => s.user_id !== currentUserId);
  return mine ? [mine, ...others] : signups;
}

function OptOutButton({ runId, userId }: { runId: string; userId: string }) {
  const [pending, startTransition] = useTransition();

  function handleOptOut() {
    const ok = window.confirm(
      "We understand plans can change. Please avoid late opt-outs to keep things fair.",
    );

    if (!ok) return;

    const formData = new FormData();
    formData.set("run_id", runId);
    formData.set("user_id", userId);

    startTransition(async () => {
      await removeSignup(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={handleOptOut}
      disabled={pending}
      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 disabled:opacity-60"
    >
      {pending ? "opting out..." : "opt out"}
    </button>
  );
}

export function Roster({
  run,
  currentUserId,
  signups,
  onPlayerClick,
}: {
  run: Run | null;
  currentUserId: string;
  signups: (Signup & { users: UserProfile })[];
  onPlayerClick: (player: UserProfile) => void;
}) {
  const orderedSignups = moveCurrentUserToTop(signups, currentUserId);
  const teams = chunk(orderedSignups, 6);
  const allowSelfRemove = canSelfRemove(run);

  return (
    <section className="space-y-4">
      {teams.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 shadow-sm">
          no one is signed up yet.
        </div>
      ) : (
        teams.map((team, teamIndex) => (
          <motion.div
            key={teamIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Team {teamIndex + 1}
              </h3>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                {team.length} players
              </span>
            </div>

            <div className="space-y-2">
              {team.map((signup, playerIndex) => {
                const isCurrentUser = signup.user_id === currentUserId;

                return (
                  <motion.div
                    key={signup.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: playerIndex * 0.03 }}
                    className={`rounded-2xl border px-3 py-3 ${
                      isCurrentUser
                        ? "border-sky-200 bg-sky-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onPlayerClick(signup.users)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="w-6 text-sm font-medium text-slate-400">
                          {teamIndex * 6 + playerIndex + 1}
                        </span>

                        <UserAvatar
                          name={signup.users.name}
                          avatarUrl={signup.users.avatar_url}
                          size={40}
                        />

                        <div className="min-w-0">
                          <span className="block truncate font-medium text-slate-900">
                            {signup.users.name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs font-medium text-sky-700">
                              you
                            </span>
                          )}
                        </div>
                      </button>

                      {isCurrentUser && allowSelfRemove && (
                        <OptOutButton
                          runId={signup.run_id}
                          userId={signup.user_id}
                        />
                      )}
                    </div>

                    {isCurrentUser && !allowSelfRemove && (
                      <p className="mt-2 pl-9 text-xs text-slate-500">
                        opt-out closes 24 hours before game start
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))
      )}
    </section>
  );
}
