import { CheckCircle2, Mail, Phone, Calendar, Crown, Clock } from "lucide-react";

export function ClientCard({ client }: { client: any }) {
  // Status baseado no campo plan_status que vimos no log
  const isTrial = client.plan_status === "trial";
  const isAtivo = client.plan_status === "active" || isTrial;

  const formattedDate = client.created_at
    ? new Date(client.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Data indisponível";

  return (
    <div className="group relative bg-[#16181D] hover:bg-[#1C1F26] border border-white/5 hover:border-indigo-500/20 rounded-3xl p-6 transition-all duration-300 overflow-hidden shadow-xl shadow-black/20">
      {/* Background Glow Effect no Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            {(client.company_name || client.email || "C").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {client.company_name || "Nome não informado"}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs">
              <span className="bg-white/5 py-0.5 px-2 rounded-md font-mono">ID: {client.id.split('-')[0]}...</span>
            </div>
          </div>
        </div>

        {/* Status Badge Dinâmico */}
        <div className="flex-shrink-0">
          {isTrial ? (
            <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
              <Clock size={12} />
              Trial
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
              <CheckCircle2 size={12} />
              Ativo
            </span>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-3 relative z-10">
        {/* E-mail (O campo que você precisava) */}
        <div className="flex items-center gap-3 text-sm text-slate-300 group-hover:text-white transition-colors">
          <div className="p-1.5 rounded-lg bg-white/5">
            <Mail size={14} className="text-indigo-400" />
          </div>
          <span className="truncate font-medium">{client.email || "Sem e-mail registrado"}</span>
        </div>

        {/* Telefone */}
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="p-1.5 rounded-lg bg-white/5">
            <Phone size={14} className="text-slate-500" />
          </div>
          <span className="font-mono text-xs">{client.whatsapp_business_number || "Sem telefone"}</span>
        </div>

        {/* Data de Cadastro */}
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="p-1.5 rounded-lg bg-white/5">
            <Calendar size={14} className="text-slate-500" />
          </div>
          <span className="text-xs">Membro desde {formattedDate}</span>
        </div>
      </div>

      {/* Footer / Ações */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
           <Crown size={14} className={isTrial ? "text-slate-600" : "text-indigo-400"} />
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
             Plano {client.plan_status || 'Standard'}
           </span>
        </div>
        <button className="text-xs font-bold text-indigo-400 hover:text-white bg-indigo-400/10 hover:bg-indigo-500 transition-all px-4 py-2 rounded-xl border border-indigo-400/20">
          Gerenciar
        </button>
      </div>
    </div>
  );
}