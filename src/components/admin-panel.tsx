import {
  approvePaymentRequest,
  completeActiveRun,
  createRun,
  updateRunDetails,
} from "@/lib/actions";
import { DeleteRunButton } from "@/components/delete-run-button";
import { RejectPaymentButton } from "@/components/reject-payment-button";
import { AdminUserManagement } from "@/components/admin-user-management";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { Run, Signup, UserProfile, PaymentRequest } from "@/lib/types";
import { Check, CreditCard, CalendarDays, Settings2 } from "lucide-react";

type AdminPanelProps = {
  activeRun: Run | null;
  signups: (Signup & { users: UserProfile })[];
  users: UserProfile[];
  pendingPayments: (PaymentRequest & { users?: UserProfile })[];
};

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

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
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          icon={<CreditCard className="h-5 w-5" />}
          eyebrow="payments"
          title="payment review"
          description="Review recent balance top-ups and keep account balances accurate."
        />

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">
            Pending reviews
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            {pendingPayments.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {pendingPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No payments need review right now.
            </div>
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
                      className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 transition active:scale-[0.98]"
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
        <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            icon={<CalendarDays className="h-5 w-5" />}
            eyebrow="runs"
            title="new run"
            description="Post the next volleyball run with time, location, pricing, and player limit."
          />

          <form action={submitCreateRun} className="mt-5 space-y-4">
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
                placeholder="e.g. Maddison Gym"
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
                placeholder="Paste Google Maps or Apple Maps link"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  total rent ($)
                </span>
                <input
                  name="total_rent"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="120"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  max players
                </span>
                <input
                  name="max_players"
                  type="number"
                  min="1"
                  placeholder="12"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                />
              </label>
            </div>

            <FormSubmitButton
              idleLabel="publish run"
              pendingLabel="publishing run..."
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white"
            />
          </form>
        </section>
      ) : (
        <>
          <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={<CalendarDays className="h-5 w-5" />}
              eyebrow="runs"
              title="active run"
              description="Update the live run details or remove it if plans changed."
            />

            <form action={submitUpdateRun} className="mt-5 space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
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

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    max players
                  </span>
                  <input
                    name="max_players"
                    type="number"
                    min="1"
                    defaultValue={activeRun.max_players}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                  />
                </label>
              </div>

              <FormSubmitButton
                idleLabel="save run"
                pendingLabel="saving run..."
                className="w-full rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white"
              />
            </form>

            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm leading-6 text-red-700">
                Deleting this run removes the roster and waitlist. Players would
                need to join again after a new run is posted.
              </p>
              <div className="mt-3">
                <DeleteRunButton />
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={<Settings2 className="h-5 w-5" />}
              eyebrow="controls"
              title="run controls"
              description="Use this only when the live run has finished and balances need to be finalized."
            />

            <form action={submitCompleteActiveRun} className="mt-5">
              <FormSubmitButton
                idleLabel="complete run"
                pendingLabel="completing run..."
                className="w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white"
              />
            </form>
          </section>
        </>
      )}

      <AdminUserManagement users={users} />
    </div>
  );
}
