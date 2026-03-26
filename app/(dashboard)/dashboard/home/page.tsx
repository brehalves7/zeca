import { createClient } from "@/lib/supabase/server";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  MessageSquare,
  Play,
  AlertCircle,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  Phone,
  Menu, // Ícone do menu hambúrguer
} from "lucide-react";

import { EditMetaModal } from "./components/edit-meta-modal";
import { ResgateModal } from "./components/resgate-modal";
import Link from "next/link"; // Para o botão Ver Todos

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const mesAnoIso = startOfMonth.toISOString().split('T')[0];

  // Busca perfil e meta do mês atual em paralelo
  const [profileRes, metaRes] = await Promise.all([
    supabase.from("profiles").select("company_name, comissao_padrao").eq("id", userId).single(),
    supabase.from("metas").select("valor_meta").eq("user_id", userId).eq("mes_ano", mesAnoIso).single()
  ]);

  const profile = profileRes.data;
  const meta = metaRes.data?.valor_meta ?? 50000;

  // AJUSTE AQUI: Busca APENAS os 4 pedidos pendentes mais recentes
  const { data: pendingOrders } = await supabase
    .from("pedidos")
    .select("*")
    .eq("user_id", userId)
    .eq("status_ia", "PENDENTE")
    .order("created_at", { ascending: false })
    .limit(4); // Limite de 4 para a Home

  const { data: salesData } = await supabase
    .from("pedidos")
    .select("valor_total")
    .eq("user_id", userId)
    .eq("status_ia", "CONFIRMADO")
    .gte("created_at", startOfMonth.toISOString());

  const totalReached = salesData?.reduce((sum, o) => sum + Number(o.valor_total), 0) ?? 0;
  const commission = totalReached * (profile?.comissao_padrao ?? 0.05);
  const percentage = Math.min(Math.round((totalReached / meta) * 100), 100);

  const { data: inactiveClients } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", userId)
    .gt("dias_inatividade", 15)
    .limit(3);

  return {
    profile,
    pendingOrders: pendingOrders ?? [],
    inactiveClients: inactiveClients ?? [],
    metrics: { totalReached, meta, commission, percentage },
  };
}

