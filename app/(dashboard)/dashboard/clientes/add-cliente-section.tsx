"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import AddClienteForm from "./add-cliente-form";

export function AddClienteSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-500 hover:bg-emerald-400 text-[#0F1115] font-black px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 group"
      >
        <UserPlus size={18} />
        Cadastrar Novo
      </button>

      {/* Renderiza o modal apenas se estiver aberto */}
      {isOpen && <AddClienteForm onClose={() => setIsOpen(false)} />}
    </>
  );
}