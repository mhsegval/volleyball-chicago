"use client";

import { useState } from "react";
import { Roster } from "@/components/roster";
import { ProfileDrawer } from "@/components/profile-drawer";
import type { Signup, UserProfile, Run } from "@/lib/types";

export function RosterClientShell({
  currentUser,
  run,
  signups,
}: {
  currentUser: UserProfile;
  run: Run | null;
  signups: (Signup & { users: UserProfile })[];
}) {
  const [selected, setSelected] = useState<UserProfile>(currentUser);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Roster
        run={run}
        currentUserId={currentUser.id}
        isAdmin={currentUser.role === "admin"}
        signups={signups}
        onPlayerClick={(player) => {
          setSelected(player);
          setOpen(true);
        }}
      />
      <ProfileDrawer
        open={open}
        onClose={() => setOpen(false)}
        profile={selected}
        viewerId={currentUser.id}
      />
    </>
  );
}
