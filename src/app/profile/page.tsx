import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOwnProfile } from "@/lib/actions";
import { UserAvatar } from "@/components/user-avatar";
import { BottomBar } from "@/components/bottom-bar";

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
    .single();

  if (!profile) {
    redirect("/auth");
  }

  async function submitProfile(formData: FormData) {
    "use server";
    await updateOwnProfile(formData);
  }

  return (
    <div className="space-y-5 px-4 py-5 pb-28">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
          profile
        </p>
        <h1 className="mt-2 text-3xl font-bold">your account</h1>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={profile.name}
            avatarUrl={profile.avatar_url}
            size={72}
          />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-white">
              {profile.name || "unnamed user"}
            </h2>
            <p className="truncate text-sm text-slate-400">
              {profile.email || "no email"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-emerald-500/15 p-4">
            <p className="text-xs uppercase tracking-wider text-emerald-300">
              balance
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              ${Number(profile.balance).toFixed(2)}
            </p>
          </div>

          <div className="rounded-3xl bg-orange-500/15 p-4">
            <p className="text-xs uppercase tracking-wider text-orange-300">
              streak
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {profile.streak} weeks
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-bold text-white">edit profile</h2>

        <form action={submitProfile} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">name</span>
            <input
              name="name"
              defaultValue={profile.name ?? ""}
              required
              className="w-full rounded-2xl bg-slate-950/40 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              change profile picture
            </span>
            <input
              name="avatar"
              type="file"
              accept="image/*"
              className="w-full rounded-2xl bg-slate-950/40 px-4 py-3 text-white outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-sky-400 file:px-3 file:py-2 file:text-slate-950"
            />
          </label>

          <button className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
            save profile
          </button>
        </form>
      </section>
      <BottomBar isAdmin={profile.role === "admin"} />
    </div>
  );
}
