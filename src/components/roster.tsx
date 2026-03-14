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
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          no one is signed up yet.
        </div>
      ) : (
        teams.map((team, teamIndex) => (
          <motion.div
            key={teamIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-4"
          >
            <h3 className="mb-3 text-lg font-bold text-sky-300">
              Team {teamIndex + 1}
            </h3>
            <div className="space-y-2">
              {team.map((signup, playerIndex) => (
                <motion.button
                  key={signup.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: playerIndex * 0.03 }}
                  onClick={() => onPlayerClick(signup.users)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-slate-950/30 px-3 py-3 text-left"
                >
                  <span className="w-6 text-sm text-slate-400">
                    {teamIndex * 6 + playerIndex + 1}
                  </span>
                  <UserAvatar
                    name={signup.users.name}
                    avatarUrl={signup.users.avatar_url}
                    size={40}
                  />
                  <span className="font-medium">{signup.users.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </section>
  );
}
