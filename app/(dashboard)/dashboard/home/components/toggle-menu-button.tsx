"use client";

  import { Menu, X } from "lucide-react";
  import { useMenuStore } from "@/lib/store/use-menu-store";

  export function ToggleMenuButton() {
    const { isOpen, toggleMenu } = useMenuStore();

    return (
      <button
        onClick={toggleMenu}
        className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors z-[110] relative"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    );
  }