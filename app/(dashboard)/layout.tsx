import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, whatsapp_business_number")
    .eq("id", user.id)
    .single();

  if (!profile?.company_name || !profile?.whatsapp_business_number) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-[#0F1115] text-white">
      {/* Sidebar handles its own responsive visibility */}
      <Sidebar userEmail={user.email} />

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}
