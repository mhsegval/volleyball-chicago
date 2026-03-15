"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Mail, Wallet, X } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import type { UserProfile } from "@/lib/types";

export function ProfileDrawer({
  open,
  onClose,
  profile,
  viewerId,
}: {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  viewerId: string;
}) {
  const showBalance = viewerId === profile.id;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
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

            <div className="flex items-center gap-4">
              <UserAvatar
                name={profile.name}
                avatarUrl={profile.avatar_url}
                size={72}
              />
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {profile.name}
                </h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  {profile.email || "no email"}
                </p>
              </div>
            </div>

            <div
              className={`mt-5 grid gap-3 ${showBalance ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {showBalance && (
                <div className="rounded-3xl bg-emerald-50 p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-700">
                    <Wallet className="h-4 w-4" />
                    balance
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    ${Number(profile.balance).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="rounded-3xl bg-orange-50 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-orange-700">
                  <Flame className="h-4 w-4" />
                  streak
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {profile.streak} weeks
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
