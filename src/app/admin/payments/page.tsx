import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BottomBar } from "@/components/bottom-bar";
import { ApprovedPaymentsHistoryDrawer } from "@/components/approved-payments-history-drawer";
import { ApprovePaymentButton } from "@/components/approve-payment-button";
import { RejectPaymentButton } from "@/components/reject-payment-button";
import {
  AdminLedgerSection,
  type AdminLedgerEntry,
} from "@/components/admin-ledger-section";
import type { PaymentRequest, UserProfile } from "@/lib/types";
import { ChevronLeft, CreditCard } from "lucide-react";

type PaymentRequestWithUser = PaymentRequest & {
  users?: UserProfile;
  reviewed_by_user?: UserProfile;
};

type LedgerEntryRow = {
  id: string;
  kind:
    | "payment_submitted"
    | "payment_approved"
    | "payment_rejected"
    | "payment_reversed"
    | "manual_balance_adjustment"
    | "run_completed"
    | "run_charge";
  user_id: string | null;
  run_id: string | null;
  payment_request_id: string | null;
  amount: number;
  method: "zelle" | "venmo" | null;
  note: string | null;
  actor_user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
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

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [
    usersResult,
    pendingPaymentsRawResult,
    approvedPaymentsRawResult,
    ledgerResult,
  ] = await Promise.all([
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
    supabase
      .from("ledger_entries")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const users = (usersResult.data ?? []) as UserProfile[];

  const pendingPaymentsRaw = (pendingPaymentsRawResult.data ??
    []) as PaymentRequest[];

  const approvedPaymentsRaw = (approvedPaymentsRawResult.data ??
    []) as PaymentRequest[];

  const ledgerRows = (ledgerResult.data ?? []) as LedgerEntryRow[];

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

  const ledgerUserIds = [
    ...new Set(
      ledgerRows.flatMap((entry) =>
        [entry.user_id, entry.actor_user_id].filter((id): id is string =>
          Boolean(id),
        ),
      ),
    ),
  ];

  const allNeededUserIds = [
    ...new Set([...paymentUserIds, ...reviewerUserIds, ...ledgerUserIds]),
  ];

  let usersMap = new Map<string, UserProfile>();

  if (allNeededUserIds.length > 0) {
    const { data: loadedUsers } = await supabase
      .from("users")
      .select("*")
      .in("id", allNeededUserIds);

    usersMap = new Map(
      ((loadedUsers ?? []) as UserProfile[]).map((u) => [u.id, u]),
    );
  }

  const pendingPayments: PaymentRequestWithUser[] = pendingPaymentsRaw.map(
    (payment) => ({
      ...payment,
      users: usersMap.get(payment.user_id),
    }),
  );

  const approvedPayments: PaymentRequestWithUser[] = approvedPaymentsRaw.map(
    (payment) => ({
      ...payment,
      users: usersMap.get(payment.user_id),
      reviewed_by_user: payment.reviewed_by
        ? usersMap.get(payment.reviewed_by)
        : undefined,
    }),
  );

  const ledgerEntries: AdminLedgerEntry[] = ledgerRows.map((entry) => ({
    id: entry.id,
    kind: entry.kind,
    amount: Number(entry.amount),
    method: entry.method,
    note: entry.note,
    metadata: entry.metadata,
    created_at: entry.created_at,
    user: entry.user_id ? usersMap.get(entry.user_id) : undefined,
    actor: entry.actor_user_id ? usersMap.get(entry.actor_user_id) : undefined,
  }));

  const totalSystemBalance = users.reduce(
    (sum, current) => sum + Number(current.balance ?? 0),
    0,
  );

  return (
    <div className="space-y-4 px-4 py-4 pb-32">
      <div className="sticky top-4 z-20">
        <div className="rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            back to admin
          </Link>
        </div>
      </div>

      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-slate-700 shadow-sm">
            <CreditCard className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              payments
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              payment management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Review pending requests, inspect approval history, and track
              recent fund movement.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div>
              <p className="text-base font-semibold text-slate-800">
                Pending reviews
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Review new top-up requests here.
              </p>
            </div>

            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              {pendingPayments.length}
            </span>
          </div>

          <div className="shrink-0">
            <ApprovedPaymentsHistoryDrawer payments={approvedPayments} />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {pendingPayments.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              No payments need review right now.
            </div>
          ) : (
            pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {payment.users?.name || "user"}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {payment.users?.email || "no email"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        ${Number(payment.amount).toFixed(2)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                        {payment.method}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <ApprovePaymentButton
                      requestId={payment.id}
                      amount={Number(payment.amount)}
                      userName={payment.users?.name}
                    />

                    <RejectPaymentButton
                      requestId={payment.id}
                      amount={Number(payment.amount)}
                      userName={payment.users?.name}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <AdminLedgerSection
        entries={ledgerEntries}
        totalSystemBalance={totalSystemBalance}
      />

      <BottomBar isAdmin />
    </div>
  );
}
