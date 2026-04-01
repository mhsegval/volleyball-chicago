"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { Users, Clock3 } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { removeSignup } from "@/lib/actions";
import type { Signup, UserProfile, Run } from "@/lib/types";

function canSelfRemove(run: Run | null) {
  if (!run) return false;

  const start = new Date(`${run.date}T${run.start_time}`);
  const cutoff = new Date(start.getTime() - 24 * 60 * 60 * 1000);

  return new Date() < cutoff;
}

function moveCurrentUserToTop<T extends Signup & { users: UserProfile }>(
  signups: T[],
  currentUserId: string,
) {
  const mine = signups.find((s) => s.user_id === currentUserId);
  const others = signups.filter((s) => s.user_id !== currentUserId);
  return mine ? [mine, ...others] : signups;
}

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function getSpotCount(signups: (Signup & { users: UserProfile })[]) {
  return signups.reduce((sum, s) => sum + 1 + Number(s.guest_count ?? 0), 0);
}

function RemoveButton({
  runId,
  userId,
  label,
  message,
}: {
  runId: string;
  userId: string;
  label: string;
  message: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(message);
    if (!ok) return;

    const fd = new FormData();
    fd.set("run_id", runId);
    fd.set("user_id", userId);

    startTransition(async () => {
      await removeSignup(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "working..." : label}
    </button>
  );
}

export function Roster({
  run,
  currentUserId,
  isAdmin,
  signups,
  onPlayerClick,
}: {
  run: Run | null;
  currentUserId: string;
  isAdmin: boolean;
  signups: (Signup & { users: UserProfile })[];
  onPlayerClick: (player: UserProfile) => void;
}) {
  const allowSelfRemove = canSelfRemove(run);

  const rosterPlayers = moveCurrentUserToTop(
    signups.filter((s) => s.status === "roster"),
    currentUserId,
  );

  const waitlistPlayers = moveCurrentUserToTop(
    [...signups.filter((s) => s.status === "waitlist")].sort(
      (a, b) => (a.waitlist_position ?? 9999) - (b.waitlist_position ?? 9999),
    ),
    currentUserId,
  );

  const rosterSpotCount = getSpotCount(rosterPlayers);
  const teams = chunk(rosterPlayers, 6);

  return (
    <section className="space-y-4">
      <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              players
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              roster
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {rosterSpotCount} spot{rosterSpotCount === 1 ? "" : "s"} on roster
              {run
                ? ` · ${waitlistPlayers.length} on waitlist · limit ${run.max_players}`
                : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="h-4 w-4" />
              <span className="text-sm font-semibold">{rosterSpotCount}</span>
            </div>
          </div>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 shadow-sm">
          no one is signed up yet.
        </div>
      ) : (
        teams.map((team, teamIndex) => {
          const teamSpotCount = getSpotCount(team);

          return (
            <motion.div
              key={teamIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  Team {teamIndex + 1}
                </h3>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {teamSpotCount} spot{teamSpotCount === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-2">
                {team.map((signup, playerIndex) => {
                  const isCurrentUser = signup.user_id === currentUserId;
                  const guestCount = Number(signup.guest_count ?? 0);

                  return (
                    <motion.div
                      key={signup.id}
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: playerIndex * 0.02 }}
                      className={`rounded-2xl border px-3 py-3 transition ${
                        isCurrentUser
                          ? "border-sky-200 bg-sky-50/70"
                          : "border-slate-200 bg-slate-50/60"
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
                            size={42}
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium text-slate-900">
                                {signup.users.name}
                              </p>

                              {guestCount > 0 && (
                                <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                                  +{guestCount} guest
                                </span>
                              )}
                            </div>

                            {isCurrentUser && (
                              <p className="text-xs font-medium text-sky-700">
                                you
                              </p>
                            )}
                          </div>
                        </button>

                        {isAdmin ? (
                          <RemoveButton
                            runId={signup.run_id}
                            userId={signup.user_id}
                            label="remove"
                            message={`Remove ${signup.users.name} from this run?`}
                          />
                        ) : isCurrentUser && allowSelfRemove ? (
                          <RemoveButton
                            runId={signup.run_id}
                            userId={signup.user_id}
                            label="leave"
                            message="We understand plans can change. Please avoid late opt-outs to keep things fair."
                          />
                        ) : null}
                      </div>

                      {isCurrentUser && !isAdmin && !allowSelfRemove && (
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-slate-600">
                          <Clock3 className="h-3.5 w-3.5" />
                          opt-out closes 48 hours before start
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })
      )}

      {waitlistPlayers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-amber-200 bg-amber-50/70 p-4 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Waitlist</h3>
            <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-700">
              {waitlistPlayers.length} waiting
            </span>
          </div>

          <div className="space-y-2">
            {waitlistPlayers.map((signup) => {
              const isCurrentUser = signup.user_id === currentUserId;
              const guestCount = Number(signup.guest_count ?? 0);

              return (
                <div
                  key={signup.id}
                  className={`rounded-2xl border px-3 py-3 ${
                    isCurrentUser
                      ? "border-amber-300 bg-white"
                      : "border-amber-200 bg-white/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onPlayerClick(signup.users)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className="w-8 text-sm font-semibold text-amber-700">
                        #{signup.waitlist_position}
                      </span>

                      <UserAvatar
                        name={signup.users.name}
                        avatarUrl={signup.users.avatar_url}
                        size={42}
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-slate-900">
                            {signup.users.name}
                          </p>

                          {guestCount > 0 && (
                            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                              +{guestCount} guest
                            </span>
                          )}
                        </div>

                        {isCurrentUser && (
                          <p className="text-xs font-medium text-amber-700">
                            waitlist · position #{signup.waitlist_position}
                          </p>
                        )}
                      </div>
                    </button>

                    {isAdmin ? (
                      <RemoveButton
                        runId={signup.run_id}
                        userId={signup.user_id}
                        label="remove"
                        message={`Remove ${signup.users.name} from the waitlist?`}
                      />
                    ) : isCurrentUser && allowSelfRemove ? (
                      <RemoveButton
                        runId={signup.run_id}
                        userId={signup.user_id}
                        label="leave"
                        message="We understand plans can change. Please avoid late opt-outs to keep things fair."
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </section>
  );
}