export default async function HomePageDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await getDashboardData(user.id);

  return (
    <div className="p-4 lg:p-10 max-w-[1600px] mx-auto space-y-8 bg-[#0F1115] min-h-screen text-slate-200">
      
      {/* 0. Top Navigation / Header (AJUSTADO PARA MOBILE) */}
      <header className="flex flex-row items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter italic">
                ZECA<span className="text-emerald-500">.IA</span>
              </h1>
              <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
              <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-full hidden sm:flex">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sistema Ativo</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-2 font-medium line-clamp-1">
              Painel de controle de <span className="text-slate-200 font-bold">{data.profile?.company_name || "sua empresa"}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Saldo Previsto</p>
            <p className="text-lg font-black text-white">R$ {data.metrics.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
            <Wallet size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>
      </header>

      {/* 1. Main Metrics Grid (Responsivo: 1 col mobile, 3 col desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Progress Card (Ocupa 2 colunas no desktop) */}
        <div className="md:col-span-2 bg-[#16181D] border border-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity hidden md:block">
            <TrendingUp size={140} />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 md:mb-10 relative z-10">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Performance Mensal</p>
                {/* MODAL DE EDIÇÃO DA META */}
                <EditMetaModal 
                  currentMeta={data.metrics.meta} 
                  userId={user.id} 
                />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                R$ {data.metrics.totalReached.toLocaleString("pt-BR")}
              </h2>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-3xl md:text-4xl font-black text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {data.metrics.percentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">atingido</span>
            </div>
          </div>

          <div className="relative h-4 w-full bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-sm mb-6">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-in-out relative"
              style={{ 
                width: `${data.metrics.percentage}%`,
                background: `linear-gradient(90deg, #10b981 0%, #34d399 100%)`,
                boxShadow: '0 0 20px rgba(16,185,129,0.4)'
              }}
            >
              <div className="absolute top-0 right-0 h-full w-4 bg-white/20 blur-sm rounded-full" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex gap-4 md:gap-6">
              <span className="hidden xs:inline">Mínimo: R$ 0</span>
              <span className="text-white italic">Alvo: R$ {data.metrics.meta.toLocaleString("pt-BR")}</span>
            </div>
            <p className="italic hidden sm:block">Sincronizado via IA</p>
          </div>
        </div>

        {/* Commission/CTA Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-white/10 p-8 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
          
          <div className="mb-6 md:mb-0">
            <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-md mb-6 border border-white/10">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-[0.2em] mb-2">Comissão Acumulada</p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              R$ {data.metrics.commission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
          </div>

          {/* COMPONENTE DE RESGATE MODAL */}
          <ResgateModal 
            saldoDisponivel={data.metrics.commission} 
            userId={user.id} 
          />
        </div>
      </div>

      {/* 2. Content Section (Listas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        
        {/* List of Orders */}
        <section className="lg:col-span-2 space-y-6 relative">
          <div className="flex items-center justify-between gap-4 sticky top-0 bg-[#0F1115] py-2 z-10">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <ShoppingCart size={24} className="text-emerald-500" />
              Fila de Conferência
            </h2>
            <div className="flex items-center gap-2">
              <div className="bg-white/5 border border-white/10 px-3 md:px-4 py-1.5 rounded-full hidden xs:block">
                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                  {data.pendingOrders.length === 4 ? "+4 PENDENTES" : `${data.pendingOrders.length} PEDIDOS`}
                </span>
              </div>
              {/* BOTÃO VER TODOS - AJUSTADO PARA MOBILE */}
              <Link href="/dashboard/pedidos" className="text-[10px] font-black text-emerald-500 hover:text-white uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500 px-4 py-2 rounded-xl transition-all">
                Ver Todos
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {data.pendingOrders.length === 0 ? (
              <div className="py-24 border-2 border-dashed border-white/5 rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center bg-white/[0.01]">
                <Package size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest italic text-center px-4">
                  O Zeca está em silêncio... <br />Nenhum pedido novo nas últimas horas.
                </p>
              </div>
            ) : (
              data.pendingOrders.map((order) => (
                <div key={order.id} className="bg-[#16181D] border border-white/5 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] hover:border-emerald-500/30 transition-all group flex flex-col sm:flex-row items-center gap-4 md:gap-6 shadow-lg relative overflow-hidden">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform shrink-0">
                    <MessageSquare className="text-emerald-500" size={24} />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                      <p className="text-base md:text-lg font-black text-white line-clamp-1">{order.cliente_nome}</p>
                      <span className="text-[8px] md:text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-black uppercase border border-emerald-500/20 shrink-0">
                        IA AUDIO ANALYZED
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 md:gap-4">
                      <span className="text-xl md:text-2xl font-black text-white tracking-tighter">
                        R$ {Number(order.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center gap-2.5 bg-black/40 px-3 md:px-4 py-2 rounded-2xl border border-white/5">
                        <Play size={12} className="fill-emerald-500 text-emerald-500" />
                        <div className="w-16 md:w-20 h-[2px] bg-slate-800 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-emerald-500 animate-pulse" />
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">0:14</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto z-10 justify-center sm:justify-start">
                    <button className="flex-1 sm:flex-none bg-emerald-500 text-[#0F1115] font-black px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-widest active:scale-95">
                      Validar
                    </button>
                    <button className="p-3.5 md:p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl transition-all border border-white/5">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sidebar Recuperação (Responsivo: 1 col mobile) */}
        <aside className="space-y-8 lg:sticky lg:top-8 self-start">
          <div>
            <div className="flex items-center justify-between mb-6 gap-2 sticky top-0 bg-[#0F1115] py-2 z-10">
              <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                <AlertCircle size={20} className="text-amber-500" />
                Recuperação
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-black text-[9px] border border-amber-500/20 whitespace-nowrap">
                {data.inactiveClients.length} ALIAS
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {data.inactiveClients.map((client) => (
                <div key={client.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-[1.5rem] group hover:border-amber-500/30 transition-all flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-black text-white line-clamp-1">{client.nome}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                        Inativo há {client.dias_inatividade} dias
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Phone size={14} className="text-amber-500" />
                    </div>
                  </div>
                  <button className="w-full mt-auto bg-white/5 text-white hover:bg-white/10 text-[10px] font-black py-3 rounded-xl transition-all uppercase tracking-[0.15em] border border-white/5">
                    Chamar no Whats
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status do Zeca (Responsivo: Escondido no Mobile xs) */}
          <div className="bg-[#16181D] border border-white/5 p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden shadow-2xl hidden xs:block">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
                <MessageSquare size={28} className="text-emerald-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#16181D] animate-pulse" />
              </div>
              <div>
                <p className="text-xl font-black text-white tracking-tighter italic leading-none uppercase">Zeca Online</p>
                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-1 italic leading-none">Processando Vendas</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Latência</p>
                <p className="text-sm font-mono font-black text-emerald-500 italic">14ms</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Carga</p>
                <p className="text-sm font-mono font-black text-emerald-500 italic">2%</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}