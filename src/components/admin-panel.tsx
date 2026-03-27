import Link from "next/link";
import { completeActiveRun, createRun, updateRunDetails } from "@/lib/actions";
import { DeleteRunButton } from "@/components/delete-run-button";
import { AdminUserManagement } from "@/components/admin-user-management";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { Run, Signup, UserProfile, PaymentRequest } from "@/lib/types";
import {
  CreditCard,
  CalendarDays,
  Settings2,
  ChevronRight,
  CircleAlert,
} from "lucide-react";

type AdminPanelProps = {
  activeRun: Run | null;
  signups: (Signup & { users: UserProfile })[];
  users: UserProfile[];
  pendingPayments: (PaymentRequest & { users?: UserProfile })[];
  approvedPayments: (PaymentRequest & { users?: UserProfile })[];
  ledgerEntries: unknown[];
  totalSystemBalance: number;
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
    <div className="flex items-start gap-4">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-slate-700 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
          {description}
        </p>
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

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-slate-900">
                  payments workspace
                </p>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  {pendingPayments.length} pending
                </span>
              </div>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Review payment requests, open approval history, and track funds
                via ledger in one dedicated space.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/admin/payments"
              className="inline-flex w-full items-center justify-between rounded-[22px] bg-slate-900 px-5 py-4 text-left text-white shadow-sm transition active:scale-[0.99]"
            >
              <div>
                <p className="text-sm font-semibold">open payments</p>
                <p className="mt-1 text-xs text-slate-300">
                  approvals, history, and ledger
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0" />
            </Link>
          </div>
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
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={<Settings2 className="h-5 w-5" />}
              eyebrow="controls"
              title="run controls"
              description="Complete or remove the current run from one place."
            />

            <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <form action={submitCompleteActiveRun}>
                <FormSubmitButton
                  idleLabel="complete run"
                  pendingLabel="completing run..."
                  className="w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white"
                />
              </form>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-2 text-red-600 shadow-sm">
                    <CircleAlert className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-700">
                      Delete active run
                    </p>
                    <p className="mt-1 text-sm leading-6 text-red-700">
                      This removes the roster and waitlist. Players would need
                      to join again after a new run is posted.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <DeleteRunButton />
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <AdminUserManagement users={users} />
    </div>
  );
}
