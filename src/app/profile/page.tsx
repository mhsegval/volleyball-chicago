import { redirect } from "next/navigation";
import { Wallet, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BottomBar } from "@/components/bottom-bar";
import { UserAvatar } from "@/components/user-avatar";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { ProfilePaymentSection } from "@/components/profile-payment-section";
import type { UserProfile, PaymentRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    .single<UserProfile>();

  if (!profile) {
    redirect("/auth");
  }

  const { data: paymentRequests } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const isLowBalance = Number(profile.balance) <= 10;
  const hasPendingPayment =
    ((paymentRequests ?? []) as PaymentRequest[]).length > 0;

  return (
    <div className="space-y-5 px-4 py-5 pb-32">
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={profile.name || "user"}
            avatarUrl={profile.avatar_url}
            size={80}
          />

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              profile
            </p>
            <h1 className="mt-2 truncate text-3xl font-bold tracking-tight text-slate-900">
              {profile.name || "unnamed user"}
            </h1>
            <p className="mt-2 truncate text-sm text-slate-500">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                balance
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              ${Number(profile.balance).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                streak
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {profile.streak}
            </p>
          </div>
        </div>
      </section>

      <ProfilePaymentSection
        lowBalance={isLowBalance}
        hasPendingPayment={hasPendingPayment}
      />

      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
            account
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            edit profile
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Update your name or photo at any time.
          </p>
        </div>

        <ProfileEditForm defaultName={profile.name ?? ""} />
      </section>

      <BottomBar isAdmin={profile.role === "admin"} />
    </div>
  );
}
