import { createClient } from "@/lib/supabase/server";
import {
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { AddClienteSection } from "./add-cliente-section";
import { ClienteActions } from "./cliente-actions";
import { SearchInput } from "./search-input";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função de busca
async function getClientes(userId: string, query?: string) {
  try {
    const supabase = await createClient();

    // 1. Busca Clientes (Query Simples para evitar erro de relação)
    let requestClients = supabase
      .from("clientes")
      .select("*")
      .eq("user_id", userId);

    if (query) {
      requestClients = requestClients.or(`nome.ilike.%${query}%,telefone.ilike.%${query}%`);
    }

    const { data: clients, error: errorClients } = await requestClients.order("created_at", {
      ascending: false,
    });

    if (errorClients) {
      console.error("❌ [CLIENTES] Erro ao buscar:", errorClients.message, errorClients.details);
      throw errorClients;
    }

    // 2. Busca Pedidos em query separada (Safe Query)
    const { data: pedidos, error: errorPedidos } = await supabase
      .from("pedidos")
      .select("valor_total, status, created_at, cliente_id")
      .eq("user_id", userId);

    if (errorPedidos) {
      console.warn("⚠️ [PEDIDOS] Erro ao buscar pedidos vinculados:", errorPedidos.message);
    }

    const allPedidos = pedidos || [];

    // 3. Processar dados financeiros via código (Melhor performance & menos erros de SQL)
    const processed = (clients ?? []).map(cliente => {
      // Filtra pedidos pertencentes a este cliente específico
      // Garantimos comparação robusta (toString) caso um seja ID numérico e outro String
      const pedidosDoCliente = allPedidos.filter((p: any) => 
        p.cliente_id && p.cliente_id.toString() === cliente.id.toString()
      );

      const totalComprado = pedidosDoCliente
        .filter((o: any) => o.status !== 'CANCELADO')
        .reduce((sum: number, o: any) => sum + Number(o.valor_total || 0), 0);
      
      const totalPendente = pedidosDoCliente
        .filter((o: any) => o.status === 'PENDENTE')
        .reduce((sum: number, o: any) => sum + Number(o.valor_total || 0), 0);
      
      const lastOrder = pedidosDoCliente.length > 0
        ? pedidosDoCliente.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null;

      return {
        ...cliente,
        totalComprado: totalComprado || 0,
        totalPendente: totalPendente || 0,
        lastOrder
      };
    });

    return processed;
  } catch (err: any) {
    console.error("🚨 [CRÍTICO] Falha completa na listagem de clientes:", {
      message: err.message,
      details: err.details,
      hint: err.hint
    });
    return [];
  }
}

// CORREÇÃO NEXT.JS 15: searchParams agora é uma Promise
export default async function ClientesPage(props: {
  searchParams?: Promise<{ query?: string; filter?: string }>;
}) {
  // Aguardamos a resolução dos parâmetros da URL
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const filter = searchParams?.filter || "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let clientes = await getClientes(user.id, query);

  // Aplicação do filtro de inadimplentes (pendentes) no servidor
  if (filter === "pendente") {
    clientes = clientes.filter(c => c.totalPendente > 0);
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 bg-[#0F1115] min-h-screen text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Users className="text-emerald-500" size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Clientes
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Gerencie sua base de {clientes.length} contatos ativos no Zeca-IA.
          </p>
        </div>

        <AddClienteSection />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <SearchInput />

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/clientes"
            className={`px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${!filter ? "bg-white/10 text-white border-white/10" : "bg-[#16181D] text-slate-400 border-white/5 hover:bg-white/5"}`}
          >
            Todos
          </Link>
          <Link
            href="/dashboard/clientes?filter=pendente"
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${filter === "pendente" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-[#16181D] text-slate-400 border-white/5 hover:bg-white/5"}`}
          >
            <AlertCircle size={18} />
            Pendentes
          </Link>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-[#16181D] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Informações do Cliente
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Saldo a Pagar
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Total (LTV)
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Status Financeiro
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Última Compra
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-24 text-center text-slate-500 font-medium"
                  >
                    {query
                      ? `Nenhum resultado para "${query}"`
                      : filter === "pendente" 
                        ? "Nenhum cliente com pedidos pendentes."
                        : "Nenhum cliente encontrado na sua base."}
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all shadow-sm
                          ${cliente.totalPendente > 0 ? "bg-orange-500/10 text-orange-500 shadow-orange-500/5 border border-orange-500/10" : "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10"}`}>
                          {cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {cliente.nome}
                          </p>
                          <p className="text-xs text-slate-500">
                            {cliente.telefone || "Sem telefone"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className={`text-sm font-black italic tracking-tight ${cliente.totalPendente > 0 ? "text-orange-500" : "text-slate-400"}`}>
                        {cliente.totalPendente > 0 
                          ? `R$ ${cliente.totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` 
                          : "Liquidado"}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500/60" />
                        <p className="text-sm font-bold text-white">
                          R$ {cliente.totalComprado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {cliente.totalPendente > 0 ? (
                        <span className="flex items-center gap-1.5 text-orange-500 bg-orange-500/5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-orange-500/10 w-fit">
                          <Clock size={12} />
                          Pendente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-500/10 w-fit">
                          <CheckCircle2 size={12} />
                          Em dia
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {cliente.lastOrder 
                        ? formatDistanceToNow(new Date(cliente.lastOrder), { addSuffix: true, locale: ptBR })
                        : "Nenhuma compra"}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <ClienteActions cliente={cliente} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
