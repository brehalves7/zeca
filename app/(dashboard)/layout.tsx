"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Link from "next/link";
import { Home, ClipboardList, Users, User, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name, whatsapp_business_number")
        .eq("id", user.id)
        .single();

      if (!profile?.company_name || !profile?.whatsapp_business_number) {
        router.push("/onboarding");
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-white overflow-x-hidden">
      {/* Sidebar Desktop (Oculta no Mobile) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Header Mobile - Título Centralizado conforme a imagem */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F1115] flex items-center justify-between px-6 z-40">
        <div className="w-10" /> {/* Spacer para centralizar o título */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">Zeca-IA</h1>
          <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
        </div>
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={22} />
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="dashboard-main">
        <style jsx>{`
          .dashboard-main {
            margin-left: var(--sidebar-width);
            padding: 32px;
            min-height: 100vh;
          }
          @media (max-width: 768px) {
            .dashboard-main {
              margin-left: 0 !important;
              padding: 20px;
              padding-top: 80px; /* Espaço para o Header mobile */
              padding-bottom: 100px; /* Espaço para a Tab Bar inferior */
            }
          }
        `}</style>
        {children}
      </main>

      {/* Bottom Tab Bar Mobile (Aparece apenas abaixo de 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#101216]/95 backdrop-blur-xl border-t border-white/5 h-20 flex items-center justify-around px-2 z-50">
        <TabItem
          href="/dashboard/home"
          icon={Home}
          label="Início"
          active={pathname === "/dashboard/home"}
        />
        <TabItem
          href="/dashboard/pedidos"
          icon={ClipboardList}
          label="Pedidos"
          active={pathname === "/dashboard/pedidos"}
        />
        <TabItem
          href="/dashboard/clientes"
          icon={Users}
          label="Clientes"
          active={pathname === "/dashboard/clientes"}
        />
        <TabItem
          href="/dashboard/perfil"
          icon={User}
          label="Perfil"
          active={pathname === "/dashboard/perfil"}
        />
      </nav>
    </div>
  );
}

// Sub-componente para os itens da barra inferior
function TabItem({ href, icon: Icon, label, active }: any) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 w-full relative"
    >
      <div
        className={`transition-all duration-300 ${active ? "text-emerald-500 scale-110" : "text-slate-500"}`}
      >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span
        className={`text-[10px] font-medium transition-colors ${active ? "text-emerald-500" : "text-slate-500"}`}
      >
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute -top-3 w-8 h-1 bg-emerald-500 rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}
