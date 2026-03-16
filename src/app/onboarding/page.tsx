import { redirect } from "next/navigation";
import { ProfileSaveButton } from "@/components/profile-save-button";
import { completeProfile } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

  if (profile?.name) {
    redirect("/");
  }

  async function submitProfile(formData: FormData) {
    "use server";
    await completeProfile(formData);
  }

  return (
    <div className="flex min-h-screen items-center px-4">
      <div className="w-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          welcome
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          complete your profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add your name now. A profile picture is optional and you can always
          add it later.
        </p>

        <form action={submitProfile} className="mt-6 space-y-4">
          <input
            name="name"
            defaultValue={profile?.name ?? ""}
            placeholder="your name"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
          />

          <input
            name="avatar"
            type="file"
            accept="image/*"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:text-sky-700"
          />

          <ProfileSaveButton label="continue" />
        </form>
      </div>
    </div>
  );
}
