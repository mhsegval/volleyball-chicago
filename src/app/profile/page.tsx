import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOwnProfile } from "@/lib/actions";
import { UserAvatar } from "@/components/user-avatar";
import { BottomBar } from "@/components/bottom-bar";
import { PaymentModal } from "@/components/payment-modal";
import { ProfileSaveButton } from "@/components/profile-save-button";
import type { UserProfile, PaymentRequest } from "@/lib/types";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { ProfilePaymentSection } from "@/components/profile-payment-section";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [{ data: profile }, { data: paymentRequests }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single<UserProfile>(),
    supabase
      .from("payment_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) {
    redirect("/auth");
  }

  async function submitProfile(formData: FormData) {
    "use server";
    await updateOwnProfile(formData);
  }

  const isNegativeBalance = Number(profile.balance) < 0;
  const isLowBalance = Number(profile.balance) <= 10;
  const hasPendingPayment = (paymentRequests ?? []).length > 0;

  return (
    <div className="space-y-5 px-4 py-5 pb-32">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          profile
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">your account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your profile, check your balance, and top up when needed.
        </p>
      </div>

      <ProfilePaymentSection
        lowBalance={isLowBalance}
        hasPendingPayment={hasPendingPayment}
      />

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={profile.name}
            avatarUrl={profile.avatar_url}
            size={76}
          />

          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-slate-900">
              {profile.name || "unnamed user"}
            </h2>
            <p className="truncate text-sm text-slate-500">
              {profile.email || "no email"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                {profile.role}
              </span>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                {profile.streak} week streak
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div
            className={`rounded-3xl p-4 ${
              isNegativeBalance ? "bg-red-50" : "bg-emerald-50"
            }`}
          >
            <p
              className={`text-xs uppercase tracking-wider ${
                isNegativeBalance ? "text-red-700" : "text-emerald-700"
              }`}
            >
              balance
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              ${Number(profile.balance).toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {isNegativeBalance
                ? "please pay and wait for admin review"
                : "available account balance"}
            </p>
          </div>

          <div className="rounded-3xl bg-orange-50 p-4">
            <p className="text-xs uppercase tracking-wider text-orange-700">
              streak
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {profile.streak}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              consecutive attended weeks
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">edit profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          Update your display name or profile picture anytime.
        </p>

        <ProfileEditForm defaultName={profile.name ?? ""} />
      </section>

      <BottomBar isAdmin={profile.role === "admin"} />
    </div>
  );
}
