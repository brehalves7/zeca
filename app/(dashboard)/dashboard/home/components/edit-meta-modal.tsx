"use client";

import { useState } from "react";
import { Settings, X, Save, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; // Certifique-se de ter o client side
import { useRouter } from "next/navigation";

export function EditMetaModal({ currentMeta, userId }: { currentMeta: number, userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMeta, setNewMeta] = useState(currentMeta.toString());
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const mesAno = startOfMonth.toISOString().split('T')[0];

    const { error } = await supabase
      .from("metas")
      .upsert({ 
        user_id: userId, 
        mes_ano: mesAno, 
        valor_meta: parseFloat(newMeta) 
      }, { onConflict: 'user_id,mes_ano' });

    if (!error) {
      setIsOpen(false);
      router.refresh(); // Atualiza os dados do Dashboard automaticamente
    } else {
      alert("Erro ao salvar meta: " + error.message);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-emerald-500 group"
      >
        <Settings size={18} className="group-hover:rotate-45 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16181D] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Target className="text-emerald-500" size={20} />
            </div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Ajustar Meta</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">
              Valor da Meta Mensal (R$)
            </label>
            <input 
              type="number"
              value={newMeta}
              onChange={(e) => setNewMeta(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-2xl font-black text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="Ex: 50000"
            />
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
            <p className="text-[10px] text-emerald-500/70 font-bold leading-relaxed uppercase">
              Dica: Ajustar a meta ajuda o Zeca.IA a priorizar clientes com maior potencial de fechamento.
            </p>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0F1115] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Salvando..." : (
              <>
                <Save size={18} />
                CONFIRMAR NOVA META
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}