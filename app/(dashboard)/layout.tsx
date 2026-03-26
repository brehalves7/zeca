import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import MobileSidebar from "@/components/dashboard/mobile-sidebar";

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
      {/* Mobile Sidebar (Fixed Header + Drawer) */}
      <MobileSidebar userEmail={user.email} />

      {/* Sidebar Desktop */}
      <Sidebar userEmail={user.email} />

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full overflow-x-hidden min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
