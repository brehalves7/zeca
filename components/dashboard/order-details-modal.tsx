"use client";

import { useState } from "react";
import { 
  X, User, Mail, Phone, ShoppingBag, Hash, Loader2, 
  CheckCircle2, Truck, MessageCircle, Sparkles, Pencil, ArrowUpRight,
  Package, RotateCcw, XCircle, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderEditModal from "./order-edit-modal";
import { useOrderActions } from "@/lib/hooks/use-order-actions";
import { StatusBadge } from "./status-badge";

interface Order {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  valor_total: number;
  itens_quantidade: number;
  sku?: string;
  codigo_pedido?: string;
  status: string;
  status_ia: string;
  data_pagamento?: string;
  created_at?: string;
  transcricao?: string;
  observacoes?: string;
}

interface OrderDetailsModalProps {
  pedido: Order;
  isOpen: boolean;
  onClose: () => void;
  showTrigger?: boolean;
}

export default function OrderDetailsModal({ 
  pedido, 
  isOpen, 
  onClose,
  showTrigger = false
}: OrderDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const { updateOrderStatus, isLoading: loading } = useOrderActions();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    const result = await updateOrderStatus(pedido.id, newStatus);
    if (result.success) {
      showToast(newStatus === 'PAGO' ? "Pagamento confirmado!" : `Status: ${newStatus}`);
    } else {
      showToast("Erro ao atualizar status", "error");
    }
  };

  const openWhatsApp = () => {
    const phone = pedido.cliente_telefone?.replace(/\D/g, "");
    if (!phone) return showToast("Telefone não disponível", "error");
    const message = encodeURIComponent(`Olá ${pedido.cliente_nome}, aqui é o Zeca, assistente do sistema. Recebi seu pedido de R$ ${pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e estou aqui para confirmar os detalhes.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && onClose()}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-4xl bg-[#16181D] border border-white/5 p-6 md:p-10 rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Toast Notification */}
              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className={`absolute top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 border ${
                      toast.type === 'success' 
                      ? 'bg-emerald-500 text-[#0F1115] border-emerald-400' 
                      : 'bg-red-500 text-white border-red-400'
                    }`}
                  >
                    {toast.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {toast.message}
                  </motion.div>
                )}
              </AnimatePresence>

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
                    <StatusBadge status={pedido.status} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tight uppercase">
                    Gestão do <span className="text-emerald-500">Pedido</span>
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-full transition-all text-slate-500 border border-white/5"
                    title="Editar Valores"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                  >
                    <X size={28} />
                  </button>
                </div>
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
                      <Link 
                        href={`/dashboard/clientes/${pedido.cliente_id}`}
                        className="flex items-center gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group/client"
                      >
                        <div className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover/client:text-emerald-500 transition-colors">
                          <User size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ver Perfil Completo</p>
                          <p className="text-white font-bold text-lg flex items-center gap-2 underline decoration-transparent group-hover/client:decoration-emerald-500 transition-all underline-offset-4">
                            {pedido.cliente_nome}
                            <ArrowUpRight size={16} className="text-slate-500 group-hover/client:text-emerald-500" />
                          </p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-3 bg-white/5 rounded-xl text-slate-400">
                          <Phone size={20} />
                        </div>
                        <div className="truncate">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">WhatsApp</p>
                          <p className="text-white font-bold truncate">{pedido.cliente_telefone || "Não informado"}</p>
                        </div>
                      </div>

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
                      Transcrição IA
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
                      Financeiro
                    </h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Hash size={12} /> Valor Pedido
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
                      
                      {pedido.sku && (
                        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 col-span-2">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Package size={12} /> SKU Vinculado
                          </p>
                          <p className="text-lg font-black text-white italic">{pedido.sku}</p>
                        </div>
                      )}

                      {pedido.data_pagamento && (
                        <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 col-span-2 animate-in fade-in slide-in-from-top-2 duration-500">
                          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CheckCircle2 size={12} /> Liquidação Confirmada
                          </p>
                          <p className="text-sm font-bold text-white uppercase italic">
                            {new Date(pedido.data_pagamento).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PAINEL DE AÇÕES */}
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Painel de Decisão</h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {pedido.status !== 'PAGO' && (
                        <button
                          onClick={() => handleStatusUpdate('PAGO')}
                          disabled={loading}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0F1115] font-black uppercase text-[11px] tracking-[0.2em] italic py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95"
                        >
                          {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <><CheckCircle2 size={18} /> Validar e Aprovar</>
                          )}
                        </button>
                      )}
                      
                      {pedido.status === 'PAGO' && (
                        <button
                          onClick={() => handleStatusUpdate('PENDENTE')}
                          disabled={loading}
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 font-black uppercase text-[11px] tracking-[0.2em] italic py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
                        >
                          {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <><RotateCcw size={18} /> Estornar para Pendente</>
                          )}
                        </button>
                      )}

                      {(pedido.status === 'PAGO' || pedido.status === 'PENDENTE') && (
                        <button
                          onClick={() => handleStatusUpdate('ENVIADO')}
                          disabled={loading}
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white font-black uppercase text-[11px] tracking-[0.2em] italic py-5 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                          {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <><Truck size={18} /> Marcar como Despachado</>
                          )}
                        </button>
                      )}

                      {pedido.status === 'ENVIADO' && (
                        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 py-6 rounded-2xl text-center">
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] italic">Pedido Finalizado e Despachado</p>
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

      {/* Modal de Edição Interno */}
      <AnimatePresence>
        {isEditing && (
          <OrderEditModal 
            order={pedido} 
            onClose={() => setIsEditing(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
