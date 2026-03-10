import { createClient } from '@/lib/supabase/server'
import { TrendingUp, ShoppingCart, Package, MessageSquare, ArrowUpRight } from 'lucide-react'

// Funções de busca de dados (Server-side)
async function getMetrics(userId: string) {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [ordersToday, pendingOrders, totalProducts] = await Promise.all([
    supabase
      .from('orders')
      .select('total_value')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString()),
    supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'pendente'),
    supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('user_id', userId),
  ])

  const salesToday = ordersToday.data?.reduce((sum, o) => sum + (Number(o.total_value) || 0), 0) ?? 0

  return {
    salesToday,
    pendingCount: pendingOrders.count ?? 0,
    productCount: totalProducts.count ?? 0,
    ordersCount: ordersToday.data?.length ?? 0,
  }
}

async function getRecentOrders(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

const statusConfig = {
  pendente: { label: 'Pendente', cls: 'badge badge-yellow' },
  confirmado: { label: 'Confirmado', cls: 'badge badge-green' },
  cancelado: { label: 'Cancelado', cls: 'badge badge-red' },
}

// COMPONENTE PRINCIPAL (Server Component)
export default async function HomePageDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [metrics, recentOrders, profile] = await Promise.all([
    getMetrics(user.id),
    getRecentOrders(user.id),
    supabase.from('profiles').select('company_name').eq('id', user.id).single(),
  ])

  const companyName = profile.data?.company_name ?? 'Sua distribuidora'

  const metricCards = [
    { label: 'Vendas hoje', value: `R$ ${metrics.salesToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Pedidos pendentes', value: String(metrics.pendingCount), icon: ShoppingCart, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { label: 'Produtos cadastrados', value: String(metrics.productCount), icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
    { label: 'Pedidos hoje', value: String(metrics.ordersCount), icon: ArrowUpRight, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
  ]

  return (
    <div className="p-1">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">Olá, {companyName} 👋</h1>
        <p className="text-slate-400 text-sm">Aqui está um resumo do seu dia no Zeca.ai</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((card, i) => (
          <div key={i} className="glass-card-sm p-5 border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.bg} ${card.border}`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom Grid: Recent Orders + WhatsApp Status */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Recent Orders */}
        <div className="glass-card p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Pedidos Recentes</h2>
            <a href="/dashboard/pedidos" className="text-sm text-green-500 font-semibold hover:text-green-400 transition-colors">Ver todos →</a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShoppingCart size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Nenhum pedido processado hoje</p>
              <p className="text-xs opacity-60">As vendas do WhatsApp aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div>
                    <p className="text-sm font-bold text-slate-100">{order.client_name}</p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">ID: {order.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={statusConfig[order.status as keyof typeof statusConfig]?.cls ?? 'badge badge-slate text-[10px]'}>
                      {statusConfig[order.status as keyof typeof statusConfig]?.label ?? order.status}
                    </span>
                    <p className="text-sm font-black text-white">R$ {Number(order.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp Status Card */}
        <div className="glass-card p-6 border border-white/5">
          <h2 className="text-lg font-bold text-white mb-6">Status do Sistema</h2>
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center relative mb-4">
              <MessageSquare size={32} className="text-green-500" />
              <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f172a] shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
            </div>
            <div className="text-center mb-6">
              <p className="text-xl font-bold text-green-500">Zeca Online</p>
              <p className="text-xs text-slate-400 mt-1">IA processando via WhatsApp</p>
            </div>
            <div className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest mb-1">Monitoramento</p>
              <p className="text-sm text-slate-300 font-bold tracking-tight">Pronto para receber áudios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}