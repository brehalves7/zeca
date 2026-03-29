"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  MessageCircle, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  Hash,
  Pencil,
  Eye,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import OrderEditModal from "@/components/dashboard/order-edit-modal";
import OrderDetailsModal from "@/components/dashboard/order-details-modal";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface ClientDetailsContentProps {
  cliente: any;
  initialPedidos: any[];
}

export default function ClientDetailsContent({ cliente, initialPedidos }: ClientDetailsContentProps) {
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState<any>(null);

  // 📈 Cálculos Financeiros
  const stats = useMemo(() => {
    const ltv = initialPedidos
      .filter(p => p.status !== 'CANCELADO')
      .reduce((sum, p) => sum + Number(p.valor_total || 0), 0);
    
    const pagos = initialPedidos.filter(p => p.status === 'PAGO').length;
    const pendentes = initialPedidos.filter(p => p.status === 'PENDENTE').length;
    const valorPendente = initialPedidos
      .filter(p => p.status === 'PENDENTE')
      .reduce((sum, p) => sum + Number(p.valor_total || 0), 0);
    
    const ticketMedio = initialPedidos.length > 0 ? ltv / initialPedidos.length : 0;

    return { ltv, pagos, pendentes, valorPendente, ticketMedio };
  }, [initialPedidos]);

  const whatsappLink = `https://wa.me/${cliente.telefone?.replace(/\D/g, "")}`;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* HEADER & VOLTAR */}
      <div className="flex flex-col gap-6">
        <Link 
          href="/dashboard/clientes" 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors w-fit group"
        >
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest italic">Voltar para Clientes</span>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl border
              ${stats.pendentes > 0 
                ? "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10" 
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10"}`}>
              {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                  {cliente.nome}
                </h1>
                {stats.pendentes > 0 ? (
                  <span className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <AlertCircle size={10} /> Inadimplente
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <CheckCircle2 size={10} /> Em Dia
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                {cliente.telefone || "Sem telefone"} • {cliente.cidade || "Cidade não informada"}
              </p>
            </div>
          </div>

          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1fb356] text-[#0F1115] px-8 py-5 rounded-[1.8rem] transition-all font-black uppercase text-xs tracking-[0.2em] italic shadow-lg shadow-emerald-500/20 hover:scale-105"
          >
            <MessageCircle size={20} />
            Enviar WhatsApp
          </a>
        </div>
      </div>

      {/* CARDS FINANCEIROS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* LTV */}
        <div className="bg-[#16181D] border border-white/5 p-6 rounded-[2.2rem] space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">LTV (Gasto Total)</p>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-white italic tracking-tight">
            R$ {stats.ltv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Pendente */}
        <div className="bg-[#16181D] border border-white/5 p-6 rounded-[2.2rem] space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Saldo em Aberto</p>
            <div className={`p-3 rounded-xl ${stats.pendentes > 0 ? "bg-orange-500/10 text-orange-500" : "bg-white/5 text-slate-500"}`}>
              <Clock size={18} />
            </div>
          </div>
          <p className={`text-2xl font-black italic tracking-tight ${stats.pendentes > 0 ? "text-orange-500" : "text-white/40"}`}>
            R$ {stats.valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Ticket Médio */}
        <div className="bg-[#16181D] border border-white/5 p-6 rounded-[2.2rem] space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ticket Médio</p>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-white italic tracking-tight">
            R$ {stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Paid Info */}
        <div className="bg-[#16181D] border border-white/5 p-6 rounded-[2.2rem] space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pagamentos</p>
            <div className="p-3 bg-white/5 rounded-xl text-slate-500">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-black text-white italic tracking-tight">
              {stats.pagos.toString().padStart(2, '0')}
            </p>
            <p className="text-[10px] text-slate-500 font-bold mb-1">Liquidado(s)</p>
          </div>
        </div>
      </div>

      {/* TABELA DE HISTÓRICO */}
      <div className="bg-[#16181D] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
            <Hash className="text-emerald-500" size={20} /> Histórico de <span className="text-emerald-500">Compras</span>
          </h2>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl">
            {initialPedidos.length} Pedidos Encontrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Data</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">SKU / Produto</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Quant.</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Valor Total</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {initialPedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-500 italic">
                    Este cliente ainda não realizou compras.
                  </td>
                </tr>
              ) : (
                initialPedidos.map((pedido) => (
                  <tr 
                    key={pedido.id} 
                    onClick={() => setSelectedDetailsOrder(pedido)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-400">
                        {format(new Date(pedido.created_at), "dd/MM/yyyy")}
                      </p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-0.5">
                        {format(new Date(pedido.created_at), "HH:mm")}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                          <ShoppingBag size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">
                            {pedido.sku || "N/A"}
                          </p>
                          <p className="text-[9px] text-slate-500 font-black uppercase truncate max-w-[150px]">
                            {pedido.codigo_pedido && `ID: ${pedido.codigo_pedido}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-black text-white italic">
                        {pedido.itens_quantidade.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-emerald-500 italic">
                        R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={pedido.status} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingOrder(pedido);
                          }}
                          className="p-2.5 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all border border-white/5"
                          title="Editar valores"
                        >
                          <Pencil size={16} />
                        </button>
                        <div className="bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-2 rounded-xl border border-white/5 transition-all">
                          Ver Detalhes
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editingOrder && (
          <OrderEditModal 
            order={editingOrder} 
            onClose={() => setEditingOrder(null)} 
          />
        )}
      </AnimatePresence>

      {selectedDetailsOrder && (
        <OrderDetailsModal 
          pedido={selectedDetailsOrder}
          isOpen={!!selectedDetailsOrder}
          onClose={() => setSelectedDetailsOrder(null)}
        />
      )}
    </div>
  );
}
