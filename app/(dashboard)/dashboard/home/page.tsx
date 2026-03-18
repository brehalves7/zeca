import { createClient } from "@/lib/supabase/server";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  MessageSquare,
  Play,
  AlertCircle,
  Zap,
} from "lucide-react";

// Funções de busca de dados (Mantidas as originais)
async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, meta_mensal, comissao_padrao")
    .eq("id", userId)
    .single();

  const { data: pendingOrders } = await supabase
    .from("pedidos")
    .select("*")
    .eq("user_id", userId)
    .eq("status_ia", "PENDENTE")
    .order("created_at", { ascending: false });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: salesData } = await supabase
    .from("pedidos")
    .select("valor_total")
    .eq("user_id", userId)
    .eq("status_ia", "CONFIRMADO")
    .gte("created_at", startOfMonth.toISOString());

  const totalReached =
    salesData?.reduce((sum, o) => sum + Number(o.valor_total), 0) ?? 0;
  const commission = totalReached * (profile?.comissao_padrao ?? 0.05);

  const { data: inactiveClients } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", userId)
    .gt("dias_inatividade", 15)
    .limit(2);

  return {
    profile,
    pendingOrders: pendingOrders ?? [],
    inactiveClients: inactiveClients ?? [],
    metrics: {
      totalReached,
      meta: profile?.meta_mensal ?? 50000,
      commission,
      percentage: Math.min(
        Math.round((totalReached / (profile?.meta_mensal ?? 50000)) * 100),
        100,
      ),
    },
  };
}

export default async function HomePageDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await getDashboardData(user.id);

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 bg-[#0F1115] min-h-screen text-slate-200">
      {/* Header Centralizado */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            Zeca Dashboard
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium text-balance">
            Bem-vindo de volta,{" "}
            {data.profile?.nome?.split(" ")[0] || "Vendedor"}.
          </p>
        </div>
        <div className="hidden md:flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold uppercase tracking-wider">
            Live Status
          </div>
        </div>
      </div>

      {/* 1. Métricas Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#16181D] border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Meta Mensal de Vendas
              </h2>
              <p className="text-3xl font-black text-white">
                R$ {data.metrics.totalReached.toLocaleString("pt-BR")}
              </p>
            </div>
            <span className="text-2xl font-black text-emerald-500">
              {data.metrics.percentage}%
            </span>
          </div>

          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden mb-6 relative">
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] ${
                data.metrics.percentage > 50 ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${data.metrics.percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Meta: R$ {data.metrics.meta.toLocaleString("pt-BR")}
            </span>
            <span>{100 - data.metrics.percentage}% para o objetivo</span>
          </div>
        </div>

        <div className="bg-[#16181D] border border-white/5 p-8 rounded-3xl shadow-2xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} className="text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Comissão Acumulada
          </p>
          <h3 className="text-4xl font-black text-white tracking-tighter">
            R${" "}
            {data.metrics.commission.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-500 text-xs font-bold">
            <Zap size={14} fill="currentColor" />
            <span>Resgate disponível em 12 dias</span>
          </div>
        </div>
      </div>

      {/* 2. Grid de Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fila de Conferência */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-emerald-500" />
              Fila de Conferência
            </h2>
            <span className="text-xs font-bold bg-white/5 px-3 py-1 rounded-full text-slate-400">
              {data.pendingOrders.length} Pendentes
            </span>
          </div>

          <div className="grid gap-3">
            {data.pendingOrders.length === 0 ? (
              <div className="p-20 border-2 border-dashed border-white/5 rounded-[2rem] text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <Package className="text-emerald-500" size={24} />
                </div>
                <p className="text-slate-400 font-medium">
                  Tudo em dia! O Zeca está processando novos áudios.
                </p>
              </div>
            ) : (
              data.pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#16181D] border border-white/5 p-5 rounded-2xl hover:bg-[#1C1F26] transition-all flex items-center gap-6 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {order.cliente_nome}
                      </p>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-tighter">
                        IA Verificado
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                      <span className="text-lg font-black text-white">
                        R$ {Number(order.valor_total).toLocaleString("pt-BR")}
                      </span>

                      {/* Audio Player Mock */}
                      <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                        <Play
                          size={12}
                          className="fill-emerald-500 text-emerald-500 cursor-pointer hover:scale-110 transition-transform"
                        />
                        <div className="w-24 h-[3px] bg-slate-800 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          0:14
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="bg-emerald-500 hover:bg-emerald-400 text-[#0F1115] font-black px-6 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/10">
                      Confirmar
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all">
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sidebar Direita: Proatividade & WhatsApp */}
        <aside className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              Proatividade
            </h2>
            <div className="space-y-3">
              {data.inactiveClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-amber-500/[0.03] border border-amber-500/10 p-5 rounded-3xl relative group hover:bg-amber-500/[0.06] transition-all"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">
                        {client.nome}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Sem pedidos há{" "}
                        <span className="text-amber-500 font-bold">
                          {client.dias_inatividade} dias
                        </span>
                      </p>
                    </div>
                    <button className="w-full bg-white text-[#0F1115] text-xs font-black py-2.5 rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest">
                      Recuperar Cliente
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Status Card */}
          <div className="bg-[#16181D] border border-emerald-500/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />

            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <MessageSquare size={24} className="text-emerald-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#16181D] animate-pulse shadow-[0_0_10px_#10B981]" />
              </div>
              <div>
                <p className="text-lg font-black text-white leading-tight tracking-tighter">
                  Zeca Online
                </p>
                <p className="text-[10px] text-emerald-500/70 uppercase font-black tracking-widest mt-0.5">
                  Conexão Estável
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Response Time
                </span>
                <span className="text-xs font-black text-emerald-500 font-mono">
                  1.2s
                </span>
              </div>
              <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest py-2">
                Listening for audio messages...
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
