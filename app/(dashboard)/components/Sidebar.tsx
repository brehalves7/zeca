"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Zap,
  MessageSquare,
  Users,
  User,
  X,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMenuStore } from "@/lib/store/use-menu-store";

const navItems = [
  { href: "/dashboard/home", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/produtos", label: "Produtos", icon: Package },
  { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  userEmail?: string | null;
}

export default function Sidebar({ userEmail: propUserEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(propUserEmail ?? null);
  
  const { isOpen, closeMenu } = useMenuStore();

  useEffect(() => {
    // Se o propUserEmail for fornecido, use-o e evite chamada extra
    if (propUserEmail) {
      setUserEmail(propUserEmail);
      return;
    }

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    }
    getUser();
  }, [propUserEmail]); // Supabase removido para evitar loops

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const content = (
    <div className="flex flex-col h-full p-6 bg-[#101216]">
      {/* Header Logo */}
      <div className="flex items-center justify-between px-3 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
            <Zap size={16} className="text-[#0F1115] fill-current" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight italic">
            Zeca<span className="text-emerald-500">.ai</span>
          </span>
        </div>

        <button
          onClick={closeMenu}
          className="lg:hidden p-1 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="group relative no-underline"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                />
              )}
              <div
                className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 relative z-10
                ${isActive ? "text-white font-semibold" : "text-gray-400 font-medium hover:text-gray-200"}
              `}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-emerald-500" : "group-hover:text-emerald-400"}
                />
                {item.label}
              </div>
            </Link>
          );
        })}

        {/* Seção Administração */}
        {userEmail === "breh_sjp@hotmail.com" && (
          <div className="mt-8 mb-2">
            <div className="px-4 mb-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Administração
              </p>
            </div>
            <Link
              href="/dashboard/admin/clientes"
              onClick={closeMenu}
              className="group relative no-underline block"
            >
              {pathname === "/dashboard/admin/clientes" && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                />
              )}
              <div
                className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 relative z-10
                ${pathname === "/dashboard/admin/clientes" ? "text-white font-semibold" : "text-gray-400 font-medium hover:text-gray-200"}
              `}
              >
                <ShieldCheck
                  size={18}
                  strokeWidth={pathname === "/dashboard/admin/clientes" ? 2.5 : 2}
                  className={pathname === "/dashboard/admin/clientes" ? "text-emerald-500" : "group-hover:text-emerald-400"}
                />
                Gestão de Clientes
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer: Status e Logout */}
      <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
        <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center gap-3">
          <div className="relative">
            <MessageSquare size={18} className="text-emerald-500" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10B981]" />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] font-bold text-white uppercase tracking-wider">Bot Ativo</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">IA Operacional</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/5 transition-all duration-200 w-full text-left"
        >
          <LogOut size={18} />
          Sair da conta
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-[100] w-64 bg-[#101216] border-r border-white/5 
          transition-transform duration-300 ease-in-out shadow-2xl
          lg:static lg:translate-x-0 lg:z-0 lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {content}
      </aside>
    </>
  );
}