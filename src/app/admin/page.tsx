import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/admin-panel";
import { BottomBar } from "@/components/bottom-bar";
import type { Run, Signup, UserProfile } from "@/lib/types";

type SignupWithUser = Signup & { users: UserProfile };

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = (params.q ?? "").trim();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  await supabase.rpc("complete_expired_runs");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single<UserProfile>();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const [{ data: activeRun }, usersResult] = await Promise.all([
    supabase.from("runs").select("*").eq("status", "active").maybeSingle<Run>(),
    query
      ? supabase
          .from("users")
          .select("*")
          .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
          .order("name")
          .limit(30)
      : supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30),
  ]);

  let signups: SignupWithUser[] = [];

  if (activeRun) {
    const { data } = await supabase
      .from("signups")
      .select("*, users(*)")
      .eq("run_id", activeRun.id)
      .order("created_at", { ascending: true });

    signups = (data ?? []) as SignupWithUser[];
  }

  return (
    <div className="space-y-5 px-4 py-5 pb-32">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
          admin
        </p>
        <h1 className="mt-2 text-3xl font-bold">run management</h1>
      </div>

      <AdminPanel
        activeRun={activeRun}
        signups={signups}
        users={(usersResult.data ?? []) as UserProfile[]}
        searchQuery={query}
      />

      <BottomBar isAdmin />
    </div>
  );
}
