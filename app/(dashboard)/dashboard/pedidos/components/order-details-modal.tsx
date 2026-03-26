"use client";

import { useState } from "react";
import { X, User, Mail, Phone, ShoppingBag, Hash, Loader2, CheckCircle2, Truck, MessageCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface OrderDetailsModalProps {
  pedido: any;
}

export default function OrderDetailsModal({ pedido }: OrderDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: newStatus })
        .eq("id", pedido.id);

      if (error) throw error;
      
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      alert("Erro ao atualizar status.");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const phone = pedido.cliente_telefone.replace(/\D/g, "");
    const message = encodeURIComponent(`Olá ${pedido.cliente_nome}, aqui é o Zeca, assistente do sistema. Recebi seu pedido de R$ ${pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e estou aqui para confirmar os detalhes.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
      >
        Detalhes
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
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-3xl bg-[#16181D] border border-white/5 p-6 md:p-10 rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                      #PED-{pedido.codigo_pedido}
                    </span>
                    {pedido.status_ia === 'CONFIRMADO' && (
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        <Sparkles size={12} />
                        Zeca-IA
                      </span>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/5`}>
                      {pedido.status}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tight uppercase">
                    Checkout do <span className="text-emerald-500">Pedido</span>
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* LADO ESQUERDO: CLIENTE & IA */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Dados do Cliente
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                        <div className="p-3 bg-white/5 rounded-xl text-slate-400">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nome Completo</p>
                          <p className="text-white font-bold text-lg">{pedido.cliente_nome}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5 overflow-hidden">
                          <div className="p-3 bg-white/5 rounded-xl text-slate-400">
                            <Mail size={20} />
                          </div>
                          <div className="truncate">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Email para NF</p>
                            <p className="text-white font-bold truncate">{pedido.cliente_email}</p>
                          </div>
                        </div>
                      </div>

                      {/* BOTÃO WHATSAPP DESTAQUE */}
                      <button
                        onClick={openWhatsApp}
                        className="w-full flex items-center justify-center gap-4 bg-[#25D366] hover:bg-[#1fb356] p-5 rounded-2xl transition-all group shadow-[0_10px_20px_rgba(37,211,102,0.2)]"
                      >
                        <MessageCircle size={22} className="text-[#0F1115]" />
                        <span className="text-[#0F1115] font-black uppercase text-xs tracking-[0.1em] italic">Contactar via WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* NOTAS DO ZECA (IA) */}
                  <div>
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Notas do Zeca (IA)
                    </h3>
                    <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles size={40} className="text-blue-500" />
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed italic font-medium relative z-10">
                        "{pedido.transcricao || pedido.observacoes || "Nenhuma observação da IA disponível para este pedido."}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* LADO DIREITO: RESUMO & STATUS */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      Resumo da Venda
                    </h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Hash size={12} /> Valor Total
                        </p>
                        <p className="text-2xl md:text-3xl font-black text-white italic">
                          R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                          <ShoppingBag size={12} /> Itens
                        </p>
                        <p className="text-2xl md:text-3xl font-black text-white italic">
                          {pedido.itens_quantidade.toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PAINEL DE AÇÕES */}
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Painel de Controle</h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {pedido.status === 'PENDENTE' && (
                        <button
                          onClick={() => updateStatus('PAGO')}
                          disabled={loading}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0F1115] font-black uppercase text-[11px] tracking-[0.2em] italic py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                        >
                          {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <><CheckCircle2 size={18} /> Aprovar Pagamento</>
                          )}
                        </button>
                      )}
                      
                      {(pedido.status === 'PAGO' || pedido.status === 'PENDENTE') && (
                        <button
                          onClick={() => updateStatus('ENVIADO')}
                          disabled={loading}
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white font-black uppercase text-[11px] tracking-[0.2em] italic py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
                        >
                          {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <><Truck size={18} /> Marcar como Enviado</>
                          )}
                        </button>
                      )}

                      {pedido.status === 'ENVIADO' && (
                        <div className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-500 py-6 rounded-2xl text-center">
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] italic">Pedido Despachado com Sucesso</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
