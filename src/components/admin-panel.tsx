import {
  completeActiveRun,
  createRun,
  removeSignup,
  updateUserBalance,
  updateUserName,
  updateUserRole,
} from "@/lib/actions";
import type { Run, Signup, UserProfile } from "@/lib/types";

type AdminPanelProps = {
  activeRun: Run | null;
  signups: (Signup & { users: UserProfile })[];
  users: UserProfile[];
  searchQuery: string;
};

export function AdminPanel({
  activeRun,
  signups,
  users,
  searchQuery,
}: AdminPanelProps) {
  async function submitCreateRun(formData: FormData) {
    "use server";
    await createRun(formData);
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

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-bold text-white">create next run</h2>

        <form action={submitCreateRun} className="mt-4 space-y-3">
          <input
            name="date"
            type="date"
            required
            className="w-full rounded-2xl bg-slate-950/40 px-4 py-3 text-white outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="start_time"
              type="time"
              required
              className="rounded-2xl bg-slate-950/40 px-4 py-3 text-white outline-none"
            />
            <input
              name="end_time"
              type="time"
              required
              className="rounded-2xl bg-slate-950/40 px-4 py-3 text-white outline-none"
            />
          </div>

          <input
            name="gym_name"
            placeholder="gym name"
            required
            className="w-full rounded-2xl bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-500 outline-none"
          />

          <input
            name="location_url"
            placeholder="google maps / apple maps url"
            required
            className="w-full rounded-2xl bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-500 outline-none"
          />

          <input
            name="total_rent"
            type="number"
            step="0.01"
            min="0"
            placeholder="total rent"
            required
            className="w-full rounded-2xl bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-500 outline-none"
          />

          <button className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
            create run
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-orange-400/20 bg-orange-500/10 p-5">
        <h2 className="text-xl font-bold text-white">manual override</h2>
        <p className="mt-2 text-sm text-slate-300">
          mark the active run complete and deduct the final rent from signed-up
          players.
        </p>

        <form action={submitCompleteActiveRun} className="mt-4">
          <button
            disabled={!activeRun}
            className="w-full rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            complete active run
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-bold text-white">current players</h2>

        <div className="mt-4 space-y-3">
          {signups.length === 0 ? (
            <p className="text-sm text-slate-300">
              no players in the current roster.
            </p>
          ) : (
            signups.map((signup) => (
              <div
                key={signup.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950/30 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {signup.users.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {signup.users.email}
                  </p>
                </div>

                <form action={submitRemoveSignup}>
                  <input type="hidden" name="run_id" value={signup.run_id} />
                  <input type="hidden" name="user_id" value={signup.user_id} />
                  <button className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-200">
                    remove
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white">user management</h2>
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
            className="flex-1 rounded-2xl bg-slate-950/40 px-4 py-3 text-white placeholder:text-slate-500 outline-none"
          />
          <button className="rounded-2xl bg-sky-500/20 px-4 py-3 font-medium text-sky-200">
            search
          </button>
        </form>

        <div className="mt-4 space-y-4">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl bg-slate-950/30 p-4">
              <div className="mb-3">
                <p className="font-medium text-white">
                  {user.name || "unnamed user"}
                </p>
                <p className="text-sm text-slate-400">
                  {user.email || "no email"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
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
                    className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                  />
                  <button className="rounded-xl bg-sky-500/20 px-3 py-2 text-sky-200">
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
                    className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                  />
                  <button className="rounded-xl bg-emerald-500/20 px-3 py-2 text-emerald-200">
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
                        ? "bg-orange-500/20 text-orange-200"
                        : "bg-purple-500/20 text-purple-200"
                    }`}
                  >
                    {user.role === "admin" ? "remove admin" : "make admin"}
                  </button>
                </form>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-sm text-slate-400">no users found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
