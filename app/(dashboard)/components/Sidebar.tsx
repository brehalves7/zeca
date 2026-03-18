"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Zap,
  MessageSquare,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard/home", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/dashboard/produtos", label: "Produtos", icon: Package },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const content = (
    <div className="flex flex-col h-full p-6 bg-[#101216] md:bg-transparent">
      {/* Header Logo */}
      <div className="flex items-center justify-between px-3 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
            <Zap size={16} className="text-[#0F1115] fill-current" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">
            Zeca<span className="text-emerald-500">.ai</span>
          </span>
        </div>

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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
                  className={
                    isActive
                      ? "text-emerald-500"
                      : "group-hover:text-emerald-400"
                  }
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Widget de Status do Bot */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl mb-4 flex items-center gap-3">
        <div className="relative">
          <MessageSquare size={18} className="text-emerald-500" />
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10B981]" />
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">
            Bot Ativo
          </p>
          <p className="text-[10px] text-gray-500">Pronto para áudios</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/5 transition-all duration-200 w-full text-left"
      >
        <LogOut size={18} />
        Sair da conta
      </button>
    </div>
  );

  if (isMobile) return content;

  return (
    <aside className="hidden md:block w-64 min-h-screen bg-[#101216] border-r border-white/5 fixed top-0 left-0 z-50">
      {content}
    </aside>
  );
}
