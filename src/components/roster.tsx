"use client";

import { motion } from "framer-motion";
import { UserAvatar } from "@/components/user-avatar";
import type { Signup, UserProfile } from "@/lib/types";

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

export function Roster({
  signups,
  onPlayerClick,
}: {
  signups: (Signup & { users: UserProfile })[];
  onPlayerClick: (player: UserProfile) => void;
}) {
  const teams = chunk(signups, 6);

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
              {team.map((signup, playerIndex) => (
                <motion.button
                  key={signup.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: playerIndex * 0.03 }}
                  onClick={() => onPlayerClick(signup.users)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="w-6 text-sm font-medium text-slate-400">
                    {teamIndex * 6 + playerIndex + 1}
                  </span>
                  <UserAvatar
                    name={signup.users.name}
                    avatarUrl={signup.users.avatar_url}
                    size={40}
                  />
                  <span className="font-medium text-slate-900">
                    {signup.users.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </section>
  );
}
