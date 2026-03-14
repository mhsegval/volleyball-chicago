import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { createClient } from "@/lib/supabase/server";

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <div className="flex min-h-screen items-center px-4">
      <AuthCard />
    </div>
  );
}
