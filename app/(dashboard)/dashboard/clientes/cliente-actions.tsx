"use client";

import { Trash2, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { deleteCliente } from "./actions";
import { EditClienteModal } from "./edit-cliente-modal";
import ConfirmModal from "@/components/dashboard/confirm-modal";

export function ClienteActions({ cliente }: { cliente: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteCliente(cliente.id);

    if (result?.error) {
      alert(result.error);
    }

    setIsDeleting(false);
    setShowConfirm(false);
  }

  return (
    <div className="relative flex items-center justify-end gap-1">
      <button
        className="p-3 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all"
        title="Enviar Mensagem"
      >
        <MessageSquare size={20} />
      </button>

      <EditClienteModal cliente={cliente} />

      <button
        disabled={isDeleting}
        onClick={() => setShowConfirm(true)}
        className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all disabled:opacity-50"
        title="Excluir Cliente"
      >
        <Trash2 size={20} />
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir ${cliente.nome}? Esta ação removerá o histórico e não pode ser desfeita.`}
      />
    </div>
  );
}
