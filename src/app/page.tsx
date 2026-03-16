import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NextRunBanner } from "@/components/next-run-banner";
import { PlayerAutocomplete } from "@/components/player-autocomplete";
import { RosterClientShell } from "./roster-client-shell";
import { BottomBar } from "@/components/bottom-bar";
import { isNewUser } from "@/lib/format";
import { LowBalanceBanner } from "@/components/low-balance-banner";
import type { Run, Signup, UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

type SignupWithUser = Signup & { users: UserProfile };

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  await supabase.rpc("complete_expired_runs");

  const [{ data: profile }, { data: activeRun }, { data: users }] =
    await Promise.all([
      supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single<UserProfile>(),
      supabase
        .from("runs")
        .select("*")
        .eq("status", "active")
        .maybeSingle<Run>(),
      supabase.from("users").select("*").order("name"),
    ]);

  if (!profile) {
    redirect("/auth");
  }

  if (isNewUser(profile)) {
    redirect("/onboarding");
  }

  let signups: SignupWithUser[] = [];
  let estimatedRent: number | null = null;

  if (activeRun) {
    const [{ data: roster }, { data: rentValue }] = await Promise.all([
      supabase
        .from("signups")
        .select("*, users(*)")
        .eq("run_id", activeRun.id)
        .order("status", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.rpc("current_estimated_rent", { p_run_id: activeRun.id }),
    ]);

    signups = (roster ?? []) as SignupWithUser[];
    estimatedRent = Number(rentValue ?? activeRun.total_rent);
  }

  return (
    <div className="space-y-5 px-4 py-5 pb-32">
      <NextRunBanner run={activeRun} estimatedRent={estimatedRent} />
      <LowBalanceBanner balance={Number(profile.balance)} />

      {activeRun && (
        <PlayerAutocomplete
          runId={activeRun.id}
          users={(users ?? []) as UserProfile[]}
          signedUpUserIds={signups.map((s) => s.user_id)}
          currentUser={profile}
          isAdmin={profile.role === "admin"}
        />
      )}

      <RosterClientShell
        currentUser={profile}
        run={activeRun}
        signups={signups}
      />

      <BottomBar isAdmin={profile.role === "admin"} />
    </div>
  );
}
