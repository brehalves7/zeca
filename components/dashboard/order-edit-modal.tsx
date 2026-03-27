"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface OrderEditModalProps {
  order: any;
  onClose: () => void;
}

export default function OrderEditModal({ order, onClose }: OrderEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itens_quantidade: order.itens_quantidade,
    valor_total: order.valor_total,
  });
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({
          itens_quantidade: Number(formData.itens_quantidade),
          valor_total: Number(formData.valor_total)
        })
        .eq("id", order.id);

      if (error) throw error;
      router.refresh();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
      alert("Falha ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[#16181D] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white italic tracking-tight uppercase flex items-center gap-2">
            <Pencil className="text-emerald-500" size={24} /> Editar <span className="text-emerald-500">Valores</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade</label>
            <input
              type="number"
              value={formData.itens_quantidade}
              onChange={(e) => setFormData({ ...formData, itens_quantidade: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white text-sm focus:border-emerald-500/50 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Total (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.valor_total}
              onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white text-sm focus:border-emerald-500/50 outline-none font-bold"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Salvar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
