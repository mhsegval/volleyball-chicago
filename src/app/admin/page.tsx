import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/admin-panel";
import { BottomBar } from "@/components/bottom-bar";
import type { Run, Signup, UserProfile, PaymentRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

type SignupWithUser = Signup & { users: UserProfile };
type PaymentRequestWithUser = PaymentRequest & {
  users?: UserProfile;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  await supabase.rpc("complete_expired_runs");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single<UserProfile>();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const [{ data: activeRun }, usersResult, pendingPaymentsRawResult] =
    await Promise.all([
      supabase
        .from("runs")
        .select("*")
        .eq("status", "active")
        .maybeSingle<Run>(),
      supabase.from("users").select("*").order("name"),
      supabase
        .from("payment_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

  let signups: SignupWithUser[] = [];

  if (activeRun) {
    const { data } = await supabase
      .from("signups")
      .select("*, users(*)")
      .eq("run_id", activeRun.id)
      .order("status", { ascending: true })
      .order("created_at", { ascending: true });

    signups = (data ?? []) as SignupWithUser[];
  }

  const pendingPaymentsRaw = (pendingPaymentsRawResult.data ??
    []) as PaymentRequest[];

  const pendingUserIds = [...new Set(pendingPaymentsRaw.map((p) => p.user_id))];

  let pendingUsersMap = new Map<string, UserProfile>();

  if (pendingUserIds.length > 0) {
    const { data: pendingUsers } = await supabase
      .from("users")
      .select("*")
      .in("id", pendingUserIds);

    pendingUsersMap = new Map(
      ((pendingUsers ?? []) as UserProfile[]).map((u) => [u.id, u]),
    );
  }

  const pendingPayments: PaymentRequestWithUser[] = pendingPaymentsRaw.map(
    (payment) => ({
      ...payment,
      users: pendingUsersMap.get(payment.user_id),
    }),
  );

  return (
    <div className="space-y-5 px-4 py-4 pb-32">
      <section className="rounded-[32px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          admin
        </p>
        <p className="mt-3 text-base leading-7 text-slate-500">
          Manage runs, players, and admin tools from one place.
        </p>
      </section>

      <AdminPanel
        activeRun={activeRun}
        signups={signups}
        users={(usersResult.data ?? []) as UserProfile[]}
        pendingPayments={pendingPayments}
        approvedPayments={[]}
        ledgerEntries={[]}
        totalSystemBalance={0}
      />

      <BottomBar isAdmin />
    </div>
  );
}
