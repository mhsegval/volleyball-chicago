import {
  approvePaymentRequest,
  completeActiveRun,
  createRun,
  removeSignup,
  updateRunDetails,
  updateUserBalance,
  updateUserName,
  updateUserRole,
} from "@/lib/actions";
import { DeleteRunButton } from "@/components/delete-run-button";
import { RejectPaymentButton } from "@/components/reject-payment-button";
import type { Run, Signup, UserProfile, PaymentRequest } from "@/lib/types";
import { Check } from "lucide-react";

type AdminPanelProps = {
  activeRun: Run | null;
  signups: (Signup & { users: UserProfile })[];
  users: UserProfile[];
  pendingPayments: (PaymentRequest & { users?: UserProfile })[];
  searchQuery: string;
};

export function AdminPanel({
  activeRun,
  signups,
  users,
  pendingPayments,
  searchQuery,
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

  async function submitRemoveSignup(formData: FormData) {
    "use server";
    await removeSignup(formData);
  }

  async function submitUpdateUserName(formData: FormData) {
    "use server";
    await updateUserName(formData);
  }

  async function submitUpdateUserBalance(formData: FormData) {
    "use server";
    await updateUserBalance(formData);
  }

  async function submitUpdateUserRole(formData: FormData) {
    "use server";
    await updateUserRole(formData);
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

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">current players</h2>

        <div className="mt-4 space-y-3">
          {signups.length === 0 ? (
            <p className="text-sm text-slate-500">
              no players in the current roster.
            </p>
          ) : (
            signups.map((signup) => (
              <div
                key={signup.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {signup.users.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {signup.users.email}
                  </p>
                </div>

                <form action={submitRemoveSignup}>
                  <input type="hidden" name="run_id" value={signup.run_id} />
                  <input type="hidden" name="user_id" value={signup.user_id} />
                  <button className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                    remove
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">user management</h2>
          <span className="text-xs text-slate-400">
            showing {users.length} users
          </span>
        </div>

        <form method="get" className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="search by name or email"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />
          <button className="rounded-2xl bg-sky-50 px-4 py-3 font-medium text-sky-700">
            search
          </button>
        </form>

        <div className="mt-4 space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3">
                <p className="font-medium text-slate-900">
                  {user.name || "unnamed user"}
                </p>
                <p className="text-sm text-slate-500">
                  {user.email || "no email"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                  current role: {user.role}
                </p>
              </div>

              <div className="space-y-3">
                <form
                  action={submitUpdateUserName}
                  className="flex flex-col gap-2 sm:flex-row"
                >
                  <input type="hidden" name="user_id" value={user.id} />
                  <input
                    name="name"
                    defaultValue={user.name}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none"
                  />
                  <button className="rounded-xl bg-sky-50 px-3 py-2 text-sky-700">
                    save name
                  </button>
                </form>

                <form
                  action={submitUpdateUserBalance}
                  className="flex flex-col gap-2 sm:flex-row"
                >
                  <input type="hidden" name="user_id" value={user.id} />
                  <input
                    name="balance"
                    type="number"
                    step="0.01"
                    defaultValue={user.balance}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none"
                  />
                  <button className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
                    save balance
                  </button>
                </form>

                <form
                  action={submitUpdateUserRole}
                  className="flex flex-col gap-2 sm:flex-row"
                >
                  <input type="hidden" name="user_id" value={user.id} />
                  <input
                    type="hidden"
                    name="role"
                    value={user.role === "admin" ? "user" : "admin"}
                  />
                  <button
                    className={`rounded-xl px-3 py-2 ${
                      user.role === "admin"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {user.role === "admin" ? "remove admin" : "make admin"}
                  </button>
                </form>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-sm text-slate-500">no users found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
