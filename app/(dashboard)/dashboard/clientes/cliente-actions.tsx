"use client";

import { MoreVertical, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteCliente } from "./actions";

export function ClienteActions({ id, nome }: { id: string; nome: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) return;

    setIsDeleting(true);
    await deleteCliente(id);
    setIsDeleting(false);
    setShowConfirm(false);
  }

  return (
    <div className="relative flex items-center justify-end gap-1">
      <button
        disabled={isDeleting}
        onClick={handleDelete}
        className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all disabled:opacity-50"
        title="Excluir Cliente"
      >
        {isDeleting ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Trash2 size={20} />
        )}
      </button>

      <button className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
        <MoreVertical size={20} />
      </button>
    </div>
  );
}
