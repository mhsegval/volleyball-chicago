import {
  approvePaymentRequest,
  completeActiveRun,
  createRun,
  updateRunDetails,
} from "@/lib/actions";
import { DeleteRunButton } from "@/components/delete-run-button";
import { RejectPaymentButton } from "@/components/reject-payment-button";
import { AdminUserManagement } from "@/components/admin-user-management";
import type { Run, Signup, UserProfile, PaymentRequest } from "@/lib/types";
import { Check } from "lucide-react";

type AdminPanelProps = {
  activeRun: Run | null;
  signups: (Signup & { users: UserProfile })[];
  users: UserProfile[];
  pendingPayments: (PaymentRequest & { users?: UserProfile })[];
};

export function AdminPanel({
  activeRun,
  users,
  pendingPayments,
}: AdminPanelProps) {
  async function submitCreateRun(formData: FormData) {
    "use server";
    await createRun(formData);
  }

  async function submitUpdateRun(formData: FormData) {
    "use server";
    await updateRunDetails(formData);
  }

  async function submitCompleteActiveRun() {
    "use server";
    await completeActiveRun();
  }

  async function submitApprovePayment(formData: FormData) {
    "use server";
    await approvePaymentRequest(formData);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">payment review</h2>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
            {pendingPayments.length} pending
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          These users already received the balance update and are waiting for
          review.
        </p>

        <div className="mt-4 space-y-3">
          {pendingPayments.length === 0 ? (
            <p className="text-sm text-slate-500">no pending payments.</p>
          ) : (
            pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {payment.users?.name || "user"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {payment.users?.email || "no email"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    ${Number(payment.amount).toFixed(2)} via {payment.method}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <form action={submitApprovePayment}>
                    <input type="hidden" name="request_id" value={payment.id} />
                    <button
                      className="rounded-xl bg-emerald-50 p-3 text-emerald-700"
                      title="confirm payment"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </form>

                  <RejectPaymentButton
                    requestId={payment.id}
                    amount={Number(payment.amount)}
                    userName={payment.users?.name}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {!activeRun ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">create next run</h2>

          <form action={submitCreateRun} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                date
              </span>
              <input
                name="date"
                type="date"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none [color-scheme:light]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  start time
                </span>
                <input
                  name="start_time"
                  type="time"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none [color-scheme:light]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  end time
                </span>
                <input
                  name="end_time"
                  type="time"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none [color-scheme:light]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                gym name
              </span>
              <input
                name="gym_name"
                placeholder="e.g. maddison gym"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                location link
              </span>
              <input
                name="location_url"
                placeholder="paste google maps or apple maps link"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                total rent ($)
              </span>
              <input
                name="total_rent"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 120"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
            </label>

            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white">
              create run
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">active run</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                active
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              A run already exists. You can edit or delete the current run
              before creating another one.
            </p>

            <form action={submitUpdateRun} className="mt-4 space-y-4">
              <input type="hidden" name="run_id" value={activeRun.id} />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  date
                </span>
                <input
                  name="date"
                  type="date"
                  defaultValue={activeRun.date}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none [color-scheme:light]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    start time
                  </span>
                  <input
                    name="start_time"
                    type="time"
                    defaultValue={activeRun.start_time}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none [color-scheme:light]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    end time
                  </span>
                  <input
                    name="end_time"
                    type="time"
                    defaultValue={activeRun.end_time}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none [color-scheme:light]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  gym name
                </span>
                <input
                  name="gym_name"
                  defaultValue={activeRun.gym_name}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  location link
                </span>
                <input
                  name="location_url"
                  defaultValue={activeRun.location_url}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  total rent ($)
                </span>
                <input
                  name="total_rent"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={activeRun.total_rent}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
              </label>

              <button className="w-full rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white">
                update active run
              </button>
            </form>

            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Deleting this run will remove all signed up players. They will
                need to register again.
              </p>
              <div className="mt-3">
                <DeleteRunButton />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              manual override
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Mark the active run complete and deduct the final rent from
              signed-up players.
            </p>

            <form action={submitCompleteActiveRun} className="mt-4">
              <button className="w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white">
                complete active run
              </button>
            </form>
          </section>
        </>
      )}

      <AdminUserManagement users={users} />
    </div>
  );
}
