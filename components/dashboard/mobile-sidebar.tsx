"use client"

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Zap } from "lucide-react";
import { useMenuStore } from "@/lib/store/use-menu-store";
import { SidebarContent } from "./sidebar-content";

export default function MobileSidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const { isOpen, toggleMenu, closeMenu } = useMenuStore();

  const isProfilePage = pathname === "/dashboard/perfil";

  return (
    <>
      {/* Mobile Header com Botão Hambúrguer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F1115]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-[80] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Zap size={16} className="text-[#0F1115] fill-current" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight italic">
            Zeca<span className="text-emerald-500">.ai</span>
          </span>
        </div>

        {!isProfilePage && (
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5"
            aria-label="Abrir Menu"
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* Backdrop para fechar o menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Mobile Deslizante */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-[100] w-64 bg-[#101216] border-r border-white/5 
          transition-transform duration-300 ease-in-out shadow-2xl lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent 
          userEmail={userEmail} 
          closeMenu={closeMenu} 
          showCloseButton={true} 
        />
      </aside>
    </>
  );
}
