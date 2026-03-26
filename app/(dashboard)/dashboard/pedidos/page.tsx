import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Package,
  Search,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import AddOrderModal from "./components/add-order-modal";
import OrderDetailsModal from "./components/order-details-modal";

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false });

  // 1. Cálculos de Estatísticas Reais
  const hoje = new Date().toISOString().split('T')[0];
  const pedidosHoje = pedidos?.filter(p => p.created_at.startsWith(hoje)).length || 0;
  const pedidosPendentes = pedidos?.filter(p => p.status === 'PENDENTE').length || 0;
  const pedidosConcluidos = pedidos?.filter(p => p.status === 'PAGO').length || 0;

  const stats = [
    {
      label: "Total Hoje",
      value: pedidosHoje.toString().padStart(2, '0'),
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      label: "Pendentes",
      value: pedidosPendentes.toString().padStart(2, '0'),
      icon: Clock,
      color: "text-amber-500",
    },
    {
      label: "Concluídos",
      value: pedidosConcluidos.toString().padStart(2, '0'),
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return { label: 'Aguardando', color: 'text-amber-500', dot: 'bg-amber-500' };
      case 'PAGO':
        return { label: 'Aprovado', color: 'text-emerald-500', dot: 'bg-emerald-500' };
      case 'ENVIADO':
        return { label: 'Despachado', color: 'text-blue-500', dot: 'bg-blue-500' };
      case 'CANCELADO':
        return { label: 'Cancelado', color: 'text-red-500', dot: 'bg-red-500' };
      default:
        return { label: status, color: 'text-slate-500', dot: 'bg-slate-500' };
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER PRINCIPAL COM TÍTULO E BOTÃO NOVO PEDIDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            Gestão de <span className="text-emerald-500">Pedidos</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Controle suas vendas e status em tempo real
          </p>
        </div>
        <AddOrderModal />
      </div>

      {/* 1. HEADER COM STATS RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#16181D] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-white italic">
                {stat.value}
              </p>
            </div>
            <div className={`p-4 bg-white/[0.02] rounded-2xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. BARRA DE BUSCA E FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#16181D] p-4 rounded-[2rem] border border-white/5">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["Todos", "Pendentes", "Pagos", "Enviados"].map((filter, i) => (
            <button
              key={i}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${i === 0 ? "bg-emerald-500 text-[#0F1115]" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LISTA DE PEDIDOS (CARD STYLE) */}
      <div className="space-y-4">
        {pedidos?.length === 0 ? (
          <div className="text-center py-20 bg-[#16181D] border border-dashed border-white/10 rounded-[2rem]">
            <p className="text-slate-500 font-medium">Zeca está aguardando o primeiro pedido...</p>
          </div>
        ) : (
          pedidos?.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div
                key={order.id}
                className="group bg-[#16181D] hover:bg-[#1c1f26] border border-white/5 p-5 rounded-[2rem] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        #PED-{order.codigo_pedido}
                      </span>
                      {order.status_ia === 'CONFIRMADO' && (
                        <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          <Sparkles size={10} />
                          Zeca-IA
                        </span>
                      )}
                      {order.status_ia !== 'CONFIRMADO' && (
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                          Manual
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        • {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg">
                      {order.cliente_nome}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {order.itens_quantidade} itens • R$ {order.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none border-white/5 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Status
                    </p>
                    <div className={`flex items-center gap-2 ${statusInfo.color} uppercase text-[11px] font-black tracking-widest`}>
                      <div className={`w-1.5 h-1.5 ${statusInfo.dot} rounded-full animate-pulse`} />
                      {statusInfo.label}
                    </div>
                  </div>

                  <OrderDetailsModal pedido={order} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
