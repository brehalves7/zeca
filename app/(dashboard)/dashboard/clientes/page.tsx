import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Filter,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AddClienteSection } from "./add-cliente-section";
import { ClienteActions } from "./cliente-actions";
import { SearchInput } from "./search-input";

// Função de busca (mantida como você enviou, pois já está correta)
async function getClientes(userId: string, query?: string) {
  try {
    const supabase = await createClient();

    let request = supabase.from("clientes").select("*").eq("user_id", userId);

    if (query) {
      request = request.or(`nome.ilike.%${query}%,telefone.ilike.%${query}%`);
    }

    const { data, error } = await request.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
    return [];
  }
}

// CORREÇÃO NEXT.JS 15: searchParams agora é uma Promise
export default async function ClientesPage(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  // Aguardamos a resolução dos parâmetros da URL
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const clientes = await getClientes(user.id, query);

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

        <button className="flex items-center gap-2 bg-[#16181D] border border-white/5 px-6 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">
          <Filter size={18} />
          Filtros
        </button>
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
                  Status IA
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Última Atividade
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
                    colSpan={4}
                    className="px-8 py-24 text-center text-slate-500 font-medium"
                  >
                    {query
                      ? `Nenhum resultado para "${query}"`
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
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
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
                      {cliente.dias_inatividade > 15 ? (
                        <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-500/10 w-fit">
                          <AlertCircle size={12} />
                          Inativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-500/10 w-fit">
                          <CheckCircle2 size={12} />
                          Ativo
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                      {cliente.dias_inatividade === 0
                        ? "Hoje"
                        : `Há ${cliente.dias_inatividade} dias`}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-3 text-slate-500 hover:text-emerald-500 transition-all"
                          title="Enviar Mensagem"
                        >
                          <MessageSquare size={20} />
                        </button>

                        <ClienteActions id={cliente.id} nome={cliente.nome} />
                      </div>
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
