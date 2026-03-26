"use client";

import { SidebarContent } from "@/components/dashboard/sidebar-content";

interface SidebarProps {
  userEmail?: string | null;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex w-64 min-h-screen bg-[#101216] border-r border-white/5 sticky top-0 shrink-0"
    >
      <SidebarContent userEmail={userEmail} />
    </aside>
  );
}