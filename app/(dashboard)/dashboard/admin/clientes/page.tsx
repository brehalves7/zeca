import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { ShieldAlert, Users, LayoutGrid } from "lucide-react";
import { SearchInput } from "./search-input";
import { ClientCard } from "./client-card";

export const metadata = {
  title: "Admin | Clientes Zeca-IA"
};

export default async function AdminClientesPage(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Proteção de Rota Server-Side: Apenas seu e-mail tem acesso
  if (authError || !user || user.email !== "breh_sjp@hotmail.com") {
    redirect("/dashboard");
  }

  // Resolução de SearchParams (Next.js 15+)
  const searchParams = await props.searchParams;
  const searchTerm = searchParams?.query || "";

  // Consulta ao banco (tabela profiles)
  let request = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchTerm) {
    request = request.or(
      `id.eq.${searchTerm},company_name.ilike.%${searchTerm}%,whatsapp_business_number.ilike.%${searchTerm}%`
    );
  }

  const { data: clients, error: fetchError } = await request;

  // ======= LOGS DE MONITORAMENTO (VEJA NO TERMINAL DO VS CODE) =======
  console.log("======= [ÁREA MESTRE] RELATÓRIO DE DADOS =======");
  console.log("Admin logado:", user?.email);
  if (fetchError) {
    console.error("Erro na busca:", fetchError.message);
  } else {
    console.log("Usuários encontrados no banco:", clients?.length || 0);
    if (clients && clients.length > 0) {
      console.log("IDs carregados:", clients.map(c => c.id));
    }
  }
  console.log("================================================");

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 bg-[#0F1115] min-h-screen text-slate-200">
      
      {/* Header Administrativo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-indigo-500/10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <ShieldAlert className="text-indigo-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                Área Mestre
              </h1>
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-black tracking-[0.2em] px-2 py-0.5 rounded-full border border-indigo-500/30 inline-block mt-1">
                Acesso Restrito
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-3">
            Visão gerencial da base de usuários do sistema. Apenas você tem acesso a esta tela.
          </p>
        </div>
      </div>

      {/* Toolbar / Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#16181D]/50 border border-white/5 p-4 rounded-3xl backdrop-blur-md relative z-20">
        <div className="w-full md:w-auto flex-1 max-w-lg">
          <SearchInput />
        </div>

        <div className="flex w-full sm:w-auto bg-[#1A1D24] border border-white/5 p-1 rounded-2xl items-center shadow-inner">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#21242C] text-slate-200 text-sm font-bold shadow-sm transition-all border border-white/10">
            <LayoutGrid size={18} className="text-emerald-500" />
            Grid
          </button>
          
          <div className="flex-1 sm:hidden"></div>

          <div className="px-6 py-3 flex items-center gap-2">
            <Users size={18} className="text-indigo-400" />
            <span className="text-sm font-bold text-slate-400">Total:</span>
            <span className="text-xl font-black text-white leading-none">
              {clients?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Alerta de Erro Crítico */}
      {fetchError && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-8 flex items-center gap-3 font-semibold shadow-lg">
          <ShieldAlert size={24} />
          <div>
            <p>Erro de conexão com o banco de dados.</p>
            <p className="text-xs opacity-70 font-mono">{fetchError.message}</p>
          </div>
        </div>
      )}

      {/* Grid de Cards - Ajuste de Estabilidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {clients && clients.length > 0 ? (
          clients.map((client) => (
            <ClientCard 
              key={client.id} 
              client={client} 
            />
          ))
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <Users size={48} className="text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-200">
              {searchTerm ? "Nenhum cliente encontrado" : "Sua base está vazia"}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              {searchTerm 
                ? `Não encontramos resultados para "${searchTerm}"` 
                : "Os usuários aparecerão aqui assim que a trigger de cadastro for disparada."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}