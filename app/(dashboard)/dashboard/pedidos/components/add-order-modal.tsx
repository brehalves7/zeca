"use client";

import { useState } from "react";
import { Plus, X, User, Mail, Phone, ShoppingBag, Hash, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddOrderModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    cliente_nome: "",
    cliente_email: "",
    cliente_telefone: "",
    valor_total: "",
    itens_quantidade: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Gera um código de pedido simples (ex: timestamp ou random)
      const codigo_pedido = Math.floor(1000 + Math.random() * 9000).toString();

      const { error } = await supabase.from("pedidos").insert([
        {
          user_id: user.id,
          cliente_nome: formData.cliente_nome,
          cliente_email: formData.cliente_email,
          cliente_telefone: formData.cliente_telefone,
          valor_total: parseFloat(formData.valor_total),
          itens_quantidade: parseInt(formData.itens_quantidade),
          codigo_pedido,
          status: "PENDENTE",
        },
      ]);

      if (error) throw error;

      setIsOpen(false);
      setFormData({
        cliente_nome: "",
        cliente_email: "",
        cliente_telefone: "",
        valor_total: "",
        itens_quantidade: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao criar pedido. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0F1115] px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105"
      >
        <Plus size={18} className="transition-transform group-hover:rotate-90" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Novo Pedido</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#16181D] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">
                    Novo <span className="text-emerald-500">Pedido</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Preencha os dados da venda abaixo
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome do Cliente */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nome do Cliente
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      required
                      value={formData.cliente_nome}
                      onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                      placeholder="Ex: João Silva"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        required
                        type="email"
                        value={formData.cliente_email}
                        onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                        placeholder="email@exemplo.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Telefone / Whats
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        required
                        value={formData.cliente_telefone}
                        onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Valor Total */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Valor Total (R$)
                    </label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.valor_total}
                        onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                        placeholder="0,00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Quantidade
                    </label>
                    <div className="relative group">
                      <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        required
                        type="number"
                        value={formData.itens_quantidade}
                        onChange={(e) => setFormData({ ...formData, itens_quantidade: e.target.value })}
                        placeholder="1"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0F1115] font-black uppercase tracking-[0.2em] italic py-5 rounded-[1.8rem] transition-all duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.2)] mt-4 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Confirmar Pedido"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
