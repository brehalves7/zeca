import { CheckCircle2, User, Building, Mail, Phone, Calendar } from "lucide-react";

export function ClientCard({ client }: { client: any }) {
  const isAtivo = true; // Placeholder para status baseado em regras específicas

  const formattedDate = client.created_at
    ? new Date(client.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Data indisponível";

  return (
    <div className="group relative bg-[#16181D] hover:bg-[#1C1F26] border border-white/5 hover:border-emerald-500/20 rounded-3xl p-6 transition-all duration-300 overflow-hidden shadow-xl shadow-black/20">
      {/* Background Glow Effect no Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            {(client.company_name || client.email || "C").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
              {client.company_name || "Nome não informado"}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs">
              <span className="bg-white/5 py-0.5 px-2 rounded-md font-mono">ID: {client.id.split('-')[0]}...</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
            <CheckCircle2 size={12} />
            Ativo
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Mail size={16} className="text-slate-500" />
          <span className="truncate">{client.email || "Sem e-mail registrado"}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Phone size={16} className="text-slate-500" />
          <span>{client.whatsapp_business_number || "Sem telefone"}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Calendar size={16} className="text-slate-500" />
          <span>Cadastrado em {formattedDate}</span>
        </div>
      </div>

      {/* Footer / Ações */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <span className="text-xs text-slate-500 font-medium">Perfil verificado</span>
        <button className="text-xs font-bold text-emerald-500 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 transition-colors px-4 py-2 rounded-xl">
          Detalhes
        </button>
      </div>
    </div>
  );
}
