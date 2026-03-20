import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfilePageClient } from "@/components/profile-page-client";
import type {
  UserProfile,
  PaymentRequest,
  BalanceHistoryItem,
  MatchHistoryItem,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single<UserProfile>();

  if (!profile) {
    redirect("/auth");
  }

  const [
    pendingPaymentsResult,
    paymentHistoryResult,
    signedRunsResult,
    completedRunsResult,
  ] = await Promise.all([
    supabase
      .from("payment_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("signups").select("run_id").eq("user_id", user.id),
    supabase
      .from("runs")
      .select("*")
      .eq("status", "completed")
      .order("date", { ascending: false })
      .limit(20),
  ]);

  const isLowBalance = Number(profile.balance) <= 10;
  const hasPendingPayment =
    ((pendingPaymentsResult.data ?? []) as PaymentRequest[]).length > 0;

  const paymentHistory: BalanceHistoryItem[] = (
    (paymentHistoryResult.data ?? []) as PaymentRequest[]
  ).map((p) => ({
    id: p.id,
    kind: "payment",
    amount: Number(p.amount),
    status: p.status,
    method: p.method,
    created_at: p.created_at,
    note: "balance top-up",
  }));

  const completedRuns = (completedRunsResult.data ?? []) as Array<{
    id: string;
    date: string;
    gym_name: string;
    total_rent: number;
  }>;

  const signedRunIds = new Set(
    ((signedRunsResult.data ?? []) as Array<{ run_id: string }>).map(
      (s) => s.run_id,
    ),
  );

  const playerCountsByRun = new Map<string, number>();

  if (completedRuns.length > 0) {
    const runIds = completedRuns.map((r) => r.id);
    const { data: completedSignups } = await supabase
      .from("signups")
      .select("run_id, status")
      .in("run_id", runIds)
      .eq("status", "roster");

    for (const row of (completedSignups ?? []) as Array<{
      run_id: string;
      status: string;
    }>) {
      playerCountsByRun.set(
        row.run_id,
        (playerCountsByRun.get(row.run_id) ?? 0) + 1,
      );
    }
  }

  const runCharges: BalanceHistoryItem[] = completedRuns
    .filter((run) => signedRunIds.has(run.id))
    .map((run) => {
      const playerCount = playerCountsByRun.get(run.id) ?? 0;
      const share =
        playerCount > 0
          ? Number(run.total_rent) / playerCount
          : Number(run.total_rent);

      return {
        id: run.id,
        kind: "run_charge",
        amount: Number(share.toFixed(2)),
        created_at: run.date,
        note: `${run.gym_name} run charge`,
      };
    });

  const balanceHistory = [...paymentHistory, ...runCharges].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );

  const matchHistory: MatchHistoryItem[] = completedRuns.map((run) => {
    const playerCount = playerCountsByRun.get(run.id) ?? 0;
    const didPlay = signedRunIds.has(run.id);

    const yourShare =
      didPlay && playerCount > 0
        ? Number((Number(run.total_rent) / playerCount).toFixed(2))
        : null;

    return {
      run_id: run.id,
      date: run.date,
      gym_name: run.gym_name,
      player_count: playerCount,
      did_play: didPlay,
      your_share: yourShare,
    };
  });

  return (
    <ProfilePageClient
      profile={profile}
      isLowBalance={isLowBalance}
      hasPendingPayment={hasPendingPayment}
      balanceHistory={balanceHistory}
      matchHistory={matchHistory}
    />
  );
}
