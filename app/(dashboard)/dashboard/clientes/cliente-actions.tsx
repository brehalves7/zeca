"use client";

import { Trash2, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { deleteCliente } from "./actions";
import { EditClienteModal } from "./edit-cliente-modal"; // Importando o novo modal

// Agora recebemos o objeto cliente completo para passar ao modal de edição
export function ClienteActions({ cliente }: { cliente: any }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`))
      return;

    setIsDeleting(true);
    const result = await deleteCliente(cliente.id);

    if (result?.error) {
      alert(result.error);
    }

    setIsDeleting(false);
  }

  return (
    <div className="relative flex items-center justify-end gap-1">
      {/* Botão de Enviar Mensagem (Opcional, se quiser manter aqui) */}
      <button
        className="p-3 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all"
        title="Enviar Mensagem"
      >
        <MessageSquare size={20} />
      </button>

      {/* NOVO: Botão/Modal de Editar */}
      <EditClienteModal cliente={cliente} />

      {/* Botão de Excluir */}
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
    </div>
  );
}
