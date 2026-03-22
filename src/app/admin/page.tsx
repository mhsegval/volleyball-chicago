import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/admin-panel";
import { BottomBar } from "@/components/bottom-bar";
import type { Run, Signup, UserProfile, PaymentRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

type SignupWithUser = Signup & { users: UserProfile };
type PaymentRequestWithUser = PaymentRequest & {
  users?: UserProfile;
  reviewed_by_user?: UserProfile;
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

  const [
    { data: activeRun },
    usersResult,
    pendingPaymentsRawResult,
    approvedPaymentsRawResult,
  ] = await Promise.all([
    supabase.from("runs").select("*").eq("status", "active").maybeSingle<Run>(),
    supabase.from("users").select("*").order("name"),
    supabase
      .from("payment_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_requests")
      .select("*")
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .limit(20),
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

  const approvedPaymentsRaw = (approvedPaymentsRawResult.data ??
    []) as PaymentRequest[];

  const paymentUserIds = [
    ...new Set(
      [...pendingPaymentsRaw, ...approvedPaymentsRaw].map((p) => p.user_id),
    ),
  ];

  const reviewerUserIds = [
    ...new Set(
      approvedPaymentsRaw
        .map((p) => p.reviewed_by)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const allNeededUserIds = [
    ...new Set([...paymentUserIds, ...reviewerUserIds]),
  ];

  let paymentUsersMap = new Map<string, UserProfile>();

  if (allNeededUserIds.length > 0) {
    const { data: paymentUsers } = await supabase
      .from("users")
      .select("*")
      .in("id", allNeededUserIds);

    paymentUsersMap = new Map(
      ((paymentUsers ?? []) as UserProfile[]).map((u) => [u.id, u]),
    );
  }

  const pendingPayments: PaymentRequestWithUser[] = pendingPaymentsRaw.map(
    (payment) => ({
      ...payment,
      users: paymentUsersMap.get(payment.user_id),
    }),
  );

  const approvedPayments: PaymentRequestWithUser[] = approvedPaymentsRaw.map(
    (payment) => ({
      ...payment,
      users: paymentUsersMap.get(payment.user_id),
      reviewed_by_user: payment.reviewed_by
        ? paymentUsersMap.get(payment.reviewed_by)
        : undefined,
    }),
  );

  return (
    <div className="space-y-5 px-4 py-5 pb-32">
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          control center
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage runs, payments, and players from one place.
        </p>
      </section>

      <AdminPanel
        activeRun={activeRun}
        signups={signups}
        users={(usersResult.data ?? []) as UserProfile[]}
        pendingPayments={pendingPayments}
        approvedPayments={approvedPayments}
      />

      <BottomBar isAdmin />
    </div>
  );
}
