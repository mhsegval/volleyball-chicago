import { redirect } from "next/navigation";
import { completeProfile } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
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

  if (profile?.name && profile?.avatar_url) {
    redirect("/");
  }

  async function submitProfile(formData: FormData) {
    "use server";

    await completeProfile(formData);
  }

  return (
    <div className="flex min-h-screen items-center px-4">
      <div className="w-full rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
          finish profile
        </p>

        <h1 className="mt-3 text-3xl font-bold">complete your profile</h1>

        <p className="mt-2 text-sm text-slate-300">
          add your name and profile picture before joining the roster.
        </p>

        <form action={submitProfile} className="mt-5 space-y-4">
          <input
            name="name"
            defaultValue={profile?.name ?? ""}
            placeholder="your name"
            required
            className="w-full rounded-2xl bg-slate-950/40 px-4 py-3 text-white outline-none"
          />

          <input
            name="avatar"
            type="file"
            accept="image/*"
            required
            className="w-full rounded-2xl bg-slate-950/40 px-4 py-3 text-white outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-3 file:py-2 file:text-slate-950"
          />

          <button className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
            save profile
          </button>
        </form>
      </div>
    </div>
  );
}
